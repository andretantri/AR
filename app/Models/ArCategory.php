<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArCategory extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'color', 'description'];

    public function arContents(): HasMany
    {
        return $this->hasMany(ArContent::class);
    }
}
