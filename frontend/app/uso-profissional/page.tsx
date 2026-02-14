import React from 'react';
import Link from 'next/link';

export default function ProfessionalUsePage() {
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
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Uso Profissional</h1>
                <p className="text-lg text-slate-500 mb-12 leading-relaxed">
                    PaloCheck — Sistema de Correção Assistida do Teste Palográfico
                </p>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">1. O que é o PaloCheck</h2>
                        <p className="text-slate-600 leading-relaxed">
                            O PaloCheck é um sistema de correção assistida do Teste Palográfico, desenvolvido para apoiar o trabalho técnico do psicólogo, sem substituir sua avaliação clínica, interpretação profissional ou responsabilidade ética.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">2. O que o sistema faz</h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                            <li>Mede automaticamente aspectos gráficos do teste</li>
                            <li>Organiza métricas por tempo, linha e estrutura</li>
                            <li>Identifica padrões gráficos e variações</li>
                            <li>Sinaliza inconsistências técnicas</li>
                            <li>Gera relatórios assistidos para apoio à análise profissional</li>
                        </ul>
                    </section>

                    <section className="bg-red-50 p-8 rounded-2xl border border-red-100">
                        <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                            <span>⚠️</span> 3. O que o sistema NÃO faz
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-red-700 font-medium">
                            <li>Não emite diagnóstico psicológico</li>
                            <li>Não define apto ou inapto</li>
                            <li>Não substitui julgamento clínico</li>
                            <li>Não realiza interpretação conclusiva automática</li>
                            <li>Não finaliza laudos sem revisão humana</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">4. Papel do Psicólogo</h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                            <li>Revisar métricas</li>
                            <li>Validar ou corrigir dados</li>
                            <li>Interpretar clinicamente os resultados</li>
                            <li>Assinar e responder pelo laudo final</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">5. Segurança, Confiabilidade e Auditoria</h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                            <li>Estados inválidos são explicitamente sinalizados</li>
                            <li>Métricas não calculáveis exibidas como “N/A”</li>
                            <li>Não há preenchimentos artificiais</li>
                            <li>Alterações manuais são auditadas</li>
                            <li>Sistema rastreável</li>
                        </ul>
                    </section>

                    <section className="bg-slate-100 p-8 rounded-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">6. Responsabilidade Profissional</h2>
                        <p className="text-slate-700 font-medium leading-relaxed">
                            “O uso do PaloCheck não exime o psicólogo de sua responsabilidade técnica e ética, conforme as normas do Conselho Federal de Psicologia.”
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} PaloCheck. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
