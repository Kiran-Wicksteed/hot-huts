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
        Schema::create('loyalty_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('loyalty_accounts')->cascadeOnDelete();
            $table->string('type', 20); // earn|convert|redeem|adjust|reversal
            $table->integer('points');  // signed
            $table->string('source_type', 40); // Booking|Admin|System|Reward
            $table->unsignedBigInteger('source_id');
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['account_id', 'occurred_at']);
            // Idempotency guard: at most one ledger row for a given (type,source) tuple
            $table->unique(['type', 'source_type', 'source_id'], 'ledger_unique_event');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_ledger');
    }
};
