<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Materialized ONLY on user interaction (done/skip) or rollover (missed).
        // No partitioning: MySQL forbids FKs on partitioned tables; the
        // composite (user_id, due_date) index carries the load.
        Schema::create('task_instances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('routine_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->date('due_date');
            $table->dateTime('due_at')->nullable();
            $table->enum('status', ['done', 'skipped', 'missed']);
            $table->dateTime('completed_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'routine_id', 'due_date']);
            $table->index(['user_id', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_instances');
    }
};
