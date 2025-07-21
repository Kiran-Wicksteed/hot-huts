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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "Sound Bath with Leandra Besters"
            $table->text('description');
            $table->dateTime('start_time'); // The exact start date and time
            $table->dateTime('end_time');   // The exact end date and time
            $table->decimal('price', 8, 2); // The fixed price for the event
            $table->integer('capacity');    // How many people can book this event
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
