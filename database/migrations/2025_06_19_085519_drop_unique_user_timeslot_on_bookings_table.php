<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // name is what Laravel generated: bookings_user_id_timeslot_id_unique bookings_user_id_timeslot_id_unique
            $table->dropUnique('bookings_user_id_timeslot_id_unique');

            // optional: keep a normal index for fast look-ups
            $table->index(['user_id', 'timeslot_id']);
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'timeslot_id']);
            $table->unique(['user_id', 'timeslot_id']);
        });
    }
};
