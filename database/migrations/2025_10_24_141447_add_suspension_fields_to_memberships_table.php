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
        Schema::table('memberships', function (Blueprint $table) {
            $table->timestamp('suspended_from')->nullable()->after('cancelled_at');
            $table->timestamp('suspended_until')->nullable()->after('suspended_from');
            $table->text('suspension_reason')->nullable()->after('suspended_until');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('memberships', function (Blueprint $table) {
            $table->dropColumn(['suspended_from', 'suspended_until', 'suspension_reason']);
        });
    }
};
