<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sauna_schedules', function (Blueprint $table) {
            $table->id();

            // relations
            $table->foreignId('sauna_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();

            // slot info
            $table->date('date');
            $table->string('period', 20); // 'morning' | 'afternoon' | 'evening' | 'night'

            $table->timestamps();

            // prevent duplicate slots
            $table->unique(['sauna_id', 'location_id', 'date', 'period'], 'sauna_sched_unique');
        });

        // Add a CHECK constraint where supported (NOT on SQLite)
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            // MySQL 8.0.16+ only. Older MySQL will ignore CHECK but statement is harmless.
            DB::statement("
                ALTER TABLE `sauna_schedules`
                ADD CONSTRAINT `sauna_schedules_period_chk`
                CHECK (`period` IN ('morning','afternoon','evening','night'))
            ");
        } elseif ($driver === 'pgsql') {
            DB::statement("
                ALTER TABLE sauna_schedules
                ADD CONSTRAINT sauna_schedules_period_chk
                CHECK (period IN ('morning','afternoon','evening','night'))
            ");
        }
        // For SQLite, rely on app validation for allowed values.
    }

    public function down(): void
    {
        // Dropping the table will drop the constraint as well
        Schema::dropIfExists('sauna_schedules');
    }
};
