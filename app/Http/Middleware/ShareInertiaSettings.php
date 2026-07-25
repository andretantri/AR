<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShareInertiaSettings
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $settings = AppSetting::getAllSettings();
        } catch (\Exception $e) {
            $settings = [
                'app_name' => config('app.name', 'AR Explorer'),
                'app_tagline' => 'Belajar Seru dengan Augmented Reality! 🚀',
                'primary_color' => '#7C3AED',
                'secondary_color' => '#F59E0B',
                'accent_color' => '#06B6D4',
                'footer_text' => '© 2024 AR Explorer',
            ];
        }

        Inertia::share([
            'appSettings' => $settings,
        ]);

        return $next($request);
    }
}
