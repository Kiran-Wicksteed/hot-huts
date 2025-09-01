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
            $table->uuid('cart_key')->nullable()->index()->after('user_id');

            // 1 hold per user+cart per slot/event
            $table->unique(['user_id', 'cart_key', 'timeslot_id'], 'uniq_user_cart_slot');
            $table->unique(['user_id', 'cart_key', 'event_occurrence_id'], 'uniq_user_cart_event');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique('uniq_user_cart_slot');
            $table->dropUnique('uniq_user_cart_event');
            $table->dropColumn('cart_key');
        });
    }
};
