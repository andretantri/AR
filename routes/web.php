<?php

use App\Http\Controllers\Admin\ArContentController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\ArViewerController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::get('/', [ArViewerController::class, 'index'])->name('home');
Route::get('/scan', [ArViewerController::class, 'scan'])->name('scan');
Route::get('/ar/{arContent}', [ArViewerController::class, 'show'])->name('ar.show');
Route::get('/ar/{arContent}/play', [ArViewerController::class, 'play'])->name('ar.play');

// Auth routes from Breeze
Route::get('/dashboard', function () {
    return redirect()->route('admin.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes
Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::resource('ar-contents', ArContentController::class);
        Route::put('ar-contents/{arContent}/models/bulk', [\App\Http\Controllers\Admin\ArModelController::class, 'bulkUpdate'])->name('ar-models.bulk-update');
        Route::post('ar-contents/{arContent}/models', [\App\Http\Controllers\Admin\ArModelController::class, 'store'])->name('ar-models.store');
        Route::put('ar-models/{arModel}', [\App\Http\Controllers\Admin\ArModelController::class, 'update'])->name('ar-models.update');
        Route::delete('ar-models/{arModel}', [\App\Http\Controllers\Admin\ArModelController::class, 'destroy'])->name('ar-models.destroy');
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
    });

require __DIR__.'/auth.php';
