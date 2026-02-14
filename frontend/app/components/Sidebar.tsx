"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    FolderOpen,
    PlusCircle,
    Settings,
    Users,
    ShieldAlert,
    LayoutDashboard,
    LogOut,
    ChevronRight,
    ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/cases', roles: ['admin', 'psychologist', 'assistant', 'reader'] },
    { icon: FolderOpen, label: 'Gerenciar Casos', href: '/cases', roles: ['admin', 'psychologist', 'assistant', 'reader'] },
    { icon: PlusCircle, label: 'Novo Exame', href: '/cases/new', roles: ['admin', 'psychologist', 'assistant'] },
    { icon: ClipboardList, label: 'Configurações de Normas', href: '/settings/rulesets', roles: ['admin', 'psychologist'] },
    { icon: Users, label: 'Usuários e Equipe', href: '/settings/users', roles: ['admin'] },
    { icon: ShieldAlert, label: 'Privacidade e LGPD', href: '/settings/security', roles: ['admin'] },
];

export function Sidebar({ userRole = 'psychologist' }: { userRole?: string }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('pc_token');
        localStorage.removeItem('pc_token_type');
        router.push('/login');
    };

    return (
        <aside className="w-72 bg-[var(--color-primary)] h-screen flex flex-col sticky top-0 border-r border-white/5 transition-all">
            {/* Brand area */}
            <Link href="/" className="p-8 pb-12 flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-white text-xl border border-white/10">
                    P
                </div>
                <span className="font-black text-2xl tracking-tighter text-white">
                    Palo<span className="font-medium text-white/40">Check</span>
                </span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {NAV_ITEMS.filter(item => item.roles.includes(userRole)).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`
                group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative overflow-hidden
                ${isActive ? 'bg-[var(--color-secondary)] text-white shadow-lg shadow-[var(--color-secondary)]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}
              `}
                        >
                            {isActive && (
                                <motion.div layoutId="nav-bg" className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                            )}
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
                            {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                        </Link>
                    )
                })}
            </nav>

            {/* User / Bottom area */}
            <div className="p-6 mt-auto border-t border-white/5 space-y-4">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] border-2 border-white/10 shadow-xl" />
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm tracking-tight uppercase">Thales Master</span>
                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{userRole} CRP/01</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                >
                    <LogOut size={16} />
                    Encerrar Sessão
                </button>
            </div>
        </aside>
    );
}
