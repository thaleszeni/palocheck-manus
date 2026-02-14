"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, Lock } from 'lucide-react';

interface LandingHeroProps {
    onDemo?: () => void;
    onHowItWorks?: () => void;
}

export function LandingHero({ onDemo, onHowItWorks }: LandingHeroProps) {
    return (
        <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-40 px-6 md:px-12 bg-gradient-to-b from-[var(--color-bg)] to-white dark:from-[var(--color-bg)] dark:to-[var(--color-primary)]/5">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-full text-xs font-black uppercase tracking-widest border border-[var(--color-secondary)]/20">
                        <ShieldCheck size={14} />
                        Correção assistida com ética e precisão
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-[var(--color-primary)] leading-[1.05] tracking-tighter">
                        Menos tempo medindo.<br />
                        <span className="text-[var(--color-secondary)]">Mais tempo analisando.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-xl font-medium">
                        O PaloCheck automatiza a medição métrica e organiza indicadores para você revisar com segurança.
                        Ferramenta exclusiva para psicólogos com CRP ativo.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button onClick={onDemo} className="btn-accent text-lg px-10 py-5">
                            Solicitar demonstração
                        </button>
                        <button onClick={onHowItWorks} className="btn-secondary text-lg px-10 py-5 font-black uppercase tracking-widest text-xs">
                            Ver como funciona
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-10">
                        {[
                            { icon: UserCheck, text: "Revisão humana obrigatória" },
                            { icon: Lock, text: "LGPD e segurança" },
                            { icon: ShieldCheck, text: "Auditoria técnica" }
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-2 text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest opacity-70">
                                <badge.icon size={16} className="text-[var(--color-secondary)]" />
                                {badge.text}
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="aspect-[4/3] bg-white dark:bg-[var(--color-surface-dark)] rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(11,31,59,0.15)] border-4 border-white dark:border-[var(--color-primary)] overflow-hidden">
                        {/* Mockup visual placeholder */}
                        <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col">
                            <div className="flex gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                            </div>
                            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-x-0 top-1/4 h-px bg-blue-500/30 z-10" />
                                <div className="absolute inset-x-0 top-1/2 h-px bg-blue-500/30 z-10" />
                                <div className="absolute inset-y-0 left-1/3 w-px bg-blue-500/20 z-10" />

                                <div className="grid grid-cols-4 gap-4 opacity-20">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="w-1 h-12 bg-slate-900 rounded-full" />
                                    ))}
                                </div>

                                {/* Overlay visual mimic */}
                                <div className="absolute top-10 right-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-pulse">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Métricas de Ritmo</p>
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl font-black text-[var(--color-secondary)] leading-none">5.2%</div>
                                        <div className="text-[8px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded uppercase">NOR Estável</div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Interface de Revisão Assistida</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />
                    <div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--color-secondary)]/10 rounded-full blur-3xl" />
                </motion.div>
            </div>
        </section>
    );
}
