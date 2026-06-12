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
            'theme' => 'deenmate',
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
            'theme' => 'deenmate',
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
            'theme' => 'bogus',
            'calc_method' => 'bogus',
            'asr_method' => 'bogus',
            'high_lat_rule' => 'bogus',
            'hijri_offset' => 9,
        ]);

        $response->assertSessionHasErrors([
            'timezone', 'locale', 'theme', 'calc_method', 'asr_method', 'high_lat_rule', 'hijri_offset',
        ]);
    }

    public function test_latitude_requires_longitude(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patch('/settings', [
            'timezone' => 'UTC',
            'locale' => 'en',
            'theme' => 'deenmate',
            'lat' => 23.8,
            'lng' => null,
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
            'hijri_offset' => 0,
        ]);

        $response->assertSessionHasErrors(['lng']);
    }

    public function test_settings_page_renders_full_width_container(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/settings')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Settings/Index')
                ->has('settings.timezone')
                ->has('settings.locale')
                ->has('settings.calc_method')
                ->has('notificationPreferences')
                ->has('accountInfo.email')
            );
    }

    public function test_display_name_and_theme_can_be_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patch('/settings', [
            'timezone' => 'UTC',
            'locale' => 'en',
            'theme' => 'dark',
            'display_name' => 'Ahmad',
            'lat' => null,
            'lng' => null,
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
            'hijri_offset' => 0,
        ])->assertSessionHasNoErrors()->assertRedirect();

        $user->refresh();
        $this->assertSame('Ahmad', $user->display_name);
        $this->assertSame('dark', $user->theme);
    }

    public function test_display_name_max_length_is_enforced(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patch('/settings', [
            'timezone' => 'UTC',
            'locale' => 'en',
            'theme' => 'deenmate',
            'display_name' => str_repeat('a', 61),
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
            'hijri_offset' => 0,
        ])->assertSessionHasErrors('display_name');
    }

    public function test_theme_must_be_valid(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patch('/settings', [
            'timezone' => 'UTC',
            'locale' => 'en',
            'theme' => 'rainbow',
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
            'hijri_offset' => 0,
        ])->assertSessionHasErrors('theme');
    }

    public function test_notification_preferences_can_be_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patch('/settings', [
            'timezone' => 'UTC',
            'locale' => 'en',
            'theme' => 'deenmate',
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
            'hijri_offset' => 0,
            'notification_preferences' => [
                'salah_reminder' => true,
                'morning_briefing' => false,
                'evening_briefing' => true,
                'adhkar_reminder' => true,
                'fasting_reminder' => false,
                'weekly_report' => true,
            ],
        ])->assertSessionHasNoErrors();

        $user->refresh();
        $prefs = $user->getAttribute('notification_preferences');
        $this->assertIsArray($prefs);
        $this->assertTrue($prefs['salah_reminder']);
        $this->assertFalse($prefs['morning_briefing']);
        $this->assertTrue($prefs['evening_briefing']);
        $this->assertTrue($prefs['weekly_report']);
    }

    public function test_default_notification_preferences_are_exposed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/settings')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('notificationPreferences.salah_reminder', true)
                ->where('notificationPreferences.morning_briefing', true)
                ->where('notificationPreferences.evening_briefing', false)
                ->where('notificationPreferences.weekly_report', false)
            );
    }
}
