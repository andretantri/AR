import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Boxes, Eye, FolderOpen, TrendingUp, Plus, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Stats {
  totalContents: number;
  activeContents: number;
  totalCategories: number;
  totalViews: number;
}

interface RecentContent {
  id: number;
  title: string;
  category: string | null;
  grade_level: string | null;
  view_count: number;
  is_active: boolean;
  created_at: string;
}

interface Props {
  stats: Stats;
  recentContents: RecentContent[];
}

const statCards = [
  { label: 'Total Konten AR', key: 'totalContents', icon: Boxes, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600' },
  { label: 'Konten Aktif', key: 'activeContents', icon: CheckCircle, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { label: 'Kategori', key: 'totalCategories', icon: FolderOpen, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600' },
  { label: 'Total Views', key: 'totalViews', icon: Eye, color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', text: 'text-cyan-600' },
];

export default function Dashboard({ stats, recentContents }: Props) {
  return (
    <AdminLayout>
      <Head title="Dashboard Admin" />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800"><i className="fa-solid fa-chart-simple"></i> Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Selamat datang kembali! Berikut ringkasan aplikasi AR kamu.</p>
        </div>
        <Link
          href="/admin/ar-contents/create"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-violet-500/30 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:block">Tambah Konten AR</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, key, icon: Icon, color, bg, text }) => (
          <Card key={key} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">{label}</p>
                  <p className="text-4xl font-black text-slate-800">
                    {(stats[key as keyof Stats] ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${text}`} />
                </div>
              </div>
              <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${color} opacity-70`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Contents */}
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              Konten Terbaru
            </CardTitle>
            <Link href="/admin/ar-contents" className="text-sm font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentContents.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Boxes className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold">Belum ada konten AR</p>
              <p className="text-sm">Mulai tambahkan konten AR pertamamu!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentContents.map((content) => (
                <div key={content.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Boxes className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{content.title}</p>
                    <p className="text-xs text-slate-400 font-medium">
                      {content.category ?? 'Tanpa Kategori'} • {content.grade_level ?? '-'} • {content.created_at}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {content.view_count}
                    </span>
                    {content.is_active ? (
                      <Badge variant="success">Aktif</Badge>
                    ) : (
                      <Badge variant="destructive">Nonaktif</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
