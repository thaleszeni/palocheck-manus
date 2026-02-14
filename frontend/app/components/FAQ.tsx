"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
    {
        q: "O PaloCheck substitui o trabalho do psicólogo?",
        a: "Negativo. O PaloCheck é uma ferramenta de automação mecânica. Ele realiza as medições e contagens para economizar seu tempo, mas a interpretação técnica e a decisão clínica são soberanas e obrigatórias por parte do profissional."
    },
    {
        q: "Quem pode utilizar a plataforma?",
        a: "O uso é restrito a psicólogos com CRP ativo e clínicas de avaliação psicológica devidamente credenciadas."
    },
    {
        q: "Preciso obrigatoriamente de um scanner?",
        a: "Recomendamos o uso de scanner para máxima precisão metrológica. No entanto, o sistema possui motores robustos que aceitam fotos de alta resolução, desde que bem iluminadas e sem cortes."
    },
    {
        q: "Como o sistema trata a LGPD?",
        a: "Seguimos os princípios de minimização de dados, anonimização e controle rígido de retenção. Todos os dados são criptografados e os registros de acesso são auditados."
    },
    {
        q: "O sistema decide quem está apto ou inapto?",
        a: "De forma alguma. O PaloCheck fornece indicadores técnicos (NOR, CV, Produtividade). A conclusão sobre aptidão faz parte do processo de avaliação psicológica conduzido pelo humano."
    }
];

export function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 px-6 md:px-12 bg-[var(--color-bg)]">
            <div className="max-w-3xl mx-auto">
                <h3 className="text-4xl font-black text-[var(--color-primary)] text-center mb-16">Perguntas frequentes</h3>

                <div className="space-y-4">
                    {faqs.map((f, i) => (
                        <div key={i} className="card-premium overflow-hidden">
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full p-6 text-left flex justify-between items-center bg-white dark:bg-slate-900/50"
                            >
                                <span className="font-bold text-[var(--color-primary)] leading-tight">{f.q}</span>
                                {open === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {open === i && (
                                <div className="p-6 bg-white dark:bg-slate-900 border-t border-[var(--border)] text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                                    {f.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
