"use client";
import React from 'react';
import Link from 'next/link';

export function LandingHeader() {
    return (
        <header className="glass-header h-20 px-6 md:px-12 flex items-center justify-between">
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center font-black text-white text-xl">
                    P
                </div>
                <span className="font-black text-2xl tracking-tighter text-[var(--color-primary)]">
                    Palo<span className="font-medium text-[var(--text-secondary)]">Check</span>
                </span>
            </button>

            <nav className="hidden lg:flex items-center gap-8">
                {['Como funciona', 'Benefícios', 'Segurança', 'Para psicólogos', 'FAQ'].map((item) => (
                    <Link
                        key={item}
                        href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                        className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </nav>

            <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-[var(--text-primary)] px-4 py-2 hover:bg-[var(--text-primary)]/5 rounded-xl transition-all">
                    Entrar
                </Link>
                <button className="hidden sm:block btn-accent scale-90">
                    Solicitar demonstração
                </button>
            </div>
        </header>
    );
}
