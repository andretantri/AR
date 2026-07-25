<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'app_name', 'value' => 'AR Explorer', 'type' => 'string', 'label' => 'Nama Aplikasi'],
            ['key' => 'app_tagline', 'value' => 'Belajar Seru dengan Augmented Reality!', 'type' => 'string', 'label' => 'Slogan Aplikasi'],
            ['key' => 'app_logo', 'value' => null, 'type' => 'string', 'label' => 'Logo Aplikasi'],
            ['key' => 'primary_color', 'value' => '#7C3AED', 'type' => 'string', 'label' => 'Warna Utama'],
            ['key' => 'secondary_color', 'value' => '#F59E0B', 'type' => 'string', 'label' => 'Warna Sekunder'],
            ['key' => 'accent_color', 'value' => '#06B6D4', 'type' => 'string', 'label' => 'Warna Aksen'],
            ['key' => 'footer_text', 'value' => '© 2024 AR Explorer. Dibuat dengan cinta untuk pelajar Indonesia.', 'type' => 'string', 'label' => 'Teks Footer'],
            ['key' => 'welcome_title', 'value' => 'Selamat Datang di Dunia AR!', 'type' => 'string', 'label' => 'Judul Halaman Utama'],
            ['key' => 'welcome_subtitle', 'value' => 'Scan, lihat, dan pelajari dunia dengan teknologi Augmented Reality', 'type' => 'string', 'label' => 'Subjudul Halaman Utama'],
        ];

        foreach ($settings as $setting) {
            AppSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
