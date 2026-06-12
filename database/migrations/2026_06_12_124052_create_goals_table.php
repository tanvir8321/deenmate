<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('period', ['daily', 'monthly', 'yearly']);
            $table->enum('period_basis', ['gregorian', 'hijri'])->default('gregorian');
            $table->unsignedInteger('target_value');
            $table->enum('unit', ['count', 'pages', 'amount', 'days']);
            $table->enum('metric_source', ['routine_completions', 'salah_jamaat', 'quran_pages', 'fasts', 'manual']);
            $table->json('linked_routine_ids')->nullable();
            $table->date('starts_on');
            $table->date('ends_on')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
