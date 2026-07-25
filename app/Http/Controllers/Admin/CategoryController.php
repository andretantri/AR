<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => ArCategory::withCount('arContents')->get()->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'icon' => $c->icon,
                'color' => $c->color,
                'description' => $c->description,
                'ar_contents_count' => $c->ar_contents_count,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:255',
            'color' => 'required|string|max:20',
            'description' => 'nullable|string|max:500',
        ]);
        $validated['slug'] = Str::slug($validated['name']);
        ArCategory::create($validated);
        return redirect()->back()->with('success', 'Kategori berhasil ditambahkan!');
    }

    public function update(Request $request, ArCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:255',
            'color' => 'required|string|max:20',
            'description' => 'nullable|string|max:500',
        ]);
        $validated['slug'] = Str::slug($validated['name']);
        $category->update($validated);
        return redirect()->back()->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy(ArCategory $category)
    {
        $category->delete();
        return redirect()->back()->with('success', 'Kategori berhasil dihapus!');
    }
}
