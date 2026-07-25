import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Plus, Edit2, Trash2, FolderOpen, X, Check } from 'lucide-react';

interface Category {
  id: number; name: string; slug: string; icon: string; color: string;
  description: string | null; ar_contents_count: number;
}
interface Props { categories: Category[]; }

const colorOptions = [
  '#7C3AED','#059669','#D97706','#DC2626','#2563EB','#EC4899','#0891B2','#9333EA',
];

function CategoryForm({ initial, onSubmit, onCancel, processing }: {
  initial?: Partial<Category>; onSubmit: (data: any) => void; onCancel?: () => void; processing: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'fa-solid fa-box');
  const [color, setColor] = useState(initial?.color ?? '#7C3AED');
  const [description, setDescription] = useState(initial?.description ?? '');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Emoji Icon</Label>
          <Input value={icon} onChange={e => setIcon(e.target.value)} className="mt-1.5 text-center text-xl" maxLength={2} />
        </div>
        <div className="col-span-2">
          <Label>Nama Kategori *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Matematika" className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label>Warna</Label>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {colorOptions.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }} />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-8 h-8 rounded-lg border-2 border-slate-200 cursor-pointer" />
        </div>
      </div>
      <div>
        <Label>Deskripsi</Label>
        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Deskripsi singkat..." className="mt-1.5" />
      </div>
      <div className="flex gap-3">
        <Button type="button" onClick={() => onSubmit({ name, icon, color, description })} disabled={processing || !name} className="flex-1 gap-2">
          <Check className="w-4 h-4" /> {processing ? 'Menyimpan...' : 'Simpan'}
        </Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}><X className="w-4 h-4" /></Button>}
      </div>
    </div>
  );
}

export default function CategoriesIndex({ categories }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [addProcessing, setAddProcessing] = useState(false);
  const [editProcessing, setEditProcessing] = useState(false);

  const handleAdd = (data: any) => {
    setAddProcessing(true);
    router.post('/admin/categories', data, {
      onFinish: () => { setAddProcessing(false); setShowAdd(false); }
    });
  };

  const handleEdit = (id: number, data: any) => {
    setEditProcessing(true);
    router.put(`/admin/categories/${id}`, data, {
      onFinish: () => { setEditProcessing(false); setEditId(null); }
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Hapus kategori "${name}"?`)) router.delete(`/admin/categories/${id}`);
  };

  return (
    <AdminLayout>
      <Head title="Kelola Kategori" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800"><i className="fa-solid fa-folder-tree"></i> Kategori</h1>
          <p className="text-slate-500 font-medium mt-1">{categories.length} kategori tersedia</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 shadow-lg shadow-violet-500/30">
          <Plus className="w-5 h-5" /> Tambah Kategori
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        {showAdd && (
          <Card className="border-2 border-violet-200 shadow-lg shadow-violet-100">
            <CardHeader>
              <CardTitle className="text-slate-800 text-lg"><i className="fa-solid fa-sparkles"></i> Kategori Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} processing={addProcessing} />
            </CardContent>
          </Card>
        )}

        {/* Categories Grid */}
        {categories.map(cat => (
          <Card key={cat.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="h-2" style={{ backgroundColor: cat.color }} />
            <CardContent className="p-5">
              {editId === cat.id ? (
                <CategoryForm
                  initial={cat}
                  onSubmit={(data) => handleEdit(cat.id, data)}
                  onCancel={() => setEditId(null)}
                  processing={editProcessing}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: cat.color + '20' }}>
                        <i className={cat.icon ? cat.icon : 'fa-solid fa-box'}></i>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800">{cat.name}</h3>
                        <p className="text-xs text-slate-400 font-medium">{cat.ar_contents_count} konten AR</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditId(cat.id)} className="p-2 rounded-lg hover:bg-slate-100 text-violet-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {cat.description && (
                    <p className="text-sm text-slate-500 font-medium">{cat.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ backgroundColor: cat.color, width: `${Math.min((cat.ar_contents_count / 10) * 100, 100)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{cat.ar_contents_count}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && !showAdd && (
          <div className="col-span-full py-16 text-center text-slate-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold">Belum ada kategori</p>
            <p className="text-sm">Tambahkan kategori untuk mengorganisir konten AR</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
