<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /* ----------------------------------------------------------
         * SQLite: drop the legacy index if it exists
         * ---------------------------------------------------------- */
        // exact old name produced by Laravel: table_col1_col2_col3_unique
        DB::statement(
            'DROP INDEX IF EXISTS location_openings_location_id_weekday_sauna_id_unique'
        );

        /* ----------------------------------------------------------
         * Create the new 4-column unique key
         * (location_id + weekday + sauna_id + period)
         * ---------------------------------------------------------- */
        DB::statement(
            'CREATE UNIQUE INDEX loc_open_unique
             ON location_openings (location_id, weekday, sauna_id, period)'
        );
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS loc_open_unique');
    }
};
