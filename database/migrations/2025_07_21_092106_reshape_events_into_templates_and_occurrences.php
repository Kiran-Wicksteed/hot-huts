<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        DB::transaction(function () {

            // 1. Rename existing table so current data is preserved
            Schema::rename('events', 'event_occurrences');

            // 2. Create the new template table
            Schema::create('events', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->unsignedInteger('default_price')->nullable();
                $table->unsignedInteger('default_capacity')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });

            // 3. Add missing columns / indexes on the renamed table
            Schema::table('event_occurrences', function (Blueprint $table) {
                $table->unsignedBigInteger('event_id')->nullable()->after('id');
                $table->date('occurs_on')->nullable()->after('event_id');
                $table->time('start_time')->change();
                $table->time('end_time')->change();

                $table->unsignedInteger('price')->nullable()->change();
                $table->unsignedInteger('capacity')->nullable()->change();

                $table->foreign('event_id')->references('id')->on('events')
                    ->cascadeOnDelete();

                $table->unique(['event_id', 'occurs_on', 'start_time'], 'event_occ_unique');
            });

            // 4. Seed one template per distinct original row and point occurrences to it
            $templates = collect(DB::table('event_occurrences')->get())
                ->groupBy(fn(object $row) => "{$row->name}|{$row->description}")
                ->map(function ($group) {
                    $first = $group->first();
                    return DB::table('events')->insertGetId([
                        'name'             => $first->name,
                        'description'      => $first->description,
                        'default_price'    => $first->price,
                        'default_capacity' => $first->capacity,
                        'is_active'        => $first->is_active,
                        'created_at'       => now(),
                        'updated_at'       => now(),
                    ]);
                });

            // 5. Back-fill FK + occurs_on on each old record
            DB::table('event_occurrences')->orderBy('id')->chunkById(500, function ($chunk) use ($templates) {
                foreach ($chunk as $row) {
                    $tplId = $templates["{$row->name}|{$row->description}"];
                    DB::table('event_occurrences')
                        ->where('id', $row->id)
                        ->update([
                            'event_id'  => $tplId,
                            'occurs_on' => $row->start_time ? Carbon\Carbon::parse($row->start_time)->toDateString() : null,
                        ]);
                }
            });

            // 6. Drop columns now duplicated on template
            Schema::table('event_occurrences', function (Blueprint $table) {
                $table->dropColumn(['name', 'description']); // keep price/capacity if you want overrides
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // For simplicity, just abort: reversing this automatically is messy
        throw new \RuntimeException('Migration cannot be reversed automatically.');
    }
};
