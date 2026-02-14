import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
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
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Termos de Uso</h1>

                <div className="space-y-8 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">1. Elegibilidade</h2>
                        <p>
                            O uso do PaloCheck é estritamente restrito a psicólogos com registro ativo no Conselho Regional de Psicologia (CRP). Ao criar uma conta, você declara sob as penas da lei que possui habilitação legal para utilizar instrumentos de avaliação psicológica.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">2. Natureza da Ferramenta</h2>
                        <p>
                            O sistema é uma ferramenta de <strong>apoio técnico</strong>, e não uma ferramenta decisória. O PaloCheck processa dados gráficos para agilizar a mensuração, mas não possui capacidade legal ou técnica para substituir o julgamento humano.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">3. Responsabilidade Final</h2>
                        <p>
                            A responsabilidade final sobre qualquer laudo, parecer ou decisão tomada com base nos dados do PaloCheck é <strong>exclusiva do profissional psicólogo</strong>. Recomendamos fortemente a leitura da página de <Link href="/uso-profissional" className="text-blue-600 hover:underline">Uso Profissional</Link> para compreensão detalhada dos limites do sistema.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">4. Proibições</h2>
                        <p>
                            É terminantemente proibido utilizar o PaloCheck para automação total de processos de seleção, desligamento ou diagnóstico sem a devida supervisão e validação humana caso a caso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">5. Suspensão de Acesso</h2>
                        <p>
                            Reservamo-nos o direito de suspender ou cancelar o acesso de usuários que violem estes termos, utilizem a ferramenta de forma antiética ou não comprovem sua habilitação profissional quando solicitado.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
