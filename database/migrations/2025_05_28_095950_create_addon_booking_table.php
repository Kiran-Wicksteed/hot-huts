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
        Schema::create('addon_booking', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('addon_id')->constrained()->cascadeOnDelete();

            $table->tinyInteger('quantity')->default(1);
            $table->decimal('price_each', 8, 2);           // copied from addons.price
            $table->decimal('line_total', 8, 2);           // quantity × price_each

            $table->timestamps();
            $table->unique(['booking_id', 'addon_id']);    // one row per addon per booking
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addon_booking');
    }
};
