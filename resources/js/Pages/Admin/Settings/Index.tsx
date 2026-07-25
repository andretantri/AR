import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Save, Sparkles, Palette, Type, Image, AlertCircle, CheckCircle } from 'lucide-react';

interface Settings {
  app_name?: string; app_tagline?: string; app_logo?: string;
  primary_color?: string; secondary_color?: string; accent_color?: string;
  footer_text?: string; welcome_title?: string; welcome_subtitle?: string;
}
interface Props { settings: Settings; }

export default function SettingsIndex({ settings }: Props) {
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    _method: 'PUT',
    app_name: settings.app_name ?? 'AR Explorer',
    app_tagline: settings.app_tagline ?? '',
    primary_color: settings.primary_color ?? '#7C3AED',
    secondary_color: settings.secondary_color ?? '#F59E0B',
    accent_color: settings.accent_color ?? '#06B6D4',
    footer_text: settings.footer_text ?? '',
    welcome_title: settings.welcome_title ?? '',
    welcome_subtitle: settings.welcome_subtitle ?? '',
    app_logo: null as File | null,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(
    settings.app_logo ? `/storage/${settings.app_logo}` : null
  );
  const logoRef = useRef<HTMLInputElement>(null);

  const handleLogo = (file: File) => {
    setData('app_logo', file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/settings', { forceFormData: true });
  };

  return (
    <AdminLayout>
      <Head title="Pengaturan Aplikasi" />

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800"><i className="fa-solid fa-gear"></i> Pengaturan Aplikasi</h1>
        <p className="text-slate-500 font-medium mt-1">Sesuaikan tampilan dan informasi aplikasi AR Explorer.</p>
      </div>

      {recentlySuccessful && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="font-bold text-emerald-700">Pengaturan berhasil disimpan! Perubahan langsung berlaku.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Type className="w-5 h-5 text-violet-600" /> Identitas Aplikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="app_name">Nama Aplikasi *</Label>
                  <Input
                    id="app_name"
                    value={data.app_name}
                    onChange={e => setData('app_name', e.target.value)}
                    placeholder="AR Explorer"
                    className="mt-1.5 text-lg font-bold"
                  />
                  {errors.app_name && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.app_name}</p>}
                  <p className="text-xs text-slate-400 mt-1">Nama ini akan tampil di header, tab browser, dan seluruh aplikasi</p>
                </div>
                <div>
                  <Label htmlFor="app_tagline">Slogan / Tagline</Label>
                  <Input
                    id="app_tagline"
                    value={data.app_tagline}
                    onChange={e => setData('app_tagline', e.target.value)}
                    placeholder="Belajar Seru dengan Augmented Reality!"
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Welcome Section */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Konten Halaman Utama
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Judul Utama</Label>
                  <Input value={data.welcome_title} onChange={e => setData('welcome_title', e.target.value)}
                    placeholder="Selamat Datang di Dunia AR!" className="mt-1.5" />
                </div>
                <div>
                  <Label>Subjudul</Label>
                  <Input value={data.welcome_subtitle} onChange={e => setData('welcome_subtitle', e.target.value)}
                    placeholder="Scan, lihat, dan pelajari dunia..." className="mt-1.5" />
                </div>
                <div>
                  <Label>Teks Footer</Label>
                  <Input value={data.footer_text} onChange={e => setData('footer_text', e.target.value)}
                    placeholder={`© ${new Date().getFullYear()} ${data.app_name}. Dibuat dengan cinta`} className="mt-1.5" />
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Palette className="w-5 h-5 text-pink-500" /> Tema Warna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'primary_color', label: 'Warna Utama', hint: 'Digunakan di tombol & aksen' },
                    { key: 'secondary_color', label: 'Warna Sekunder', hint: 'Digunakan di highlight' },
                    { key: 'accent_color', label: 'Warna Aksen', hint: 'Digunakan di badge & tag' },
                  ].map(({ key, label, hint }) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="relative">
                          <input
                            type="color"
                            value={data[key as keyof typeof data] as string}
                            onChange={e => setData(key as any, e.target.value)}
                            className="w-12 h-12 rounded-xl border-2 border-slate-200 cursor-pointer p-1"
                          />
                        </div>
                        <div>
                          <Input
                            value={data[key as keyof typeof data] as string}
                            onChange={e => setData(key as any, e.target.value)}
                            placeholder="#7C3AED"
                            className="w-28 font-mono text-sm"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{hint}</p>
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-3">PREVIEW WARNA</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button type="button" className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                      style={{ backgroundColor: data.primary_color }}>Tombol Utama</button>
                    <button type="button" className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                      style={{ backgroundColor: data.secondary_color }}>Tombol Sekunder</button>
                    <span className="px-3 py-1 rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: data.accent_color }}>Badge Aksen</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Image className="w-5 h-5 text-cyan-600" /> Logo Aplikasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer hover:border-violet-400 transition-colors bg-slate-50"
                  style={{ aspectRatio: '1/1' }}
                  onClick={() => logoRef.current?.click()}
                >
                  <input ref={logoRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleLogo(e.target.files[0])} />
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xs font-bold text-slate-500">Klik untuk upload logo</p>
                      <p className="text-xs text-slate-400">PNG, SVG, max 2MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* App Preview Card */}
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${data.primary_color}, ${data.secondary_color})` }}>
                <p className="text-xs font-bold opacity-80 mb-1">PREVIEW APLIKASI</p>
                <h3 className="text-xl font-black">{data.app_name || 'AR Explorer'}</h3>
                <p className="text-xs opacity-80 mt-1">{data.app_tagline || 'Tagline aplikasi...'}</p>
              </div>
            </Card>

            {/* Save Button */}
            <Button type="submit" disabled={processing} className="w-full gap-2 shadow-lg shadow-violet-500/30" size="lg">
              <Save className="w-5 h-5" />
              {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
