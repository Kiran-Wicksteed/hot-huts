<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // drop any existing index with that name
        DB::statement('DROP INDEX IF EXISTS loc_open_unique');

        // rebuild with the correct four columns
        DB::statement(
            'CREATE UNIQUE INDEX loc_open_unique
             ON location_openings (location_id, weekday, sauna_id, period)'
        );
    }

    public function down(): void
    {
        // optional: recreate the old three-column version on rollback
        DB::statement('DROP INDEX IF EXISTS loc_open_unique');
        DB::statement(
            'CREATE UNIQUE INDEX loc_open_unique
             ON location_openings (location_id, weekday, sauna_id)'
        );
    }
};
