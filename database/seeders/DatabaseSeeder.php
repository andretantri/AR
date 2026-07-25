<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin AR Explorer',
            'email' => 'admin@arexplorer.com',
        ]);

        $this->call([
            AppSettingSeeder::class,
            ArCategorySeeder::class,
        ]);
    }
}
