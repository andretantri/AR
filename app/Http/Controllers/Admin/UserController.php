<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::latest()->paginate(10);
        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }

    public function resetPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return back()->with('success', 'Password pengguna ' . $user->name . ' berhasil direset.');
    }
}
