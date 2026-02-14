"use client";
import React from 'react';
import { motion } from 'framer-motion';

const steps = [
    {
        num: "01",
        title: "Envio Seguro",
        desc: "Carregue o scan ou foto do teste. O sistema processa em segundos."
    },
    {
        num: "02",
        title: "Medição Métrica",
        desc: "Nossos algoritmos contam e medem cada palo com altíssima precisão."
    },
    {
        num: "03",
        title: "Revisão Clínica",
        desc: "Você valida os dados, faz ajustes se necessário e garante o rigor ético."
    },
    {
        num: "04",
        title: "Emissão de Laudo",
        desc: "Gere o documento final com embasamento técnico pronto para assinatura."
    }
];

export function Stepper() {
    return (
        <section id="como-funciona" className="py-24 px-6 md:px-12 bg-[var(--color-bg)]">
            <div className="max-w-7xl mx-auto">
                <h3 className="text-4xl font-black text-[var(--color-primary)] text-center mb-20">Como funciona o PaloCheck</h3>

                <div className="grid md:grid-cols-4 gap-12 relative">
                    {/* Connection line for desktop */}
                    <div className="hidden md:block absolute top-[60px] left-20 right-20 h-0.5 bg-[var(--color-border)] z-0" />

                    {steps.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative z-10 flex flex-col items-center text-center space-y-6 group"
                        >
                            <div className="w-16 h-16 bg-[var(--surface)] border-2 border-[var(--color-secondary)] rounded-full flex items-center justify-center font-black text-[var(--color-secondary)] shadow-xl shadow-[var(--color-secondary)]/5 group-hover:scale-110 transition-transform">
                                {s.num}
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-[var(--color-primary)]">{s.title}</h4>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-semibold">{s.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
