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
            // Use the index name that SQLite created
            $table->dropUnique('sauna_schedules_sauna_id_date_period_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sauna_schedules', function (Blueprint $table) {
            $table->unique(['sauna_id', 'date']);
        });
    }
};
