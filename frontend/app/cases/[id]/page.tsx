"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, CheckCircle2, AlertCircle, Loader2, FileText, BarChart3, ScanEye, LayoutDashboard } from 'lucide-react';

export default function CaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.id;

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchJobStatus = async () => {
        try {
            const token = localStorage.getItem('pc_token');
            const res = await fetch(`http://localhost:8000/cases/${caseId}/jobs/latest`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setJob(data);

                // Keep polling if not done or failed
                if (data.status !== 'done' && data.status !== 'failed') {
                    setTimeout(fetchJobStatus, 2000);
                }
            } else if (res.status === 404) {
                setError('Nenhum processo de análise encontrado.');
            }
        } catch (err) {
            console.error("Erro ao buscar status do job:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (caseId) fetchJobStatus();
    }, [caseId]);

    const steps = [
        { id: 'preprocess', label: 'Pré-processamento', icon: <ScanEye size={18} /> },
        { id: 'detect', label: 'Detecção de Palos', icon: <FileText size={18} /> },
        { id: 'metrics', label: 'Cálculo de Métricas', icon: <BarChart3 size={18} /> },
        { id: 'concluido', label: 'Laudo Técnico', icon: <CheckCircle2 size={18} /> },
    ];

    if (loading) return <div className="p-10 text-center">Carregando processo...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
            >
                <div className="p-10">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Link href="/cases" className="hover:text-blue-600 transition-colors">Casos</Link>
                        <ChevronRight size={12} />
                        <span className="text-slate-900">Análise em tempo real</span>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-2">Processando Teste</h1>
                    <p className="text-slate-500 mb-10">Estamos analisando os traços do paciente. Isso pode levar alguns segundos.</p>

                    {/* Progress Bar */}
                    <div className="relative h-4 bg-slate-100 rounded-full mb-12 overflow-hidden shadow-inner font-black overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${job?.progress || 0}%` }}
                            className="absolute top-0 left-0 h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        />
                    </div>

                    {/* Timeline Steps */}
                    <div className="space-y-6">
                        {steps.map((step, index) => {
                            const isCompleted = job?.progress === 100 || (index < steps.findIndex(s => s.id === job?.current_step));
                            const isActive = job?.current_step === step.id;
                            const isPending = !isCompleted && !isActive;

                            return (
                                <div key={step.id} className={`flex items-start gap-5 transition-opacity duration-500 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${isCompleted ? 'bg-green-500 text-white' :
                                            isActive ? 'bg-blue-600 text-white animate-pulse' :
                                                'bg-slate-100 text-slate-400'
                                        }`}>
                                        {isActive ? <Loader2 className="animate-spin" size={20} /> : step.icon}
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <h3 className={`text-sm font-bold uppercase tracking-tight ${isActive ? 'text-blue-600' : 'text-slate-900'}`}>
                                            {step.label}
                                        </h3>
                                        {isActive && <p className="text-xs text-slate-500 font-medium">Processando algoritmos avançados...</p>}
                                        {isCompleted && <p className="text-xs text-green-600 font-bold">Concluído!</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {job?.status === 'done' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 flex gap-4"
                        >
                            <Link
                                href={`/cases/${caseId}/review`}
                                className="flex-1 py-5 bg-green-500 hover:bg-green-600 text-white font-black text-center rounded-2xl shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <LayoutDashboard size={20} />
                                VER RESULTADOS COMPLETOS
                            </Link>
                        </motion.div>
                    )}

                    {job?.status === 'failed' && (
                        <div className="mt-10 p-6 bg-red-50 rounded-3xl border border-red-100">
                            <div className="flex gap-4 items-center mb-2">
                                <AlertCircle className="text-red-500" />
                                <h4 className="text-red-900 font-black">Falha na análise técnica</h4>
                            </div>
                            <p className="text-xs text-red-600 font-medium leading-relaxed">
                                {job.error_message || "Ocorreu um erro inesperado ao processar a imagem. Verifique a qualidade do scan."}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 text-xs font-bold text-red-700 underline"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
