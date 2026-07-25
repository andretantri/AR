<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => AppSetting::all()->pluck('value', 'key'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:100',
            'app_tagline' => 'nullable|string|max:255',
            'primary_color' => 'required|string|max:20',
            'secondary_color' => 'required|string|max:20',
            'accent_color' => 'nullable|string|max:20',
            'footer_text' => 'nullable|string|max:500',
            'welcome_title' => 'nullable|string|max:255',
            'welcome_subtitle' => 'nullable|string|max:500',
            'app_logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('app_logo')) {
            $oldLogo = AppSetting::get('app_logo');
            if ($oldLogo) Storage::disk('public')->delete($oldLogo);
            $validated['app_logo'] = $request->file('app_logo')->store('logos', 'public');
        } else {
            unset($validated['app_logo']);
        }

        foreach ($validated as $key => $value) {
            AppSetting::set($key, $value);
        }

        Cache::forget('app_settings');

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan!');
    }
}
