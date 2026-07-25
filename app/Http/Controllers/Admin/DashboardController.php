<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArContent;
use App\Models\ArCategory;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalContents' => ArContent::count(),
                'activeContents' => ArContent::where('is_active', true)->count(),
                'totalCategories' => ArCategory::count(),
                'totalViews' => ArContent::sum('view_count'),
            ],
            'recentContents' => ArContent::with('category')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($item) => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'category' => $item->category?->name,
                    'grade_level' => $item->grade_level,
                    'view_count' => $item->view_count,
                    'is_active' => $item->is_active,
                    'created_at' => $item->created_at->diffForHumans(),
                ]),
        ]);
    }
}
