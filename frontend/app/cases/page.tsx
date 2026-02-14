"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from "../config";
import { useRouter } from 'next/navigation';

export default function CasesPage() {
    const router = useRouter();
    const [cases, setCases] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCase, setNewCase] = useState({ patient_code: '', patient_name_hidden: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiStats, setAiStats] = useState<any>(null);

    const fetchCases = async () => {
        try {
            const token = localStorage.getItem('pc_token');
            const response = await fetch(`${API_BASE_URL}/cases`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (response.ok) {
                const data = await response.json();
                setCases(data);
            }
        } catch (err) {
            console.error("Erro ao buscar casos:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAiStats = async () => {
        try {
            const token = localStorage.getItem('pc_token');
            const response = await fetch(`${API_BASE_URL}/settings/dataset-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) setAiStats(await response.json());
        } catch (err) { }
    };

    const handleAuthError = (status: number) => {
        if (status === 401) {
            console.error("[AUTH] Sessão inválida ou expirada (401)");
            localStorage.removeItem('pc_token');
            alert("Sua sessão expirou devido à limpeza do ambiente. Por favor, faça login novamente.");
            router.push('/login');
            return true;
        }
        return false;
    };

    useEffect(() => {
        fetchCases();
        fetchAiStats();
    }, []);

    const handleCreateCase = async (e: React.FormEvent) => {
        e.preventDefault();

        // 0. Initial Validation & Logging
        console.log("[SAVE-CASE] Início do workflow", {
            patient_code: newCase.patient_code,
            file_name: selectedFile?.name,
            file_size: selectedFile?.size
        });

        if (!newCase.patient_code || !selectedFile) {
            alert("Por favor, preencha o código de referência e anexe um arquivo.");
            console.warn("[SAVE-CASE] Validação falhou: Campos obrigatórios ausentes");
            return;
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('pc_token');
            if (!token) {
                console.error("[SAVE-CASE] Falha: Token não encontrado no localStorage");
                alert("Sessão expirada. Por favor, faça login novamente.");
                router.push('/login');
                return;
            }

            const authHeader = { 'Authorization': `Bearer ${token}` };

            // 1. Create Case Record
            console.log("[SAVE-CASE] Passo 1: Criando registro do caso...");
            const caseResponse = await fetch(`${API_BASE_URL}/cases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify(newCase),
            });

            if (!caseResponse.ok) {
                if (handleAuthError(caseResponse.status)) return;
                const errorBody = await caseResponse.text();
                console.error("[SAVE-CASE] Erro no Passo 1:", caseResponse.status, errorBody);
                throw new Error(`Falha ao criar registro do caso: ${caseResponse.status}`);
            }

            const createdCase = await caseResponse.json();
            console.log("[SAVE-CASE] Caso criado com ID:", createdCase.id);

            // 2. Upload File
            console.log("[SAVE-CASE] Passo 2: Fazendo upload do arquivo...");
            const formData = new FormData();
            formData.append('file', selectedFile);

            const uploadRes = await fetch(`${API_BASE_URL}/cases/${createdCase.id}/upload`, {
                method: 'POST',
                headers: authHeader,
                body: formData,
            });

            if (!uploadRes.ok) {
                if (handleAuthError(uploadRes.status)) return;
                const errorBody = await uploadRes.text();
                console.error("[SAVE-CASE] Erro no Passo 2:", uploadRes.status, errorBody);
                throw new Error(`Falha ao enviar arquivo: ${uploadRes.status}`);
            }

            const fileData = await uploadRes.json();
            console.log("[SAVE-CASE] Arquivo enviado com sucesso:", fileData.id);

            // 3. Trigger Analysis
            console.log("[SAVE-CASE] Passo 3: Iniciando análise técnica...");
            const analyzeRes = await fetch(`${API_BASE_URL}/cases/${createdCase.id}/analyze`, {
                method: 'POST',
                headers: authHeader
            });

            if (!analyzeRes.ok) {
                if (handleAuthError(analyzeRes.status)) return;
                const errorBody = await analyzeRes.text();
                console.error("[SAVE-CASE] Erro no Passo 3:", analyzeRes.status, errorBody);
                throw new Error(`Falha ao iniciar análise: ${analyzeRes.status}`);
            }

            const jobData = await analyzeRes.json();
            console.log("[SAVE-CASE] Job de análise disparado:", jobData.id);

            // 4. Final Success Logging & Redirection
            console.log("[SAVE-CASE] Workflow concluído com sucesso!");
            setIsModalOpen(false);
            setNewCase({ patient_code: '', patient_name_hidden: '' });
            setSelectedFile(null);

            // Redirect to case details to see progress
            router.push(`/cases/${createdCase.id}`);
        } catch (err: any) {
            console.error("[SAVE-CASE] EXCEÇÃO CRÍTICA:", err);
            alert(`Ocorreu um problema: ${err.message || "Erro desconhecido"}`);
        } finally {
            setIsProcessing(false);
            console.log("[SAVE-CASE] Workflow encerrado (finally)");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Simples */}
            <aside className="w-64 bg-slate-900 p-6 flex flex-col fixed h-full">
                <Link href="/" className="flex items-center gap-3 mb-10 text-white hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold">PC</div>
                    <span className="font-bold text-xl">PaloCheck</span>
                </Link>

                <nav className="flex-1 space-y-2">
                    <Link href="/cases" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium">
                        Listagem de Casos
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                        Configurações
                    </Link>
                </nav>

                <div className="mt-auto p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400">Logado como:</p>
                    <p className="text-sm text-white font-semibold">Dr. Psicólogo</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 pl-64 p-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Casos sob Avaliação</h1>
                        <p className="text-slate-500">Gerencie e revise os testes palográficos dos pacientes.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                    >
                        Novo Caso
                    </button>
                </div>

                {/* AI Dataset Progress Tracker */}
                {aiStats && aiStats.case_count > 0 && (
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-xl border border-indigo-500/20 mb-8 max-w-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🧠</span>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Progresso para Nova IA (Deep Learning)</h3>
                                    <p className="text-indigo-300 text-[10px] font-medium uppercase tracking-widest">Dataset para Treinamento</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-white font-black text-xl">{aiStats.case_count}</span>
                                <span className="text-indigo-400 text-xs font-bold"> / {aiStats.target_cases} casos</span>
                            </div>
                        </div>

                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                            <div
                                className="bg-indigo-500 h-full rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"
                                style={{ width: `${aiStats.progress_percent}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                            <span className="text-indigo-400">Total de palos: {aiStats.total_palos}</span>
                            <span className="text-indigo-400">{aiStats.progress_percent}% Concluído</span>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full py-20 text-slate-400">
                            Carregando casos...
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                            <p>Nenhum caso cadastrado ainda.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                Clique para criar o primeiro
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cód. Interno</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {cases.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">{c.patient_code}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{c.patient_name_hidden || 'Oculto'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'done' ? 'bg-green-100 text-green-700' :
                                                c.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/cases/${c.id}/review`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-4 py-2 rounded-lg transition-all"
                                            >
                                                Ver / Revisar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Modal Novo Caso */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black text-slate-900">Novo Caso</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleCreateCase} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Código de Referência</label>
                                <input
                                    required
                                    placeholder="Ex: PAC-2024-X"
                                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 bg-slate-50"
                                    value={newCase.patient_code}
                                    onChange={(e) => setNewCase({ ...newCase, patient_code: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400 italic">Este código será usado para identificar o laudo sem expor o paciente.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Nome (Interno)</label>
                                <input
                                    placeholder="Apenas para sua organização"
                                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 bg-slate-50"
                                    value={newCase.patient_name_hidden}
                                    onChange={(e) => setNewCase({ ...newCase, patient_name_hidden: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Digitalização (Foto/PDF)</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        required
                                        accept="image/*,.pdf"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl group-hover:border-blue-500 transition-colors flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                        <span className="text-xl">📁</span>
                                        <p className="text-xs font-medium mt-1">
                                            {selectedFile ? selectedFile.name : 'Clique ou arraste o arquivo'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Desistir
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-slate-400"
                                >
                                    {isProcessing ? 'Processando...' : 'Salvar e Analisar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
