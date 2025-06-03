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
        if (Schema::hasColumn('users', 'organization_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }

        // ----- 2. resources table -----
        if (Schema::hasColumn('resources', 'organization_id')) {
            Schema::table('resources', function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }

        if (Schema::hasColumn('policies', 'organization_id')) {
            Schema::table('policies', function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }
        if (Schema::hasColumn('events', 'organization_id')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }
        if (Schema::hasColumn('chats', 'organization_id')) {
            Schema::table('chats', function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }

        // ----- 3. finally drop organisations -----
        Schema::dropIfExists('organizations');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            //
        });
    }
};
