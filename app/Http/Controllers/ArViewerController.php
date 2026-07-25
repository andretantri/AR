<?php

namespace App\Http\Controllers;

use App\Models\ArContent;
use App\Models\ArCategory;
use Inertia\Inertia;

class ArViewerController extends Controller
{
    public function index()
    {
        $contents = ArContent::with(['category', 'models'])
            ->where('is_active', true)
            ->when(request('search'), fn($q, $s) => $q->where('title', 'like', "%$s%"))
            ->when(request('category'), fn($q, $c) => $q->whereHas('category', fn($q) => $q->where('slug', $c)))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'thumbnail_url' => $item->thumbnail_url,
                'models_count' => $item->models->count(),
                'view_count' => $item->view_count,
                'category' => $item->category ? [
                    'name' => $item->category->name,
                    'slug' => $item->category->slug,
                    'icon' => $item->category->icon,
                    'color' => $item->category->color,
                ] : null,
            ]);

        return Inertia::render('Public/Home', [
            'contents' => $contents,
            'categories' => ArCategory::all(['id', 'name', 'slug', 'icon', 'color']),
            'filters' => request()->only(['search', 'category']),
        ]);
    }

    public function scan()
    {
        return Inertia::render('Public/Scan');
    }

    public function show(ArContent $arContent)
    {
        abort_if(!$arContent->is_active, 404);

        $arContent->increment('view_count');

        $related = ArContent::with('category')
            ->where('is_active', true)
            ->where('id', '!=', $arContent->id)
            ->where('ar_category_id', $arContent->ar_category_id)
            ->take(4)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'thumbnail_url' => $item->thumbnail_url,
            ]);

        $arContent->load('models');

        return Inertia::render('Public/ArViewer', [
            'content' => [
                ...$arContent->toArray(),
                'thumbnail_url' => $arContent->thumbnail_url,
                'models' => $arContent->models->map(fn($m) => [
                    ...$m->toArray(),
                    'file_url' => $m->file_url,
                ]),
                'category' => $arContent->category ? [
                    'name' => $arContent->category->name,
                    'slug' => $arContent->category->slug,
                    'icon' => $arContent->category->icon,
                    'color' => $arContent->category->color,
                ] : null,
            ],
            'related' => $related,
        ]);
    }
}
