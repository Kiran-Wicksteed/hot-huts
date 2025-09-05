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
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('indemnity_consented_at')->nullable()->after('remember_token');

            // What they typed as their name when accepting
            $table->string('indemnity_name')->nullable()->after('indemnity_consented_at');

            // Version tag of the indemnity text presented
            $table->string('indemnity_version', 32)->nullable()->after('indemnity_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['indemnity_consented_at', 'indemnity_name', 'indemnity_version']);
        });
    }
};
