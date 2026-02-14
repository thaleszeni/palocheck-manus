"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.id;

    const [reportText, setReportText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFinalizing, setIsFinalizing] = useState(false);

    useEffect(() => {
        const fetchDraft = async () => {
            try {
                const res = await fetch(`http://localhost:8000/cases/${caseId}/report/draft`);
                if (res.ok) {
                    const data = await res.json();
                    setReportText(data.draft_text);
                }
            } catch (err) {
                console.error("Erro ao carregar rascunho:", err);
            } finally {
                setLoading(false);
            }
        };
        if (caseId) fetchDraft();
    }, [caseId]);

    const handleFinalize = async () => {
        setIsFinalizing(true);
        try {
            const token = localStorage.getItem('pc_token');
            const authHeader = { 'Authorization': `Bearer ${token}` };

            const res = await fetch(`http://localhost:8000/cases/${caseId}/report/finalize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify({ final_text: reportText })
            });

            if (!res.ok) throw new Error("Falha ao gerar documento PDF");

            const data = await res.json();

            // Success feedback
            alert("Laudo processado com sucesso! O download iniciará em breve.");

            // Trigger download if url provided
            if (data.report_url) {
                window.open(data.report_url, '_blank');
            }

            router.push('/cases');
        } catch (err: any) {
            console.error("Erro na finalização:", err);
            alert(`Erro crítico ao finalizar laudo: ${err.message}. Tente novamente.`);
        } finally {
            setIsFinalizing(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Gerando síntese interpretativa baseada nas normas...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href={`/cases/${caseId}/review`} className="text-slate-400 hover:text-slate-900 transition-all font-bold text-sm flex items-center gap-2">
                        <span>←</span> Voltar para Revisão
                    </Link>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div>
                        <h1 className="font-black text-slate-900">Laudo Técnico de Avaliação</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Protocolo: #CASE-{caseId}</p>
                    </div>
                </div>
                <button
                    onClick={handleFinalize}
                    disabled={isFinalizing}
                    className="px-10 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:bg-slate-300"
                >
                    {isFinalizing ? 'ARQUIVANDO...' : 'FINALIZAR E EXPORTAR PDF'}
                </button>
            </header>

            <main className="flex-1 flex p-10 gap-10 max-w-7xl mx-auto w-full">
                {/* Editor de Laudo */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm min-h-[800px] flex flex-col">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                            <h2 className="text-xl font-black text-slate-800">Editor de Síntese Clínica</h2>
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase">Rascunho Automático</span>
                        </div>

                        <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            className="flex-1 w-full bg-slate-50/50 p-8 rounded-2xl border border-slate-100 text-slate-800 font-medium leading-relaxed outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm resize-none"
                            placeholder="O psicólogo pode editar todo o texto sugerido pelo sistema aqui..."
                        />

                        <div className="mt-8 p-6 bg-slate-900 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-blue-400 text-xl font-black">⚖️</span>
                                <p className="text-xs font-black text-white uppercase tracking-widest">Aviso de Responsabilidade Ética</p>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Ao finalizar este laudo, você confirma que revisou todas as métricas geradas por visão computacional e que a síntese interpretativa acima reflete sua decisão clínica soberana, em conformidade com o Código de Ética Profissional do Psicólogo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visualização de Apoio (Preview) */}
                <aside className="w-[450px] space-y-6 sticky top-28 h-fit">
                    <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 text-white shadow-2xl">
                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-8">Base de Apoio à Decisão</h3>
                        <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                            <ReactMarkdown>{reportText}</ReactMarkdown>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-100 rounded-2xl border border-blue-200">
                        <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                            <strong>💡 DICA:</strong> A visualização ao lado mostra como o texto formatado aparecerá no PDF final. Você pode usar formatação markdown (negrito, listas) para melhor organização.
                        </p>
                    </div>
                </aside>
            </main>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
        </div>
    );
}
