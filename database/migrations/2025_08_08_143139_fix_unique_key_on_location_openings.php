<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /* 1. Drop legacy 3-column unique key if it exists */
        // SQLite names the index like "{table}_{columns}_unique"
        if (Schema::hasTable('location_openings')) {
            DB::statement(
                'DROP INDEX IF EXISTS location_openings_location_id_weekday_sauna_id_unique'
            );
        }

        /* 2. Add new 3-column key that includes `period` */
        Schema::table('location_openings', function (Blueprint $t) {
            $t->unique(['location_id', 'weekday', 'period'], 'loc_day_per_unique');
        });
    }

    public function down(): void
    {
        Schema::table('location_openings', function (Blueprint $t) {
            $t->dropUnique('loc_day_per_unique');
        });
    }
};
