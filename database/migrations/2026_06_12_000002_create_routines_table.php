<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('category', ['salah', 'adhkar', 'quran', 'fasting', 'finance', 'general'])->default('general');
            $table->json('recurrence');
            $table->enum('anchor', ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'])->nullable();
            $table->integer('offset_minutes')->default(0);
            $table->time('fixed_time')->nullable();
            $table->boolean('reminder_enabled')->default(false);
            $table->boolean('nag_mode')->default(false);
            $table->date('starts_on');
            $table->date('ends_on')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('source_template_id')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routines');
    }
};
