<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        /* 0. add columns if missing ----------------------------------------- */
        Schema::table('location_openings', function (Blueprint $t) {
            if (!Schema::hasColumn('location_openings', 'period')) {
                $t->string('period')->nullable();
            }
            if (!Schema::hasColumn('location_openings', 'start_time')) {
                $t->time('start_time')->nullable();
            }
            if (!Schema::hasColumn('location_openings', 'end_time')) {
                $t->time('end_time')->nullable();
            }
        });

        /* 1. split legacy rows with JSON "periods" --------------------------- */
        $rows = DB::table('location_openings')
            ->whereNotNull('periods')
            ->get();

        foreach ($rows as $row) {
            $periodArray = json_decode($row->periods, true) ?: [];

            foreach ($periodArray as $p) {
                [$start, $end] = match ($p) {
                    'morning'   => ['06:00', '11:00'],
                    'afternoon' => ['12:00', '16:00'],
                    'evening'   => ['17:00', '20:00'],
                    'night'     => ['20:00', '23:00'],
                };

                DB::table('location_openings')->insert([
                    'location_id' => $row->location_id,
                    'sauna_id'    => $row->sauna_id,
                    'weekday'     => $row->weekday,
                    'period'      => $p,
                    'start_time'  => $start,
                    'end_time'    => $end,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }

            DB::table('location_openings')->where('id', $row->id)->delete();
        }

        /* 2. drop JSON column if still present ------------------------------ */
        Schema::table('location_openings', function (Blueprint $t) {
            if (Schema::hasColumn('location_openings', 'periods')) {
                $t->dropColumn('periods');
            }
        });
    }

    public function down(): void
    {
        // keep it simple: we won't try to reverse – dev-only migration
    }
};
