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
        Schema::table('loyalty_rewards', function (Blueprint $t) {
            $t->string('reserved_token', 64)->nullable()->index()->after('reserved_booking_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loyalty_rewards', function (Blueprint $t) {
            $t->dropColumn('reserved_token');
        });
    }
};
