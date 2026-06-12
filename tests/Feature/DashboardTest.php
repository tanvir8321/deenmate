<?php

namespace Tests\Feature;

use App\Models\PrayerTimesCache;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_requires_auth(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_dashboard_without_location_has_no_prayer_times(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('prayerTimes', null)
                ->where('hasLocation', false)
                ->has('hijriDate.year')
                ->has('hijriDate.month')
                ->has('hijriDate.day')
            );
    }

    public function test_dashboard_with_dhaka_location_shows_prayer_times(): void
    {
        $user = User::factory()->create([
            'timezone' => 'Asia/Dhaka',
            'lat' => 23.8103,
            'lng' => 90.4125,
            'geohash' => 'wh0r3q',
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
        ]);

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('hasLocation', true)
                ->has('prayerTimes.fajr')
                ->has('prayerTimes.isha')
            );

        $this->assertDatabaseHas('prayer_times_cache', [
            'geohash' => 'wh0r3q',
            'method' => 'karachi',
            'asr_method' => 'hanafi',
        ]);
    }

    public function test_prayer_times_are_served_from_cache_on_second_request(): void
    {
        $user = User::factory()->create([
            'timezone' => 'Asia/Dhaka',
            'lat' => 23.8103,
            'lng' => 90.4125,
            'geohash' => 'wh0r3q',
        ]);

        $this->actingAs($user)->get('/dashboard')->assertOk();
        $this->assertSame(1, PrayerTimesCache::count());

        $this->actingAs($user)->get('/dashboard')->assertOk();
        $this->assertSame(1, PrayerTimesCache::count());
    }

    public function test_dashboard_with_location_includes_next_prayer(): void
    {
        $user = User::factory()->create([
            'timezone' => 'Asia/Dhaka',
            'lat' => 23.8103,
            'lng' => 90.4125,
            'geohash' => 'wh0r3q',
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
        ]);

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('hasLocation', true)
                ->has('nextPrayer.name')
                ->has('nextPrayer.at')
            );
    }

    public function test_dashboard_without_location_has_null_next_prayer(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('nextPrayer', null)
            );
    }
}
