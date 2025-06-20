<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('location_openings', function (Blueprint $table) {
            $table->foreignId('sauna_id')
                ->after('location_id')
                ->constrained()
                ->cascadeOnDelete();

            // the combo (location, weekday, sauna) should be unique
            $table->unique(
                ['location_id', 'weekday', 'sauna_id'],
                'loc_day_sauna_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('location_openings', function (Blueprint $table) {
            $table->dropUnique('loc_day_sauna_unique');
            $table->dropConstrainedForeignId('sauna_id');
        });
    }
};
