"use client";
import React from 'react';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';
import { motion } from 'framer-motion';
import { Upload, Microscope, BarChart3, Settings2, FileOutput, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const steps = [
    {
        id: "upload",
        icon: Upload,
        title: "1. Envio do Material",
        desc: "O processo começa com o upload do scan ou foto do teste palográfico. Nosso sistema aceita arquivos PNG, JPG ou PDF. Recomendamos scans de 300DPI para máxima fidelidade."
    },
    {
        id: "processamento",
        icon: Microscope,
        title: "2. Motor de Visão Computacional",
        desc: "Iniciamos o pré-processamento (Warp Perspective) para alinhar a folha e o Algoritmo Watershed para separar palos colados, eliminando marcas de mesa ou sombras indesejadas."
    },
    {
        id: "metricas",
        icon: BarChart3,
        title: "3. Cálculo de Indicadores",
        desc: "O PaloCheck calcula instantaneamente a Produtividade, o NOR (Nível de Oscilação Rítmica) e o CV (Coeficiente de Variação) por intervalo, fornecendo uma base estatística sólida."
    },
    {
        id: "revisao",
        icon: Settings2,
        title: "4. Revisão e Ajuste Manual",
        desc: "Nada substitui o olho clínico. Na tela de revisão, você pode adicionar ou remover palos detectados, ajustar a área de interesse (ROI) e recalibrar a escala em milímetros."
    },
    {
        id: "pre-laudo",
        icon: FileOutput,
        title: "5. Emissão de Laudo Ético",
        desc: "Ao finalizar, o sistema gera uma síntese clínica baseada no seu ruleset. Após sua validação humana obrigatória, o documento final é assinado digitalmente e exportado em PDF."
    }
];

export default function ComoFuncionaPage() {
    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <LandingHeader />

            <main className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-20">
                        <h1 className="text-4xl md:text-6xl font-black text-[var(--color-primary)] tracking-tighter uppercase">Transparent Tech</h1>
                        <p className="text-xl text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">Entenda como a ciência de dados e a psicologia se unem no PaloCheck.</p>
                    </div>

                    <div className="space-y-12">
                        {steps.map((s, i) => (
                            <motion.section
                                key={s.id}
                                id={s.id}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="card-premium p-12 md:p-20 grid lg:grid-cols-2 gap-16 items-center bg-white scroll-mt-24"
                            >
                                <div className={`${i % 2 !== 0 ? 'lg:order-2' : ''} space-y-8`}>
                                    <div className="w-16 h-16 bg-[var(--color-secondary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-secondary)]">
                                        <s.icon size={32} />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black text-[var(--color-primary)] tracking-tight">{s.title}</h2>
                                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-medium">
                                            {s.desc}
                                        </p>
                                    </div>
                                    {s.id === 'pre-laudo' && (
                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                            <ShieldCheck className="text-amber-600 shrink-0" size={24} />
                                            <p className="text-xs text-amber-900 font-bold uppercase tracking-widest leading-tight">Garantia Ética: Revisão humana é obrigatória para exportação final.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center p-10 overflow-hidden relative group">
                                    <div className="text-center space-y-4">
                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-slate-300 group-hover:text-[var(--color-secondary)] transition-all duration-500">
                                            <s.icon size={40} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-40">Módulo Visual: {s.id}</p>
                                    </div>
                                    {/* Decorative gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--color-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.section>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-20 text-center space-y-10 py-20 bg-[var(--color-primary)] rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-secondary)]/10 rounded-full blur-[100px]" />
                        <h3 className="text-3xl md:text-5xl font-black leading-tight z-10 relative">Pronto para começar?</h3>
                        <div className="flex flex-wrap justify-center gap-6 z-10 relative">
                            <Link href="/signup" className="btn-accent px-12 py-6 text-lg">EXPERIMENTAR GRATUITAMENTE</Link>
                            <Link href="/demo" className="btn-secondary text-white border-white/20 px-12 py-6 text-lg">SOLICITAR DEMONSTRAÇÃO</Link>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
