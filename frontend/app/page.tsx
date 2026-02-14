"use client";
import React from 'react';
import { LandingHeader } from './components/LandingHeader';
import { LandingHero } from './components/LandingHero';
import { FeatureGrid } from './components/FeatureGrid';
import { Stepper } from './components/Stepper';
import { SecuritySection } from './components/SecuritySection';
import { FAQ } from './components/FAQ';
import { LandingFooter } from './components/LandingFooter';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { trackEvent } from './utils/tracking';

export default function HomePage() {
  const router = useRouter();

  const handleCTA = async (id: string, path: string) => {
    // Tracking assíncrono (não bloqueante)
    trackEvent(id, "home");
    // Navegação imediata para melhor UX (tracking ocorre em bg)
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--color-bg-dark)] selection:bg-[var(--color-secondary)] selection:text-white scroll-smooth">
      <LandingHeader />

      <main>
        {/* LandingHero internal buttons mapping (Simplified here for targetContent match) */}
        <LandingHero
          onDemo={() => handleCTA("home_demo", "/demo")}
          onHowItWorks={() => handleCTA("home_how_it_works", "/como-funciona#upload")}
        />

        {/* Seção "Para quem é" (Mini section) */}
        <section className="py-20 px-6 md:px-12 bg-slate-50 dark:bg-[var(--color-bg-dark)]/50 border-y border-[var(--border)]">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
            {[
              { title: "Psicólogos CRP", desc: "Autonomia clínica com suporte inteligente na medição métrica do palográfico." },
              { title: "Clínicas de Avaliação", desc: "Padronização total e rastreabilidade absoluta de todos os casos e protocolos." },
              { title: "Eficiência Operacional", desc: "Redução do tempo mecânico de contagem, permitindo foco na análise diagnóstica." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4 text-center md:text-left"
              >
                <h4 className="text-xl font-black text-[var(--color-primary)]">{item.title}</h4>
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <FeatureGrid />

        {/* Banner de Impacto (Benefícios de tempo) */}
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-5xl mx-auto bg-[var(--color-primary)] rounded-[2.5rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-secondary)]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-accent)]/10 rounded-full blur-[100px]" />

            <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Ganhe tempo no que é mecânico.<br />
              <span className="text-[var(--color-secondary)]">Preserve o que é clínico.</span>
            </h3>

            <ul className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
              {[
                "Reduz tempo de contagem repetitiva",
                "Diminui erros humanos de medição",
                "Padroniza relatórios técnicos",
                "Facilita o armazenamento digital"
              ].map((li, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 font-bold text-sm uppercase lg:text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
                  {li}
                </li>
              ))}
            </ul>

            <div className="pt-8 flex flex-col items-center gap-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                "Automatizar a medição pode reduzir significativamente o tempo operacional por caso"
              </p>
              <button
                onClick={() => handleCTA("home_try_free_impact", "/signup")}
                className="btn-accent"
              >
                EXPERIMENTAR GRATUITAMENTE
              </button>
            </div>
          </div>
        </section>

        <Stepper />
        <SecuritySection />
        <FAQ />

        {/* CTA FINAL */}
        <section className="py-24 px-6 md:px-12 bg-white dark:bg-[var(--color-bg-dark)]">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h3 className="text-4xl md:text-6xl font-black text-[var(--color-primary)]">Quer ver o PaloCheck na prática?</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <button onClick={() => handleCTA("home_demo_final", "/demo")} className="btn-accent text-xl px-12 py-6">Solicitar demonstração</button>
              <button onClick={() => handleCTA("home_support_final", "/suporte?focus=whatsapp")} className="btn-secondary text-xl px-12 py-6 font-black uppercase text-xs tracking-widest">Falar com suporte</button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
