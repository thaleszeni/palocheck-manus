"use client";
import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
    return (
        <footer className="py-12 bg-white dark:bg-[var(--color-bg-dark)] border-t border-[var(--border)] px-6 md:px-12">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center font-black text-white text-base">P</div>
                        <span className="font-black text-xl tracking-tighter text-[var(--color-primary)]">
                            Palo<span className="font-medium text-[var(--text-secondary)]">Check</span>
                        </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                        Tecnologia de ponta a favor do psicólogo.<br />
                        Menos mecânica, mais clínica.
                    </p>
                </div>

                <div className="space-y-4">
                    <h5 className="font-black text-xs uppercase tracking-widest text-[var(--color-primary)]">Plataforma</h5>
                    <nav className="flex flex-col gap-3">
                        <Link href="#" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)]">Como Funciona</Link>
                        <Link href="#" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)]">Benefícios</Link>
                        <Link href="#" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)]">Segurança</Link>
                    </nav>
                </div>

                <div className="space-y-4">
                    <h5 className="font-black text-xs uppercase tracking-widest text-[var(--color-primary)]">Legal</h5>
                    <nav className="flex flex-col gap-3">
                        <Link href="/uso-profissional" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)]">Uso Profissional</Link>
                        <Link href="/termos-de-uso" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)]">Termos de Uso</Link>
                        <Link href="/privacidade" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)]">Privacidade</Link>
                        <Link href="/limites-eticos" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)]">Limites Éticos</Link>
                    </nav>
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--border)]">
                        <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-tighter mb-2">Uso Restrito</p>
                        <p className="text-[9px] text-[var(--text-secondary)] leading-tight font-medium">Plataforma destinada a Psicólogos com CRP ativo. Acesso sujeito a verificação de credenciais.</p>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold opacity-50">© 2026 PaloCheck Inc. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
