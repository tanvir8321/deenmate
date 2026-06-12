<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goal_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained()->cascadeOnDelete();
            $table->string('period_key');
            $table->unsignedInteger('current_value')->default(0);
            $table->timestamps();

            $table->unique(['goal_id', 'period_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goal_progress');
    }
};
