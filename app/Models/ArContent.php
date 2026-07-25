<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArContent extends Model
{
    protected $fillable = [
        'ar_category_id', 'title', 'description',
        'thumbnail_path', 'is_active', 'view_count',
        'tracking_mode', 'mind_file_path',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'view_count' => 'integer',
        'file_size' => 'integer',
    ];

    protected $appends = ['thumbnail_url', 'mind_file_url'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ArCategory::class, 'ar_category_id');
    }

    public function models()
    {
        return $this->hasMany(ArModel::class, 'ar_content_id');
    }

    public function incrementView(): void
    {
        $this->increment('view_count');
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail_path ? \Illuminate\Support\Facades\Storage::url($this->thumbnail_path) : null;
    }

    public function getMindFileUrlAttribute(): ?string
    {
        return $this->mind_file_path ? \Illuminate\Support\Facades\Storage::url($this->mind_file_path) : null;
    }
}
