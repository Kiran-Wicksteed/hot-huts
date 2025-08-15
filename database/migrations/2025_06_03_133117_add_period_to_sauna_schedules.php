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
    public function up(): void
    {
        // Check if index exists before dropping
        $indexes = DB::select("SHOW INDEXES FROM sauna_schedules");
        $indexNames = array_column($indexes, 'Key_name');

        if (in_array('sauna_schedules_sauna_id_date_period_unique', $indexNames)) {
            DB::statement('ALTER TABLE sauna_schedules DROP INDEX sauna_schedules_sauna_id_date_period_unique');
        }
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
