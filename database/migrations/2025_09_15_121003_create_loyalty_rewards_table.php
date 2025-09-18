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
        Schema::create('loyalty_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('loyalty_accounts')->cascadeOnDelete();
            $table->foreignId('reward_type_id')->constrained('loyalty_reward_types');
            $table->string('code', 32)->unique(); // human-ish code
            $table->string('status', 20)->index(); // issued|reserved|redeemed|expired|void
            $table->unsignedInteger('issued_points')->default(10);
            $table->timestamp('issued_at');
            $table->timestamp('reserved_at')->nullable();
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedBigInteger('reserved_booking_id')->nullable()->index();
            $table->unsignedBigInteger('redemption_booking_id')->nullable()->index();
            $table->timestamps();

            $table->index(['account_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_rewards');
    }
};
