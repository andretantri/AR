import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Upload, FileBox, Image, AlertCircle, CheckCircle, RefreshCw, BoxSelect, Download, QrCode } from 'lucide-react';
import VisualEditor from './VisualEditor';

interface Category { id: number; name: string; color: string; icon: string; }
interface ArModel { id: number; name: string; description: string | null; file_url: string; file_type: string; file_name: string; file_size_formatted: string; position_x: number; position_y: number; position_z: number; rotation_x: number; rotation_y: number; rotation_z: number; scale_x: number; scale_y: number; scale_z: number; }
interface Content {
  id: number; title: string; description: string | null;
  ar_category_id: number | null; is_active: boolean;
  tracking_mode: string;
  thumbnail_url: string | null; mind_file_url: string | null; models: ArModel[];
}
interface Props { content: Content; categories: Category[]; }

export default function ArContentsEdit({ content, categories }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    title: content.title, description: content.description ?? '',
    ar_category_id: content.ar_category_id?.toString() ?? '', is_active: content.is_active,
    tracking_mode: content.tracking_mode || 'disabled',
    thumbnail: null as File | null,
    mind_file: null as File | null,
  });

  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);

  useEffect(() => {
    // Load MindAR compiler script for tracking features
    if (!(window as any).MINDAR) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js';
      document.head.appendChild(script);
    }
  }, []);
  const thumbRef = useRef<HTMLInputElement>(null);

  const handleThumb = (file: File) => { setData('thumbnail', file); setThumbPreview(URL.createObjectURL(file)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let compiledFile: File | null = null;

    if (data.tracking_mode !== 'disabled' && (window as any).MINDAR) {
      const isImageMode = data.tracking_mode === 'image';
      const isMarkerMode = data.tracking_mode === 'marker';
      const isQRCodeMode = data.tracking_mode === 'qrcode';

      if (
        (isImageMode && (data.thumbnail || (content.thumbnail_url && !content.mind_file_url))) ||
        ((isMarkerMode || isQRCodeMode) && !content.mind_file_url) ||
        (isQRCodeMode) // Recompile if they just switched to QR Code
      ) {
        setIsCompiling(true);
        setCompileProgress(0);
        try {
          const compiler = new (window as any).MINDAR.IMAGE.Compiler();
          const img = new window.Image();
          
          const imgLoadPromise = new Promise((resolve, reject) => { 
             img.onload = resolve; 
             img.onerror = () => reject(new Error("Gagal memuat gambar"));
          });
          
          if (isMarkerMode) {
             img.src = '/images/standard-marker.png';
          } else if (data.tracking_mode === 'qrcode') {
             // Generate QR Code image for compilation
             const svg = document.getElementById('ar-qr-code');
             if (!svg) throw new Error("QR Code tidak ditemukan");
             const svgData = new XMLSerializer().serializeToString(svg);
             const canvas = document.createElement('canvas');
             const ctx = canvas.getContext('2d');
             
             await new Promise<void>((resolve, reject) => {
               const tempImg = new window.Image();
               tempImg.onload = () => {
                 canvas.width = tempImg.width + 40;
                 canvas.height = tempImg.height + 40;
                 if (ctx) {
                   ctx.fillStyle = 'white';
                   ctx.fillRect(0, 0, canvas.width, canvas.height);
                   ctx.drawImage(tempImg, 20, 20);
                 }
                 img.src = canvas.toDataURL('image/png');
                 resolve();
               };
               tempImg.onerror = () => reject(new Error("Gagal generate QR Code"));
               tempImg.src = 'data:image/svg+xml;base64,' + btoa(svgData);
             });
          } else {
             img.src = data.thumbnail ? URL.createObjectURL(data.thumbnail) : content.thumbnail_url!;
          }

          await imgLoadPromise;
          
          await compiler.compileImageTargets([img], (progress: number) => {
             setCompileProgress(Math.round(progress));
          });
          const buffer = await compiler.exportData();
          const blob = new Blob([buffer], { type: 'application/octet-stream' });
          compiledFile = new File([blob], 'targets.mind', { type: 'application/octet-stream' });
        } catch (err) {
          console.error("Gagal mengkompilasi target", err);
          alert("Gagal memproses gambar untuk AR Tracking. Coba gambar lain.");
          setIsCompiling(false);
          return;
        }
        setIsCompiling(false);
      }
    }

    // Prepare manual form data to include the compiled file safely
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('ar_category_id', data.ar_category_id);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('tracking_mode', data.tracking_mode);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    if (compiledFile) formData.append('mind_file', compiledFile);
    else if (data.mind_file) formData.append('mind_file', data.mind_file);

    router.post(`/admin/ar-contents/${content.id}`, formData, { forceFormData: true });
  };

  return (
    <AdminLayout>
      <Head title={`Edit: ${content.title}`} />

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/ar-contents">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800"><i className="fa-solid fa-pencil"></i> Edit Konten AR</h1>
            <p className="text-slate-500 font-medium mt-1 truncate max-w-md">{content.title}</p>
          </div>
        </div>
        <Button type="submit" form="edit-form" disabled={processing || isCompiling} className="gap-2 shadow-lg hover:-translate-y-0.5 transition-all" size="lg">
          {isCompiling ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Memproses ({compileProgress}%)</>
          ) : processing ? (
            'Menyimpan...'
          ) : (
            <><Upload className="w-5 h-5" /> Simpan Perubahan</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form id="edit-form" onSubmit={handleSubmit}>
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-slate-800">Informasi Konten</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Konten *</Label>
                  <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} className="mt-1.5" />
                  {errors.title && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
                </div>
                <div>
                  <Label>Deskripsi</Label>
                  <Textarea value={data.description} onChange={e => setData('description', e.target.value)} className="mt-1.5" rows={3} />
                </div>
                <div>
                  <Label>Kategori</Label>
                  <Select value={data.ar_category_id} onChange={e => setData('ar_category_id', e.target.value)} className="mt-1.5">
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </Select>
                </div>
              </CardContent>
            </Card>
          </form>

          <ModelManager contentId={content.id} models={content.models} />
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle className="text-slate-800">Thumbnail</CardTitle></CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer hover:border-violet-400 transition-colors"
                style={{ aspectRatio: '16/9' }}
                onClick={() => thumbRef.current?.click()}
                onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleThumb(e.dataTransfer.files[0]); }}
                onDragOver={e => e.preventDefault()}
              >
                <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleThumb(e.target.files[0])} />
                {(thumbPreview || content.thumbnail_url) ? (
                  <img src={thumbPreview ?? content.thumbnail_url!} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50">
                    <Image className="w-8 h-8 opacity-40" />
                    <p className="text-xs font-bold">Ganti Thumbnail</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Status Publikasi</Label>
                <button type="button" onClick={() => setData('is_active', !data.is_active)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 ${data.is_active ? 'bg-violet-600' : 'bg-slate-200'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${data.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {data.is_active ? <><i className="fa-solid fa-check-circle text-green-500"></i> Aktif & tampil di halaman publik</> : <><i className="fa-solid fa-pause-circle text-amber-500"></i> Tersimpan sebagai draft</>}
              </p>
              <Link href="/admin/ar-contents">
                <Button variant="ghost" className="w-full">Batal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md mt-6">
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-bold text-slate-800">Mode WebAR Tracking</Label>
                <p className="text-xs text-slate-500 mb-2 mt-1 leading-relaxed">
                  Pilih bagaimana pengalaman AR ini dipicu saat dibuka di perangkat pengguna.
                </p>
                <Select value={data.tracking_mode} onChange={e => setData('tracking_mode', e.target.value)}>
                  <option value="disabled">Tidak Ada (Hanya Viewer 3D Biasa)</option>
                  <option value="image">Gunakan Gambar Thumbnail (Image Tracking)</option>
                  <option value="qrcode">Gunakan QR Code (All-in-One)</option>
                  <option value="marker">Gunakan Marker Standar AR Explorer</option>
                </Select>
              </div>

              {data.tracking_mode === 'marker' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                  <p className="text-xs text-slate-600 mb-2 font-medium">
                    Cetak gambar marker ini untuk digunakan sebagai pemicu AR.
                  </p>
                  <a href="/images/standard-marker.png" download="AR-Explorer-Marker.png">
                    <Button type="button" variant="outline" size="sm" className="w-full gap-2">
                      <Download className="w-4 h-4" /> Unduh Marker Standar
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md mt-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
                  <QRCodeSVG 
                    id="ar-qr-code"
                    value={`${window.location.origin}/ar/${content.id}`} 
                    size={80} 
                    level="M" 
                    includeMargin={false}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-violet-600" /> Akses Cepat (QR Code)
                  </Label>
                  <p className="text-xs text-slate-500 mb-3 mt-1 leading-relaxed">
                    Cetak QR Code ini agar pengunjung bisa langsung membuka pengalaman AR ini dari HP mereka.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 text-violet-600 border-violet-200 hover:bg-violet-50"
                    onClick={() => {
                      const svg = document.getElementById('ar-qr-code');
                      if (!svg) return;
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const img = new window.Image();
                      img.onload = () => {
                        canvas.width = img.width + 40;
                        canvas.height = img.height + 40;
                        if (ctx) {
                          ctx.fillStyle = 'white';
                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                          ctx.drawImage(img, 20, 20);
                        }
                        const pngFile = canvas.toDataURL('image/png');
                        const downloadLink = document.createElement('a');
                        downloadLink.download = `QR-AR-${content.id}.png`;
                        downloadLink.href = `${pngFile}`;
                        downloadLink.click();
                      };
                      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                    }}
                  >
                    <Download className="w-4 h-4" /> Download QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function ModelListItem({ m, contentId }: { m: ArModel; contentId: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const { data, setData, put, processing } = useForm({
    name: m.name,
    description: m.description || '',
    position_x: m.position_x, position_y: m.position_y, position_z: m.position_z,
    rotation_x: m.rotation_x, rotation_y: m.rotation_y, rotation_z: m.rotation_z,
    scale_x: m.scale_x, scale_y: m.scale_y, scale_z: m.scale_z,
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/ar-models/${m.id}`, {
      onSuccess: () => setIsEditing(false),
    });
  };

  if (isEditing) {
    return (
      <div className="p-4 border border-violet-300 rounded-xl bg-violet-50">
        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <Label className="text-xs">Nama Model</Label>
            <Input value={data.name} onChange={e => setData('name', e.target.value)} required className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Deskripsi</Label>
            <Textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className="text-sm" />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>Batal</Button>
            <Button type="submit" size="sm" disabled={processing} className="bg-violet-600 hover:bg-violet-700">Simpan</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between group">
      <div>
        <p className="font-bold text-slate-800">{m.name}</p>
        {m.description && <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{m.description}</p>}
        <p className="text-xs text-slate-500 mt-1">{m.file_name} ({m.file_size_formatted})</p>
        <div className="text-xs text-slate-500 mt-2 grid grid-cols-3 gap-4">
          <div>P: {m.position_x}, {m.position_y}, {m.position_z}</div>
          <div>R: {m.rotation_x}, {m.rotation_y}, {m.rotation_z}</div>
          <div>S: {m.scale_x}, {m.scale_y}, {m.scale_z}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-violet-600 hover:bg-violet-50 p-2 rounded-lg transition-colors">
          <i className="fa-solid fa-pen"></i>
        </button>
        <Link href={`/admin/ar-models/${m.id}`} method="delete" as="button" className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
          <i className="fa-solid fa-trash"></i>
        </Link>
      </div>
    </div>
  );
}

function ModelManager({ contentId, models }: { contentId: number, models: ArModel[] }) {
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    name: '', description: '', ar_file: null as File | null,
    position_x: 0, position_y: 0, position_z: 0,
    rotation_x: 0, rotation_y: 0, rotation_z: 0,
    scale_x: '1', scale_y: '1', scale_z: '1',
  });

  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/ar-contents/${contentId}/models`, {
      forceFormData: true,
      onSuccess: () => {
        reset();
        if (fileRef.current) fileRef.current.value = '';
      }
    });
  };

  return (
    <Card className="border-0 shadow-md mt-6">
      {isVisualEditorOpen && (
        <VisualEditor contentId={contentId} initialModels={models} onClose={() => setIsVisualEditorOpen(false)} />
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-800">Manajemen Model 3D</CardTitle>
          {models.length > 0 && (
            <Button type="button" onClick={() => setIsVisualEditorOpen(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
              <BoxSelect className="w-4 h-4" /> Buka Visual Editor
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {models.length > 0 && (
          <div className="mb-8 space-y-4">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Model Tersimpan</h3>
            {models.map(m => (
              <ModelListItem key={m.id} m={m} contentId={contentId} />
            ))}
          </div>
        )}

        <div className="border-t border-slate-200 pt-6">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">Tambah Model Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama Model</Label>
                <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Misal: Bumi" className="mt-1.5" required />
                {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
              </div>
              <div>
                <Label>File .glb</Label>
                <Input type="file" ref={fileRef} accept=".glb,.gltf" onChange={e => setData('ar_file', e.target.files?.[0] ?? null)} className="mt-1.5" required />
                {errors.ar_file && <p className="text-red-500 text-xs mt-1 font-bold">{errors.ar_file}</p>}
              </div>
              <div className="col-span-2">
                <Label>Deskripsi / Informasi Model (Opsional)</Label>
                <Textarea value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Informasi yang akan muncul saat model ini diklik..." className="mt-1.5 text-sm" rows={2} />
                {errors.description && <p className="text-red-500 text-xs mt-1 font-bold">{errors.description}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <Label className="text-xs mb-2 block">Position (X, Y, Z)</Label>
                <div className="flex gap-2">
                  <Input type="number" step="0.1" value={data.position_x} onChange={e => setData('position_x', e.target.value as any)} />
                  <Input type="number" step="0.1" value={data.position_y} onChange={e => setData('position_y', e.target.value as any)} />
                  <Input type="number" step="0.1" value={data.position_z} onChange={e => setData('position_z', e.target.value as any)} />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Rotation (X, Y, Z)</Label>
                <div className="flex gap-2">
                  <Input type="number" step="0.1" value={data.rotation_x} onChange={e => setData('rotation_x', e.target.value as any)} />
                  <Input type="number" step="0.1" value={data.rotation_y} onChange={e => setData('rotation_y', e.target.value as any)} />
                  <Input type="number" step="0.1" value={data.rotation_z} onChange={e => setData('rotation_z', e.target.value as any)} />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Scale (X, Y, Z)</Label>
                <div className="flex gap-2">
                  <Input type="number" step="0.1" value={data.scale_x} onChange={e => setData('scale_x', e.target.value as any)} />
                  <Input type="number" step="0.1" value={data.scale_y} onChange={e => setData('scale_y', e.target.value as any)} />
                  <Input type="number" step="0.1" value={data.scale_z} onChange={e => setData('scale_z', e.target.value as any)} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={processing} className="w-full">
              {processing ? 'Mengunggah...' : 'Unggah Model'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
