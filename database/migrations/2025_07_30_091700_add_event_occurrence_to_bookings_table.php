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
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('event_occurrence_id')
                ->nullable()
                ->after('timeslot_id');

            $table->foreign('event_occurrence_id')
                ->references('id')
                ->on('event_occurrences')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['event_occurrence_id']);
            $table->dropColumn('event_occurrence_id');
        });
    }
};
