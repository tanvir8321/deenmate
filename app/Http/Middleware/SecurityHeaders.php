<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SecurityHeaders
{
    /**
     * @return Response|RedirectResponse
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=*');

        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            $csp = "default-src 'self'; "
                ."script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; "
                ."style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                ."font-src 'self' https://fonts.gstatic.com; "
                ."img-src 'self' data: blob:; "
                ."connect-src 'self'; "
                ."media-src 'self'; "
                ."object-src 'none'; "
                ."frame-ancestors 'none'; "
                ."base-uri 'self'; "
                ."form-action 'self';";
        } else {
            $csp = "default-src 'self'; "
                ."script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' http://localhost:* http://127.0.0.1:*; "
                ."style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net http://localhost:* http://127.0.0.1:*; "
                ."font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net; "
                ."img-src 'self' data: blob: http://localhost:* http://127.0.0.1:*; "
                ."connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:*; "
                ."media-src 'self'; "
                ."object-src 'none'; "
                ."frame-ancestors 'none'; "
                ."base-uri 'self'; "
                ."form-action 'self';";
        }

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
