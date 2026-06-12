<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('display_name', 60)->nullable()->after('name');
            $table->enum('theme', ['deenmate', 'dark', 'system'])->default('deenmate')->after('locale');
            $table->json('notification_preferences')->nullable()->after('theme');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['display_name', 'theme', 'notification_preferences']);
        });
    }
};
