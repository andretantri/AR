import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Key, AlertCircle } from 'lucide-react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { PageProps } from '@/types';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface PaginationData {
  data: User[];
  current_page: number;
  last_page: number;
  total: number;
}

interface UsersPageProps extends PageProps {
  users: PaginationData;
  flash: {
    success?: string;
  };
}

export default function Index({ users }: UsersPageProps) {
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const { flash } = usePage<UsersPageProps>().props;

  const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
    password: '',
    password_confirmation: '',
  });

  const openResetModal = (user: User) => {
    setResettingUser(user);
    clearErrors();
    reset();
  };

  const closeResetModal = () => {
    setResettingUser(null);
    clearErrors();
    reset();
  };

  const submitResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    put(route('admin.users.reset-password', resettingUser.id), {
      preserveScroll: true,
      onSuccess: () => closeResetModal(),
    });
  };

  return (
    <AdminLayout>
      <Head title="Manajemen Pengguna" />

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Pengguna</h1>
              <p className="text-slate-500 font-medium">Kelola akses dan akun pengguna</p>
            </div>
          </div>
        </div>

        {flash?.success && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{flash?.success}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-4 text-sm font-bold text-slate-600">Nama</th>
                  <th className="p-4 text-sm font-bold text-slate-600">Email</th>
                  <th className="p-4 text-sm font-bold text-slate-600">Tanggal Daftar</th>
                  <th className="p-4 text-sm font-bold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.data.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{user.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-500">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-500">
                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openResetModal(user)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Key className="w-4 h-4" />
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.data.length === 0 && (
              <div className="p-8 text-center text-slate-500 font-medium">
                Belum ada pengguna terdaftar.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal show={resettingUser !== null} onClose={closeResetModal}>
        <form onSubmit={submitResetPassword} className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Reset Password untuk {resettingUser?.name}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Silakan masukkan password baru untuk pengguna ini.
          </p>

          <div className="mt-6">
            <InputLabel htmlFor="password" value="Password Baru" />
            <TextInput
              id="password"
              type="password"
              className="mt-1 block w-full"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              isFocused
              placeholder="Minimal 8 karakter"
            />
            <InputError message={errors.password} className="mt-2" />
          </div>

          <div className="mt-6">
            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
            <TextInput
              id="password_confirmation"
              type="password"
              className="mt-1 block w-full"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              placeholder="Ketik ulang password"
            />
            <InputError message={errors.password_confirmation} className="mt-2" />
          </div>

          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeResetModal}>Batal</SecondaryButton>

            <PrimaryButton className="ms-3" disabled={processing}>
              Simpan Password Baru
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
