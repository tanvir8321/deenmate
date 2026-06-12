<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quran_progress', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->unsignedInteger('pages_read');
            $table->string('from_ref');
            $table->string('to_ref');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quran_progress');
    }
};
