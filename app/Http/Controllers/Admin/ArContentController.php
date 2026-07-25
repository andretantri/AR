<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArContent;
use App\Models\ArCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ArContentController extends Controller
{
    public function index(): Response
    {
        $contents = ArContent::withCount('models')->with('category')
            ->when(request('search'), fn($q, $s) => $q->where('title', 'like', "%$s%"))
            ->when(request('category'), fn($q, $c) => $q->where('ar_category_id', $c))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'category' => $item->category?->name,
                'category_color' => $item->category?->color,
                'description' => $item->description,
                'thumbnail_url' => $item->thumbnail_url,
                'models_count' => $item->models_count,
                'is_active' => $item->is_active,
                'view_count' => $item->view_count,
                'created_at' => $item->created_at->format('d M Y'),
            ]);

        return Inertia::render('Admin/ArContents/Index', [
            'contents' => $contents,
            'categories' => ArCategory::all(['id', 'name', 'color']),
            'filters' => request()->only(['search', 'category']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/ArContents/Create', [
            'categories' => ArCategory::all(['id', 'name', 'color', 'icon']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'ar_category_id' => 'nullable|exists:ar_categories,id',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable|image|max:5120',
            'tracking_mode' => 'nullable|string|in:disabled,image,marker,qrcode',
            'mind_file' => 'nullable|file',
        ]);

        $thumbnailPath = null;

        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        if ($request->hasFile('mind_file')) {
            $validated['mind_file_path'] = $request->file('mind_file')->store('mind_files', 'public');
        }

        $arContent = ArContent::create([
            ...$validated,
            'thumbnail_path' => $thumbnailPath,
        ]);

        return redirect()->route('admin.ar-contents.edit', $arContent)
            ->with('success', 'Konten AR berhasil ditambahkan! Silakan tambahkan model 3D.');
    }

    public function edit(ArContent $arContent): Response
    {
        $arContent->load('models');
        return Inertia::render('Admin/ArContents/Edit', [
            'content' => [
                ...$arContent->toArray(),
                'thumbnail_url' => $arContent->thumbnail_url,
                'mind_file_url' => $arContent->mind_file_path ? asset('storage/' . $arContent->mind_file_path) : null,
                'models' => $arContent->models->map(fn($m) => [
                    ...$m->toArray(),
                    'file_url' => $m->file_url,
                    'file_size_formatted' => $m->file_size_formatted,
                ]),
            ],
            'categories' => ArCategory::all(['id', 'name', 'color', 'icon']),
        ]);
    }

    public function update(Request $request, ArContent $arContent)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'ar_category_id' => 'nullable|exists:ar_categories,id',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable|image|max:5120',
            'tracking_mode' => 'nullable|string|in:disabled,image,marker,qrcode',
            'mind_file' => 'nullable|file',
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($arContent->thumbnail_path) {
                Storage::disk('public')->delete($arContent->thumbnail_path);
            }
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }
        if ($request->hasFile('mind_file')) {
            if ($arContent->mind_file_path) {
                Storage::disk('public')->delete($arContent->mind_file_path);
            }
            $validated['mind_file_path'] = $request->file('mind_file')->store('mind_files', 'public');
        }

        $arContent->update($validated);

        return redirect()->route('admin.ar-contents.index')
            ->with('success', 'Konten AR berhasil diperbarui!');
    }

    public function destroy(ArContent $arContent)
    {
        foreach ($arContent->models as $model) {
            Storage::disk('public')->delete($model->file_path);
        }
        
        if ($arContent->thumbnail_path) {
            Storage::disk('public')->delete($arContent->thumbnail_path);
        }
        $arContent->delete();

        return redirect()->route('admin.ar-contents.index')
            ->with('success', 'Konten AR berhasil dihapus!');
    }
}
