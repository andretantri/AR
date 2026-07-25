import React, { useState, PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  LayoutDashboard, Boxes, FolderOpen, Settings, LogOut,
  Menu, X, ChevronRight, Sparkles, Bell, User
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { PageProps } from '@/types';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/ar-contents', label: 'Konten AR', icon: Boxes },
  { href: '/admin/categories', label: 'Kategori', icon: FolderOpen },
  { href: '/admin/users', label: 'Pengguna', icon: User },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export default function AdminLayout({ children }: PropsWithChildren) {
  const { appSettings, auth } = usePage<PageProps>().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = window.location.pathname;

  const appName = appSettings?.app_name ?? 'AR Explorer';
  const userName = auth?.user?.name ?? 'Admin';

  return (
    <div className="flex h-screen bg-slate-50 font-nunito overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 admin-sidebar transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg leading-tight">{appName}</h1>
            <p className="text-violet-300 text-xs font-medium">Admin Panel</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="px-4 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = currentPath.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group",
                  isActive
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                    : "text-violet-200 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Halaman Publik */}
        <div className="px-4 mt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-300 hover:bg-amber-500/20 transition-all duration-200 border border-amber-500/30"
          >
            <Sparkles className="w-5 h-5" />
            <span>Lihat Halaman Publik</span>
          </Link>
        </div>

        {/* Bottom User */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white font-black text-sm">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{userName}</p>
              <p className="text-violet-300 text-xs truncate">Administrator</p>
            </div>
            <Link href="/logout" method="post" as="button" className="text-violet-300 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center gap-4 px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-sm">
              {userName.charAt(0)}
            </div>
            <span className="hidden md:block text-sm font-bold text-slate-700">{userName}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
