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
        Schema::create('retail_sales', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('retail_item_id')->index();
            $table->unsignedBigInteger('location_id')->nullable()->index();
            $table->integer('quantity')->default(1);
            $table->integer('price_each'); // Price at time of sale (in cents)
            $table->integer('total_cents'); // quantity * price_each
            $table->date('sale_date'); // Date of sale
            $table->text('note')->nullable(); // Optional note
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retail_sales');
    }
};
