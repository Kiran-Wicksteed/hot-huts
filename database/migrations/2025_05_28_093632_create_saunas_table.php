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
        Schema::create('saunas', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();          // “Sauna 1”, “Sauna 2”
            $table->tinyInteger('capacity')->default(8);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saunas');
    }
};
