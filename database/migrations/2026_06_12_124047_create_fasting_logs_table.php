<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fasting_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->enum('type', ['ramadan', 'monday_thursday', 'ayyam_beedh', 'qada', 'nafl', 'arafah', 'ashura']);
            $table->enum('status', ['completed', 'broken', 'intended']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fasting_logs');
    }
};
