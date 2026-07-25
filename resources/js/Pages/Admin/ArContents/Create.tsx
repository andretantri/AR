import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import { ArrowLeft, Upload, FileBox, Image, AlertCircle, CheckCircle } from 'lucide-react';

interface Category { id: number; name: string; color: string; icon: string; }
interface Props { categories: Category[]; }


export default function ArContentsCreate({ categories }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    title: '', description: '',
    ar_category_id: '', is_active: true as boolean,
    thumbnail: null as File | null,
  });



  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const handleThumb = (file: File) => {
    setData('thumbnail', file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleThumb(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/ar-contents', { forceFormData: true });
  };

  return (
    <AdminLayout>
      <Head title="Tambah Konten AR" />

      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/ar-contents">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800"><i className="fa-solid fa-sparkles"></i> Tambah Konten AR</h1>
          <p className="text-slate-500 font-medium mt-1">Upload file AR dan isi detail konten</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-800">Informasi Konten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Konten *</Label>
                  <Input
                    id="title"
                    placeholder="Contoh: Bangun Ruang Kubus 3D"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    className="mt-1.5"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    placeholder="Jelaskan konten AR ini untuk pelajar..."
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    id="category"
                    value={data.ar_category_id}
                    onChange={e => setData('ar_category_id', e.target.value)}
                    className="mt-1.5"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </Select>
                </div>
                </CardContent>
            </Card>

            {/* Info: Model Upload in Next Step */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <FileBox className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm mb-1">Upload Model 3D (.glb)</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Setelah konten berhasil disimpan, Anda akan diarahkan ke halaman <strong>Edit</strong> untuk mengunggah file <strong>.glb</strong> dan mengatur posisi model di Visual Editor 3D.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-800">Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer hover:border-violet-400 transition-colors"
                  style={{ aspectRatio: '16/9' }}
                  onClick={() => thumbRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  <input
                    ref={thumbRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleThumb(e.target.files[0])}
                  />
                  {thumbPreview ? (
                    <img src={thumbPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50">
                      <Image className="w-8 h-8 opacity-40" />
                      <p className="text-xs font-bold">Upload Thumbnail</p>
                      <p className="text-xs opacity-60">JPG, PNG, max 5MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status & Submit */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Status Publikasi</Label>
                  <button
                    type="button"
                    onClick={() => setData('is_active', !data.is_active)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-200 ${data.is_active ? 'bg-violet-600' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${data.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {data.is_active ? <><i className="fa-solid fa-check-circle text-green-500"></i> Konten akan langsung tampil di halaman publik</> : <><i className="fa-solid fa-pause-circle text-amber-500"></i> Konten disimpan sebagai draft</>}
                </p>
                <Button type="submit" disabled={processing} className="w-full gap-2" size="lg">
                  <Upload className="w-5 h-5" />
                  {processing ? 'Menyimpan...' : 'Simpan Konten AR'}
                </Button>
                <Link href="/admin/ar-contents">
                  <Button variant="ghost" className="w-full">Batal</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
