import React from 'react';
import Link from 'next/link';

export default function EthicalLimitsPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <header className="bg-white border-b border-slate-200 py-6 px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black text-slate-800 tracking-tighter">
                        Palo<span className="text-blue-600">Check</span>
                    </Link>
                    <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition">
                        Acessar Sistema
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto py-16 px-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Limites Éticos</h1>

                <div className="space-y-8 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">1. Alinhamento com o CFP</h2>
                        <p>
                            O desenvolvimento e a operação do PaloCheck observam rigorosamente as resoluções do Conselho Federal de Psicologia (CFP) aplicáveis ao uso de tecnologia na avaliação psicológica.
                        </p>
                    </section>

                    <section className="bg-slate-100 p-6 rounded-xl border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">2. Proibição de Automação Diagnóstica</h2>
                        <p>
                            É vedado ao sistema emitir qualquer conclusão diagnóstica fechada. O diagnóstico psicológico é um processo complexo que envolve integração de múltiplos dados e escuta qualificada, sendo <strong>indelegável a algoritmos</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">3. Uso Assistido e Supervisionado</h2>
                        <p>
                            A ferramenta deve ser utilizada como um "assistente de precisão", medindo o que o olho humano teria dificuldade de medir com exatidão (milímetros, ângulos), permitindo que o psicólogo foque na análise qualitativa e clínica.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">4. Transparência Técnica</h2>
                        <p>
                            Comprometemo-nos a ser transparentes sobre as limitações técnicas do sistema. Quando o software não tiver certeza (confiança baixa), ele não tentará "adivinhar", e sim solicitará a intervenção do profissional.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">5. Compromisso Institucional</h2>
                        <p>
                            O PaloCheck mantém um compromisso ético contínuo de aprimoramento e revisão, garantindo que a inovação tecnológica nunca se sobreponha à ética profissional e ao respeito pelo ser humano avaliado.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
