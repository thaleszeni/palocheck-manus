"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Microscope, BarChart3, Activity, Settings2, FileOutput } from 'lucide-react';

const features = [
    {
        icon: Scan,
        title: "Pré-processamento Intelligent",
        desc: "Corrige perspectiva, anula sombras e realça o contraste para uma leitura digital perfeita do papel."
    },
    {
        icon: Microscope,
        title: "Detecção Watershed",
        desc: "Motor de visão de alta precisão que separa palos colados com acuidade superior à medição humana."
    },
    {
        icon: BarChart3,
        title: "Métricas por Intervalo",
        desc: "Cálculo instantâneo de produtividade, NOR e CV para cada um dos 5 intervalos do teste."
    },
    {
        icon: Activity,
        title: "Score de Confiabilidade",
        desc: "O sistema indica a qualidade do scan, sinalizando quando a imagem precisa de novo carregamento."
    },
    {
        icon: Settings2,
        title: "Revisão Manual Assistida",
        desc: "Liberdade total para o psicólogo ajustar marcações, garantindo que o laudo reflita a verdade clínica."
    },
    {
        icon: FileOutput,
        title: "Pré-laudo Estruturado",
        desc: "Sugestão técnica baseada nas normas que você define, pronta para sua revisão final e exportação."
    }
];

export function FeatureGrid() {
    return (
        <section id="benefícios" className="py-24 px-6 md:px-12 bg-white dark:bg-[var(--color-bg-dark)]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <h2 className="text-sm font-black text-[var(--color-secondary)] uppercase tracking-[0.3em]">Tecnologia e Precisão</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-[var(--color-primary)]">O que o PaloCheck faz por você</h3>
                    <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                        Unimos visão computacional avançada com o rigor clínico exigido pela psicologia profissional.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -8 }}
                            className="card-premium p-10 space-y-6 group"
                        >
                            <div className="w-14 h-14 bg-[var(--color-primary)]/5 rounded-2xl flex items-center justify-center text-[var(--color-secondary)] group-hover:bg-[var(--color-secondary)] group-hover:text-white transition-all duration-300">
                                <f.icon size={28} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xl font-bold text-[var(--color-primary)]">{f.title}</h4>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
