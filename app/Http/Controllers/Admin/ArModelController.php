<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArContent;
use App\Models\ArModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArModelController extends Controller
{
    public function store(Request $request, ArContent $arContent)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'ar_file' => 'required|file|max:102400', // 100MB max
            'position_x' => 'numeric', 'position_y' => 'numeric', 'position_z' => 'numeric',
            'rotation_x' => 'numeric', 'rotation_y' => 'numeric', 'rotation_z' => 'numeric',
            'scale_x' => 'numeric', 'scale_y' => 'numeric', 'scale_z' => 'numeric',
        ]);

        $arFile = $request->file('ar_file');
        
        ArModel::create([
            'ar_content_id' => $arContent->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'file_path' => $arFile->store('ar-files', 'public'),
            'file_name' => $arFile->getClientOriginalName(),
            'file_type' => $arFile->getClientOriginalExtension(),
            'file_size' => $arFile->getSize(),
            'position_x' => $validated['position_x'] ?? 0,
            'position_y' => $validated['position_y'] ?? 0,
            'position_z' => $validated['position_z'] ?? 0,
            'rotation_x' => $validated['rotation_x'] ?? 0,
            'rotation_y' => $validated['rotation_y'] ?? 0,
            'rotation_z' => $validated['rotation_z'] ?? 0,
            'scale_x' => $validated['scale_x'] ?? 1,
            'scale_y' => $validated['scale_y'] ?? 1,
            'scale_z' => $validated['scale_z'] ?? 1,
        ]);

        return back()->with('success', 'Model berhasil ditambahkan!');
    }

    public function update(Request $request, ArModel $arModel)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'position_x' => 'numeric', 'position_y' => 'numeric', 'position_z' => 'numeric',
            'rotation_x' => 'numeric', 'rotation_y' => 'numeric', 'rotation_z' => 'numeric',
            'scale_x' => 'numeric', 'scale_y' => 'numeric', 'scale_z' => 'numeric',
        ]);

        $arModel->update($validated);

        return back()->with('success', 'Model berhasil diperbarui!');
    }

    public function destroy(ArModel $arModel)
    {
        Storage::disk('public')->delete($arModel->file_path);
        $arModel->delete();

        return back()->with('success', 'Model berhasil dihapus!');
    }

    public function bulkUpdate(Request $request, ArContent $arContent)
    {
        $validated = $request->validate([
            'models' => 'required|array',
            'models.*.id' => 'required|exists:ar_models,id',
            'models.*.position_x' => 'numeric', 'models.*.position_y' => 'numeric', 'models.*.position_z' => 'numeric',
            'models.*.rotation_x' => 'numeric', 'models.*.rotation_y' => 'numeric', 'models.*.rotation_z' => 'numeric',
            'models.*.scale_x' => 'numeric', 'models.*.scale_y' => 'numeric', 'models.*.scale_z' => 'numeric',
        ]);

        foreach ($validated['models'] as $m) {
            $arModel = ArModel::where('id', $m['id'])->where('ar_content_id', $arContent->id)->first();
            if ($arModel) {
                $arModel->update([
                    'position_x' => $m['position_x'] ?? $arModel->position_x,
                    'position_y' => $m['position_y'] ?? $arModel->position_y,
                    'position_z' => $m['position_z'] ?? $arModel->position_z,
                    'rotation_x' => $m['rotation_x'] ?? $arModel->rotation_x,
                    'rotation_y' => $m['rotation_y'] ?? $arModel->rotation_y,
                    'rotation_z' => $m['rotation_z'] ?? $arModel->rotation_z,
                    'scale_x' => $m['scale_x'] ?? $arModel->scale_x,
                    'scale_y' => $m['scale_y'] ?? $arModel->scale_y,
                    'scale_z' => $m['scale_z'] ?? $arModel->scale_z,
                ]);
            }
        }

        return back()->with('success', 'Tata letak model berhasil diperbarui!');
    }
}
