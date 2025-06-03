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
        Schema::create('timeslots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sauna_schedule_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->dateTime('starts_at');                         // 07:00
            $table->dateTime('ends_at');                           // 07:15
            $table->tinyInteger('capacity')->default(8);
            $table->timestamps();
            $table->unique(['sauna_schedule_id', 'starts_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timeslots');
    }
};
