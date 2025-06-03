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
        Schema::table('newsletters', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'newsletter_id')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->dropForeign(['newsletter_id']);
                    $table->dropColumn('newsletter_id');
                });
            }

            Schema::dropIfExists('newsletters');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('newsletters', function (Blueprint $table) {
            //
        });
    }
};
