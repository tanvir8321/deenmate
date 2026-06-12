<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('provider');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('USD');
            $table->string('external_id')->nullable();
            $table->timestamp('donated_at')->nullable();
            $table->timestamps();

            $table->index('donated_at');
            $table->index(['provider', 'external_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
