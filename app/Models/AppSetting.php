<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'label', 'description'];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
        Cache::forget('app_settings');
    }

    public static function all($columns = ['*']): \Illuminate\Database\Eloquent\Collection
    {
        return parent::all($columns);
    }

    public static function getAllSettings(): array
    {
        return Cache::rememberForever('app_settings', function () {
            return static::all()->pluck('value', 'key')->toArray();
        });
    }
}
