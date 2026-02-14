"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Calendar,
    User as UserIcon,
    Activity,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    FolderOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CasesPage() {
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulação de fetch para MVP - será substituído por real fetch com token
        const fetchCases = async () => {
            try {
                const res = await fetch('http://localhost:8000/cases');
                if (res.ok) {
                    const data = await res.json();
                    setCases(data);
                }
            } catch (err) {
                console.error("Erro ao carregar casos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'done':
                return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full border border-green-100"><CheckCircle2 size={12} /> Processado</span>;
            case 'processing':
                return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100 animate-pulse"><Clock size={12} /> Analisando</span>;
            case 'queued':
                return <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase rounded-full border border-slate-100"><Clock size={12} /> Na Fila</span>;
            case 'failed':
                return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-full border border-red-100"><AlertCircle size={12} /> Falhou</span>;
            default:
                return status;
        }
    };

    return (
        <div className="space-y-10">
            {/* Header local */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[var(--color-primary)] tracking-tighter uppercase">Protocolos de Avaliação</h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">Gerencie e revise as medições palográficas da sua clínica.</p>
                </div>
                <Link href="/app/cases/new" className="btn-accent flex items-center gap-2">
                    <Plus size={20} strokeWidth={3} />
                    NOVO EXAME
                </Link>
            </div>

            {/* Tabela Profissional */}
            <div className="card-premium overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)] bg-white dark:bg-slate-900/50 flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Filtrar nesta lista..." className="pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-slate-200 transition-all" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-black text-slate-600 transition-all border border-slate-100">
                            <Filter size={14} /> Filtros
                        </button>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cases.length} CASOS ENCONTRADOS</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-[var(--color-border)]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocolo</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Paciente</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Visão</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Upload</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)] bg-white dark:bg-[#0B1F3B]">
                            {cases.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <FolderOpen size={48} />
                                            <p className="font-bold text-sm tracking-tight">Nenhum caso cadastrado ainda.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {cases.map((item, i) => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group cursor-default"
                                >
                                    <td className="px-8 py-6">
                                        <span className="font-mono text-xs font-black text-[var(--color-secondary)]">#{item.patient_code}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[var(--color-secondary)]/10 group-hover:text-[var(--color-secondary)] transition-all">
                                                <UserIcon size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-[var(--color-primary)]">Paciente Ocultado</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {getStatusBadge(item.status)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-[var(--text-secondary)] font-semibold text-xs">
                                            <Calendar size={14} className="opacity-40" />
                                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/cases/${item.id}/review`}
                                                className="px-4 py-2 bg-slate-100 hover:bg-[var(--color-primary)] hover:text-white rounded-lg text-[10px] font-black uppercase transition-all shadow-sm"
                                            >
                                                REVISAR
                                            </Link>
                                            <Link
                                                href={`/cases/${item.id}/report`}
                                                className="px-4 py-2 border border-slate-200 hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] rounded-lg text-[10px] font-black uppercase transition-all"
                                            >
                                                LAUDO
                                            </Link>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
