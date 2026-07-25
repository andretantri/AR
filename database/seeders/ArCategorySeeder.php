<?php

namespace Database\Seeders;

use App\Models\ArCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Matematika', 'slug' => 'matematika', 'icon' => 'fa-solid fa-ruler-combined', 'color' => '#7C3AED', 'description' => 'Bangun ruang, geometri, dan konsep matematika'],
            ['name' => 'IPA / Sains', 'slug' => 'ipa-sains', 'icon' => 'fa-solid fa-microscope', 'color' => '#059669', 'description' => 'Biologi, fisika, kimia, dan ilmu alam'],
            ['name' => 'IPS', 'slug' => 'ips', 'icon' => 'fa-solid fa-earth-asia', 'color' => '#D97706', 'description' => 'Geografi, sejarah, dan ilmu sosial'],
            ['name' => 'Bahasa Indonesia', 'slug' => 'bahasa-indonesia', 'icon' => 'fa-solid fa-book', 'color' => '#DC2626', 'description' => 'Pembelajaran bahasa dan sastra'],
            ['name' => 'Bahasa Inggris', 'slug' => 'bahasa-inggris', 'icon' => 'fa-solid fa-comments', 'color' => '#2563EB', 'description' => 'English vocabulary dan grammar'],
            ['name' => 'Seni & Budaya', 'slug' => 'seni-budaya', 'icon' => 'fa-solid fa-palette', 'color' => '#EC4899', 'description' => 'Seni rupa, musik, dan budaya nusantara'],
        ];

        foreach ($categories as $category) {
            ArCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
