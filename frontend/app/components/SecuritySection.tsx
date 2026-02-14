"use client";
import React from 'react';
import { ShieldCheck, Lock, Eye, ClipboardCheck } from 'lucide-react';

export function SecuritySection() {
    return (
        <section id="segurança" className="py-24 px-6 md:px-12 bg-white dark:bg-[var(--color-bg-dark)]">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
                <h3 className="text-3xl md:text-5xl font-black text-[var(--color-primary)] text-center mb-16">Segurança e Conformidade Ética</h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            icon: Lock,
                            title: "Conformidade LGPD",
                            desc: "Minimização de dados e controle absoluto sobre a retenção de informações sensíveis."
                        },
                        {
                            icon: ShieldCheck,
                            title: "Criptografia Avançada",
                            desc: "Dados protegidos com algoritmos militares tanto em repouso quanto em trânsito."
                        },
                        {
                            icon: Eye,
                            title: "Controle de Acesso",
                            desc: "Gestão rígida de permissões (RBAC) garantindo que apenas usuários autorizados acessem os casos."
                        },
                        {
                            icon: ClipboardCheck,
                            title: "Auditoria Imutável",
                            desc: "Registro detalhado de cada alteração manual feita nos indicadores para total rastreabilidade."
                        }
                    ].map((item, i) => (
                        <div key={i} className="card-premium p-8 flex flex-col items-center text-center space-y-4">
                            <div className="text-[var(--color-secondary)] mb-2">
                                <item.icon size={40} strokeWidth={1} />
                            </div>
                            <h4 className="font-bold text-[var(--color-primary)]">{item.title}</h4>
                            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 p-8 bg-amber-50 dark:bg-[var(--color-surface)] border border-amber-100 dark:border-amber-900/30 rounded-3xl max-w-4xl flex gap-6 items-start">
                    <div className="text-amber-600 text-3xl">⚖️</div>
                    <div className="space-y-2">
                        <h5 className="font-black text-amber-900 dark:text-amber-500 uppercase text-xs tracking-widest">Aviso de Limites Éticos</h5>
                        <p className="text-sm text-amber-800 dark:text-slate-300 font-medium leading-relaxed">
                            O PaloCheck é uma ferramenta de apoio técnico. O sistema não decide aptidão, não emite diagnósticos automáticos e <strong>não substitui a avaliação soberana do psicólogo</strong>. A análise e conclusão clínica são de responsabilidade exclusiva do profissional com CRP ativo.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
