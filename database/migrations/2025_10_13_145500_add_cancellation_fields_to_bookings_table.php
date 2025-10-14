<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('cancelled_at')->nullable()->after('updated_at');
            $table->unsignedInteger('cancelled_by')->nullable()->index()->after('cancelled_at');
            $table->string('cancellation_reason')->nullable()->after('cancelled_by');
            $table->integer('refund_amount_cents')->nullable()->after('cancellation_reason');
            $table->string('refund_type')->nullable()->after('refund_amount_cents'); // none, full, partial, coupon
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'cancelled_at',
                'cancelled_by',
                'cancellation_reason',
                'refund_amount_cents',
                'refund_type',
            ]);
        });
    }
};
