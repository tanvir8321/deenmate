<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_settings_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/settings');

        $response->assertOk();
    }

    public function test_settings_page_requires_auth(): void
    {
        $this->get('/settings')->assertRedirect('/login');
    }

    public function test_settings_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patch('/settings', [
            'timezone' => 'Asia/Dhaka',
            'locale' => 'bn',
            'lat' => 23.8103,
            'lng' => 90.4125,
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
            'hijri_offset' => -1,
            'quiet_start' => '23:00',
            'quiet_end' => '06:00',
        ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $user->refresh();
        $this->assertSame('Asia/Dhaka', $user->timezone);
        $this->assertSame('bn', $user->locale);
        $this->assertSame('karachi', $user->calc_method);
        $this->assertSame('hanafi', $user->asr_method);
        $this->assertSame(-1, $user->hijri_offset);
        $this->assertNotNull($user->onboarded_at);
    }

    public function test_geohash_is_computed_from_coordinates(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patch('/settings', [
            'timezone' => 'Asia/Dhaka',
            'locale' => 'en',
            'lat' => 23.8103,
            'lng' => 90.4125,
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
            'hijri_offset' => 0,
        ]);

        $user->refresh();
        // Dhaka geohash(6) per geohash.org.
        $this->assertSame('wh0r3q', $user->geohash);
    }

    public function test_invalid_settings_are_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patch('/settings', [
            'timezone' => 'Not/AZone',
            'locale' => 'xx',
            'calc_method' => 'bogus',
            'asr_method' => 'bogus',
            'high_lat_rule' => 'bogus',
            'hijri_offset' => 9,
        ]);

        $response->assertSessionHasErrors([
            'timezone', 'locale', 'calc_method', 'asr_method', 'high_lat_rule', 'hijri_offset',
        ]);
    }

    public function test_latitude_requires_longitude(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patch('/settings', [
            'timezone' => 'UTC',
            'locale' => 'en',
            'lat' => 23.8,
            'lng' => null,
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
            'hijri_offset' => 0,
        ]);

        $response->assertSessionHasErrors(['lng']);
    }
}
