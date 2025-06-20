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
        Schema::table('sauna_schedules', function (Blueprint $table) {
            $table->enum('period', ['morning', 'evening'])
                ->default('morning')
                ->after('date');

            // allow two rows (morning, evening) on the same day
            $table->dropUnique(['sauna_id', 'date']);
            $table->unique(['sauna_id', 'date', 'period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sauna_schedules', function (Blueprint $table) {
            $table->dropUnique(['sauna_id', 'date', 'period']);
            $table->unique(['sauna_id', 'date']);
            $table->dropColumn('period');
        });
    }
};
