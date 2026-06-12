<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('timezone', 40)->default('UTC');
            $table->string('locale', 10)->default('en');
            $table->char('geohash', 6)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->enum('calc_method', [
                'mwl', 'isna', 'egypt', 'karachi', 'umm_al_qura', 'tehran', 'gulf', 'moonsighting',
            ])->default('karachi');
            $table->enum('asr_method', ['standard', 'hanafi'])->default('hanafi');
            $table->enum('high_lat_rule', ['none', 'middle_of_night', 'one_seventh', 'angle_based'])->default('none');
            $table->time('quiet_start')->nullable();
            $table->time('quiet_end')->nullable();
            $table->timestamp('onboarded_at')->nullable();
        });

        Schema::create('prayer_times_cache', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->char('geohash', 6);
            $table->enum('method', ['mwl', 'isna', 'egypt', 'karachi', 'umm_al_qura', 'tehran', 'gulf', 'moonsighting']);
            $table->enum('asr_method', ['standard', 'hanafi']);
            $table->enum('high_lat_rule', ['none', 'middle_of_night', 'one_seventh', 'angle_based']);
            $table->json('times');
            $table->unique(['date', 'geohash', 'method', 'asr_method', 'high_lat_rule'], 'prayer_times_cache_unique');
            $table->index(['date', 'geohash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prayer_times_cache');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'timezone', 'locale', 'geohash', 'lat', 'lng',
                'calc_method', 'asr_method', 'high_lat_rule',
                'quiet_start', 'quiet_end', 'onboarded_at',
            ]);
        });
    }
};
