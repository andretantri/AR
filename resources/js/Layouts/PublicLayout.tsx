import React, { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Sparkles, Home, BookOpen } from 'lucide-react';

import { PageProps as BasePageProps } from '@/types';

type PageProps = Omit<BasePageProps, 'auth'> & { auth?: { user?: any } };

export default function PublicLayout({ children }: PropsWithChildren) {
  const { appSettings } = usePage().props as any;

  const appName = appSettings?.app_name ?? 'AR Explorer';
  const footerText = appSettings?.footer_text ?? `© ${new Date().getFullYear()} ${appName}`;

  return (
    <div className="min-h-screen bg-gradient-hero text-white font-nunito">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">{appName}</span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:block">Beranda</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-lg shadow-violet-500/30"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:block">Guru / Admin</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-dark border-t border-white/10 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg text-white">{appName}</span>
          </div>
          <p className="text-white/50 text-sm">{footerText}</p>
        </div>
      </footer>
    </div>
  );
}
