import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import {
  Plus, Search, Filter, Edit2, Trash2, Eye,
  Boxes, ImageOff, ToggleLeft, ToggleRight
} from 'lucide-react';

interface Content {
  id: number;
  title: string;
  category: string | null;
  category_color: string | null;
  thumbnail_url: string | null;
  models_count: number;
  is_active: boolean;
  view_count: number;
  created_at: string;
}

interface Category { id: number; name: string; color: string; }

interface PaginatedData {
  data: Content[];
  links: { url: string | null; label: string; active: boolean }[];
  meta: { current_page: number; last_page: number; total: number; from: number; to: number };
}

interface Props {
  contents: PaginatedData;
  categories: Category[];
  filters: { search?: string; category?: string };
}

export default function ArContentsIndex({ contents, categories, filters }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [category, setCategory] = useState(filters.category ?? '');

  const applyFilters = () => {
    router.get('/admin/ar-contents', { search, category }, { preserveState: true });
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Hapus "${title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      router.delete(`/admin/ar-contents/${id}`);
    }
  };

  return (
    <AdminLayout>
      <Head title="Kelola Konten AR" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800"><i className="fa-solid fa-box-open"></i> Konten AR</h1>
          <p className="text-slate-500 font-medium mt-1">
            {contents.meta?.total ?? 0} total konten AR
          </p>
        </div>
        <Link href="/admin/ar-contents/create">
          <Button size="lg" className="gap-2 shadow-lg shadow-violet-500/30">
            <Plus className="w-5 h-5" /> Tambah Konten
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari konten AR..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="pl-10"
              />
            </div>
            <Select value={category} onChange={e => setCategory(e.target.value)} className="sm:w-44">
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Button onClick={applyFilters} variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Konten</th>
                <th className="px-4 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                <th className="px-4 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-4 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider hidden lg:table-cell">Views</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {contents.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <Boxes className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Tidak ada konten ditemukan</p>
                  </td>
                </tr>
              ) : (
                contents.data.map((content) => (
                  <tr key={content.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-violet-100 flex-shrink-0">
                          {content.thumbnail_url ? (
                            <img src={content.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className="w-5 h-5 text-violet-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{content.title}</p>
                          <p className="text-xs text-slate-400">{content.models_count} model terlampir</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {content.category ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: content.category_color ?? '#7C3AED' }}>
                          {content.category}
                        </span>
                      ) : <span className="text-slate-400 text-xs">-</span>}
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      <button
                        onClick={() => router.patch(`/admin/ar-contents/${content.id}`, { is_active: !content.is_active })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          content.is_active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {content.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {content.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      <span className="text-sm font-bold text-slate-600 flex items-center justify-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" /> {content.view_count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/ar/${content.id}`} target="_blank">
                          <Button size="icon" variant="ghost" className="w-8 h-8" title="Lihat">
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>
                        </Link>
                        <Link href={`/admin/ar-contents/${content.id}/edit`}>
                          <Button size="icon" variant="ghost" className="w-8 h-8" title="Edit">
                            <Edit2 className="w-4 h-4 text-violet-500" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8"
                          title="Hapus"
                          onClick={() => handleDelete(content.id, content.title)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {contents.meta && contents.meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 font-medium">
              Menampilkan {contents.meta.from}–{contents.meta.to} dari {contents.meta.total} konten
            </p>
            <div className="flex gap-1">
              {contents.links.map((link, i) => (
                <button
                  key={i}
                  disabled={!link.url}
                  onClick={() => link.url && router.get(link.url)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    link.active
                      ? 'bg-violet-600 text-white'
                      : link.url
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
