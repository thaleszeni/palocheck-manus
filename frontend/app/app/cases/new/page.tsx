"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Upload,
    ChevronLeft,
    FileText,
    Info,
    CheckCircle,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NewCasePage() {
    const router = useRouter();
    const [patientCode, setPatientCode] = useState('');
    const [patientName, setPatientName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !patientCode) return;

        setLoading(true);
        try {
            // 1. Create Case
            const caseRes = await fetch('http://localhost:8000/cases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_code: patientCode,
                    patient_name_hidden: patientName
                }),
            });

            if (caseRes.ok) {
                const caseData = await caseRes.json();

                // 2. Upload File
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch(`http://localhost:8000/cases/${caseData.id}/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (uploadRes.ok) {
                    setSuccess(true);
                    setTimeout(() => router.push('/app/cases'), 2000);
                }
            }
        } catch (err) {
            console.error("Erro no upload:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/app/cases" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
                    <ChevronLeft size={20} />
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[var(--color-primary)] tracking-tighter uppercase">Novo Exame Palográfico</h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium underline decoration-[var(--color-secondary)]/30">Fase 1: Identificação e Coleta de Dados</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="card-premium p-10 bg-white">
                        <form onSubmit={handleUpload} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Código do Paciente/ID *</label>
                                    <input
                                        required
                                        value={patientCode}
                                        onChange={e => setPatientCode(e.target.value)}
                                        placeholder="Ex: PAC-2026-001"
                                        className="w-full bg-slate-50 h-14 px-5 rounded-2xl border border-transparent focus:border-[var(--color-secondary)] focus:bg-white outline-none transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Nome Completo (Auditável)</label>
                                    <input
                                        value={patientName}
                                        onChange={e => setPatientName(e.target.value)}
                                        placeholder="Ficará oculto nos relatórios"
                                        className="w-full bg-slate-50 h-14 px-5 rounded-2xl border border-transparent focus:border-[var(--color-secondary)] focus:bg-white outline-none transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Arquivo do Teste (Scan/Foto) *</label>
                                <div
                                    onClick={() => document.getElementById('file-input')?.click()}
                                    className={`
                        cursor-pointer border-2 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center gap-4 transition-all
                        ${file ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/5' : 'border-slate-200 hover:border-[var(--color-secondary)] hover:bg-slate-50'}
                      `}
                                >
                                    <input
                                        id="file-input"
                                        type="file"
                                        className="hidden"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                    />
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl ${file ? 'bg-[var(--color-secondary)]' : 'bg-slate-200'}`}>
                                        {file ? <CheckCircle size={32} strokeWidth={2.5} /> : <Upload size={32} strokeWidth={2.5} />}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="font-black text-[var(--color-primary)] text-sm">{file ? file.name : 'Clique ou arraste o arquivo aqui'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recomendado: 300DPI+, PNG/JPG, Sem cortes</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={loading || !file || !patientCode || success}
                                type="submit"
                                className="w-full btn-accent h-20 text-center flex items-center justify-center gap-4 text-base relative overflow-hidden"
                            >
                                {loading ? (
                                    <Loader2 size={24} className="animate-spin" />
                                ) : success ? (
                                    <div className="flex items-center gap-3 animate-bounce">
                                        <ShieldCheck size={24} />
                                        UPLOAD CONCLUÍDO
                                    </div>
                                ) : (
                                    <>
                                        INICIAR PROCESSAMENTO TÉCNICO
                                        <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
                                            <Upload size={16} />
                                        </div>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className="card-premium p-8 bg-[var(--color-primary)] text-white space-y-6">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[var(--color-secondary)]">
                            <Info size={24} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-black text-sm uppercase tracking-widest">Rigor Técnico v8</h4>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">Após o upload, nossos algoritmos de Visão Computacional realizarão a perspectiva, denoise e detecção automatizada de palos.</p>
                        </div>
                        <ul className="space-y-3">
                            {['Deteção Watershed', 'Filtro de Mesa/Fundo', 'Métricas de NOR/CV'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-[10px] font-black uppercase text-[var(--color-secondary)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="card-premium p-8 bg-white border-amber-100 flex gap-4">
                        <div className="text-2xl">⚡</div>
                        <div className="space-y-1">
                            <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Processamento Assíncrono</h5>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">O exame será processado em segundo plano. Você será notificado assim que a revisão estiver pronta.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
