<?php

namespace App\Support;

final class Geohash
{
    private const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

    public static function encode(float $lat, float $lng, int $precision = 6): string
    {
        $latRange = [-90.0, 90.0];
        $lngRange = [-180.0, 180.0];
        $hash = '';
        $bit = 0;
        $ch = 0;
        $even = true;

        while (strlen($hash) < $precision) {
            if ($even) {
                $mid = ($lngRange[0] + $lngRange[1]) / 2;
                if ($lng >= $mid) {
                    $ch = ($ch << 1) | 1;
                    $lngRange[0] = $mid;
                } else {
                    $ch <<= 1;
                    $lngRange[1] = $mid;
                }
            } else {
                $mid = ($latRange[0] + $latRange[1]) / 2;
                if ($lat >= $mid) {
                    $ch = ($ch << 1) | 1;
                    $latRange[0] = $mid;
                } else {
                    $ch <<= 1;
                    $latRange[1] = $mid;
                }
            }

            $even = ! $even;

            if (++$bit === 5) {
                $hash .= self::BASE32[$ch];
                $bit = 0;
                $ch = 0;
            }
        }

        return $hash;
    }

    /**
     * @return array{lat: float, lng: float}
     */
    public static function decode(string $hash): array
    {
        $latRange = [-90.0, 90.0];
        $lngRange = [-180.0, 180.0];
        $even = true;

        foreach (str_split(strtolower($hash)) as $char) {
            $idx = strpos(self::BASE32, $char);
            if ($idx === false) {
                continue;
            }
            for ($i = 4; $i >= 0; $i--) {
                $bit = ($idx >> $i) & 1;
                if ($even) {
                    $mid = ($lngRange[0] + $lngRange[1]) / 2;
                    $lngRange[$bit ? 0 : 1] = $mid;
                } else {
                    $mid = ($latRange[0] + $latRange[1]) / 2;
                    $latRange[$bit ? 0 : 1] = $mid;
                }
                $even = ! $even;
            }
        }

        return [
            'lat' => ($latRange[0] + $latRange[1]) / 2,
            'lng' => ($lngRange[0] + $lngRange[1]) / 2,
        ];
    }
}
