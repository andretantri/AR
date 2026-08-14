import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps as BasePageProps } from '@/types';
import PublicLayout from '@/Layouts/PublicLayout';
import { Search, Eye, Star, Sparkles, Zap, BookOpen, Filter, ChevronRight, ArrowRight, Camera, Monitor } from 'lucide-react';

type PageProps = Omit<BasePageProps, 'auth'> & { auth?: { user?: any } };

interface Category { id: number; name: string; slug: string; icon: string; color: string; }
interface Content {
  id: number; title: string; description: string | null;
  thumbnail_url: string | null; view_count: number;
  category: { name: string; slug: string; icon: string; color: string } | null;
}
interface PaginatedData {
  data: Content[];
  links: { url: string | null; label: string; active: boolean }[];
  meta: { current_page: number; last_page: number; total: number };
}


export default function Home({ contents, categories, filters }: { contents: PaginatedData; categories: Category[]; filters: any }) {
  const { appSettings } = usePage().props as any;
  const [search, setSearch] = useState(filters.search ?? '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category ?? '');

  const appName = appSettings?.app_name ?? 'AR Explorer';
  const welcomeTitle = appSettings?.welcome_title ?? 'Selamat Datang di Dunia AR!';
  const welcomeSubtitle = appSettings?.welcome_subtitle ?? 'Scan, lihat, dan pelajari dunia dengan teknologi Augmented Reality';

  const applyFilters = (overrideCategory?: string) => {
    const catToUse = overrideCategory !== undefined ? overrideCategory : selectedCategory;
    router.get('/', { search, category: catToUse }, { preserveState: true });
  };

  const clearFilters = () => {
    setSearch(''); setSelectedCategory('');
    router.get('/', {});
  };

  const hasFilters = search || selectedCategory;

  return (
    <PublicLayout>
      <Head title={appName} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background blobs */}
        <div className="blob-1 top-0 left-0 opacity-60" />
        <div className="blob-2 bottom-0 right-0 opacity-40" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-8 border border-violet-500/30">
            <i className="fa-solid fa-sparkles text-amber-400"></i>
            <span className="text-sm font-bold text-white/90">Teknologi AR untuk Pelajar</span>
            <i className="fa-solid fa-sparkles text-amber-400"></i>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            {welcomeTitle}
          </h1>
          <p className="text-lg sm:text-xl text-white/70 font-medium mb-10 max-w-2xl mx-auto">
            {welcomeSubtitle}
          </p>

          {/* Floating icons decoration */}
          <div className="absolute -top-4 left-8 float-animation" style={{ animationDelay: '0s' }}>
            <div className="w-12 h-12 rounded-2xl bg-violet-500/30 backdrop-blur flex items-center justify-center text-2xl border border-violet-400/30 text-white">
              <i className="fa-solid fa-ruler-combined"></i>
            </div>
          </div>
          <div className="absolute top-8 right-4 float-animation" style={{ animationDelay: '0.5s' }}>
            <div className="w-12 h-12 rounded-2xl bg-pink-500/30 backdrop-blur flex items-center justify-center text-2xl border border-pink-400/30 text-white">
              <i className="fa-solid fa-microscope"></i>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/4 float-animation" style={{ animationDelay: '1s' }}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/30 backdrop-blur flex items-center justify-center text-xl border border-amber-400/30 text-white">
              <i className="fa-solid fa-earth-asia"></i>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                  placeholder="Cari materi AR..."
                  className="w-full h-14 pl-12 pr-4 rounded-2xl glass border border-white/20 text-white placeholder-white/40 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <button
                onClick={() => applyFilters()}
                className="h-14 px-6 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black transition-all shadow-lg shadow-violet-500/40 hover:-translate-y-0.5 active:scale-95"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/scan"
                className="h-14 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black transition-all shadow-lg shadow-amber-500/40 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Camera className="w-5 h-5" />
                <span className="hidden sm:block">Scan QR</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => { setSelectedCategory(''); applyFilters(''); }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                !selectedCategory ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'glass text-white/70 hover:bg-white/20'
              }`}
            >
              <i className="fa-solid fa-border-all"></i> Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.slug); applyFilters(cat.slug); }}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  selectedCategory === cat.slug ? 'text-white shadow-lg' : 'glass text-white/70 hover:bg-white/20'
                }`}
                style={selectedCategory === cat.slug ? { backgroundColor: cat.color } : {}}
              >
                <i className={cat.icon}></i> {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contents Grid */}
      <section className="py-6 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Filter & Count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white">
                {hasFilters ? 'Hasil Pencarian' : 'Semua Konten AR'}
              </h2>
              <span className="glass text-white/60 text-sm font-bold px-3 py-1 rounded-full border border-white/10">
                {contents.meta?.total ?? contents.data.length} konten
              </span>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm font-bold text-white/50 hover:text-white transition-colors flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Reset Filter
              </button>
            )}
          </div>

          {/* Grid */}
          {contents.data.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 text-white/50"><i className="fa-solid fa-magnifying-glass"></i></div>
              <p className="text-xl font-black text-white/70">Tidak ada konten ditemukan</p>
              <p className="text-white/40 font-medium mt-2">Coba kata kunci atau kategori lain</p>
              <button onClick={clearFilters} className="mt-6 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors">
                Lihat Semua Konten
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contents.data.map((content) => (
                <div key={content.id} className="ar-card glass border border-white/10 hover:border-white/30 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Thumbnail & Link */}
                    <Link href={`/ar/${content.id}`} className="group block relative aspect-video overflow-hidden bg-gradient-to-br from-violet-900 to-indigo-900">
                      {content.thumbnail_url ? (
                        <img
                          src={content.thumbnail_url}
                          alt={content.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <i className={`${content.category?.icon ?? 'fa-solid fa-box'} text-5xl mb-2 text-white/50`}></i>
                          <span className="text-white/40 text-xs font-bold">No Preview</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      {content.category && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black text-white shadow-lg"
                            style={{ backgroundColor: content.category.color }}>
                            <i className={content.category.icon}></i> {content.category.name}
                          </span>
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                          <Zap className="w-6 h-6 text-violet-700 ml-0.5" />
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link href={`/ar/${content.id}`} className="hover:text-violet-300 transition-colors">
                        <h3 className="font-black text-white text-sm leading-snug mb-2 line-clamp-2">
                          {content.title}
                        </h3>
                      </Link>
                      {content.description && (
                        <p className="text-white/50 text-xs font-medium line-clamp-2 mb-3">
                          {content.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-0 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/40 font-bold border-t border-white/10 pt-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {content.view_count} tayangan
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <Link
                        href={`/ar/${content.id}`}
                        className="py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/20 transition-all active:scale-95"
                      >
                        <Monitor className="w-3.5 h-3.5" /> Preview 3D
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {contents.meta && contents.meta.last_page > 1 && (
            <div className="flex justify-center mt-10 gap-2">
              {contents.links.map((link, i) => (
                <button
                  key={i}
                  disabled={!link.url}
                  onClick={() => link.url && router.get(link.url)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    link.active
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                      : link.url
                      ? 'glass text-white/70 hover:bg-white/20'
                      : 'text-white/20 cursor-not-allowed'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
