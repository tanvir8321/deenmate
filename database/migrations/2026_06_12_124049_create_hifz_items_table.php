<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hifz_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('ref_start');
            $table->string('ref_end');
            $table->enum('status', ['learning', 'review']);
            $table->unsignedSmallInteger('ease')->default(250);
            $table->date('next_review_on')->nullable();
            $table->unsignedInteger('interval_days')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hifz_items');
    }
};
