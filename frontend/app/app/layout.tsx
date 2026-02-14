"use client";
import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Search, Bell, User, ChevronDown } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    // In a real app, we'd fetch the user profile from a Hook
    const user = { name: "Thales Master", role: "psychologist" };

    return (
        <div className="flex min-h-screen bg-[var(--color-bg)]">
            {/* Dynamic Sidebar */}
            <Sidebar userRole={user.role} />

            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="h-20 border-b border-[var(--color-border)] bg-white dark:bg-[var(--color-surface-dark)] px-10 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[var(--color-bg-dark)]/80">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40 group-focus-within:text-[var(--color-secondary)] group-focus-within:opacity-100 transition-all" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por paciente, protocolo ou data..."
                                className="w-full bg-[var(--color-bg)] h-12 pl-12 pr-4 rounded-xl border border-transparent focus:border-[var(--color-secondary)]/20 focus:bg-white focus:shadow-lg focus:shadow-[var(--color-secondary)]/5 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-accent)] rounded-full border-2 border-white shadow-sm" />
                        </button>

                        <div className="h-8 w-px bg-[var(--color-border)]" />

                        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-[var(--color-primary)] tracking-tight leading-none mb-1 uppercase">{user.name}</p>
                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-none">CRP Master</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-[var(--color-border)] group-hover:border-[var(--color-secondary)]/30 transition-all overflow-hidden">
                                <User size={20} className="text-[var(--text-secondary)]" />
                            </div>
                            <ChevronDown size={14} className="text-[var(--text-secondary)] opacity-50 group-hover:opacity-100 transition-all" />
                        </div>
                    </div>
                </header>

                {/* Main Workspace */}
                <main className="flex-1 p-10 max-w-[1600px] mx-auto w-full overflow-y-auto">
                    {/* Breadcrumb Placeholder */}
                    <nav className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50">
                        <span>PaloCheck</span>
                        <span className="text-xs">/</span>
                        <span className="text-[var(--color-primary)] opacity-100">Dashboard</span>
                    </nav>

                    {children}
                </main>
            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { 
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; 
          letter-spacing: -0.01em;
        }
      `}</style>
        </div>
    );
}
