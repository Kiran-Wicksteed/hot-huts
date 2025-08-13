<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /* -------------------------------------------------
         * 1. Get all indexes for the table
         * ------------------------------------------------- */
        $indexes = DB::select(
            'PRAGMA index_list("location_openings")'
        );

        /* -------------------------------------------------
         * 2. Drop every *unique* index that does NOT
         *    include the `period` column
         * ------------------------------------------------- */
        foreach ($indexes as $idx) {
            if ((int) $idx->unique !== 1) {
                continue;                       // not unique → ignore
            }

            // list the columns of this index
            $cols = DB::select(
                'PRAGMA index_info("' . $idx->name . '")'
            );
            $colNames = array_column($cols, 'name');

            if (! in_array('period', $colNames, true)) {
                DB::statement('DROP INDEX IF EXISTS "' . $idx->name . '"');
            }
        }

        /* -------------------------------------------------
         * 3. Ensure ONE correct 4-column unique key exists
         * ------------------------------------------------- */
        DB::statement('DROP INDEX IF EXISTS loc_open_unique');

        DB::statement(
            'CREATE UNIQUE INDEX loc_open_unique
             ON location_openings (location_id, weekday, sauna_id, period)'
        );
    }

    public function down(): void
    {
        // you can simply drop the 4-col key on rollback
        DB::statement('DROP INDEX IF EXISTS loc_open_unique');
    }
};
