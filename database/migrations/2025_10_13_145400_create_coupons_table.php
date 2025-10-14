<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->unsignedInteger('user_id')->index();
            $table->unsignedBigInteger('source_booking_id')->nullable()->index();
            $table->string('type')->default('refund'); // refund, promotional, loyalty
            $table->integer('original_value_cents'); // original value in cents
            $table->integer('remaining_value_cents'); // remaining value in cents
            $table->timestamp('expires_at')->nullable();
            $table->string('status')->default('active')->index(); // active, fully_redeemed, expired, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('code');
        });

        Schema::create('coupon_redemptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('coupon_id')->index();
            $table->unsignedBigInteger('booking_id')->index();
            $table->integer('amount_cents'); // amount redeemed in this transaction
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_redemptions');
        Schema::dropIfExists('coupons');
    }
};
