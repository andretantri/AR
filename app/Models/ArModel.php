<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArModel extends Model
{
    //
    protected $fillable = [
        'ar_content_id', 'name', 'description', 'file_path', 'file_name', 'file_type', 'file_size',
        'position_x', 'position_y', 'position_z',
        'rotation_x', 'rotation_y', 'rotation_z',
        'scale_x', 'scale_y', 'scale_z',
    ];

    protected $casts = [
        'position_x' => 'float', 'position_y' => 'float', 'position_z' => 'float',
        'rotation_x' => 'float', 'rotation_y' => 'float', 'rotation_z' => 'float',
        'scale_x' => 'float', 'scale_y' => 'float', 'scale_z' => 'float',
    ];

    public function content()
    {
        return $this->belongsTo(ArContent::class, 'ar_content_id');
    }

    public function getFileUrlAttribute(): string
    {
        return \Illuminate\Support\Facades\Storage::url($this->file_path);
    }
    
    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes < 1024) return $bytes . ' B';
        if ($bytes < 1048576) return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1048576, 1) . ' MB';
    }
}
