<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salah_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->enum('prayer', ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
            $table->enum('status', ['jamaat', 'alone', 'qada', 'missed']);
            $table->unique(['user_id', 'date', 'prayer']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salah_logs');
    }
};
