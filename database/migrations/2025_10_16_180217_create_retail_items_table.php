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
        Schema::create('retail_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->integer('price_cents'); // Store price in cents
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Pivot table for booking <-> retail items
        Schema::create('booking_retail_item', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id')->index();
            $table->unsignedBigInteger('retail_item_id')->index();
            $table->integer('quantity')->default(1);
            $table->integer('price_each'); // Price at time of sale (in cents)
            $table->integer('line_total'); // quantity * price_each
            $table->timestamps();
            
            // Skip foreign key constraints to avoid type mismatch issues
            // Relationships will be handled at the application level
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_retail_item');
        Schema::dropIfExists('retail_items');
    }
};
