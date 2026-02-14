import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Política de Privacidade</h1>

                <div className="space-y-8 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">1. Conformidade com a LGPD</h2>
                        <p>
                            O PaloCheck está comprometido com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Tratamos os dados pessoais e sensíveis com o mais alto nível de segurança e transparência.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">2. Dados Sensíveis</h2>
                        <p>
                            Reconhecemos que imagens de testes psicológicos e dados de avaliados são <strong>dados sensíveis</strong>. O armazenamento dessas informações é feito de forma criptografada e o acesso é estritamente controlado pelo profissional responsável pela conta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">3. Finalidade do Tratamento</h2>
                        <p>
                            Os dados são coletados e processados exclusivamente para a finalidade de correção técnica do teste palográfico e geração de relatórios de apoio ao psicólogo usuário. Não utilizamos os dados dos avaliados para fins de marketing ou venda a terceiros.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">4. Segurança e Logs</h2>
                        <p>
                            Mantemos registros (logs) de acesso e edição para garantir a integridade e a auditabilidade do processo de avaliação. Todas as ações críticas no sistema são rastreadas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">5. Seus Direitos</h2>
                        <p>
                            Como titular dos dados (ou controlador, no caso do psicólogo), você tem direito a solicitar acesso, correção, anonimização ou exclusão dos dados armazenados em nossos servidores, conforme previsto em lei.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
