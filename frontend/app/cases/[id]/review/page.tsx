"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.id;

    const [palos, setPalos] = useState<any[]>([]);
    const [marks, setMarks] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [showOverlay, setShowOverlay] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showReprocessModal, setShowReprocessModal] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [actionStack, setActionStack] = useState<{ type: 'delete', item: any, itemType: 'palo' | 'mark' }[]>([]);
    const [isOverriding, setIsOverriding] = useState(false);
    const [overrideCounts, setOverrideCounts] = useState<number[]>([0, 0, 0, 0, 0]);

    // Calibration State
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationPoints, setCalibrationPoints] = useState<[number, number][]>([]);
    const [mmPerPx, setMmPerPx] = useState<number | null>(null);
    const [imageScale, setImageScale] = useState(1);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('pc_token');
            if (!token) {
                router.push('/login');
                return;
            }
            const authHeader = { 'Authorization': `Bearer ${token}` };

            // 1. Fetch File Info
            const fileRes = await fetch(`http://localhost:8000/cases/${caseId}/file`, { headers: authHeader });
            if (fileRes.ok) {
                const fileData = await fileRes.json();
                setImageUrl(fileData.url);
            }

            // 2. Fetch Detections
            const detRes = await fetch(`http://localhost:8000/cases/${caseId}/detections`, { headers: authHeader });
            if (detRes.ok) {
                const detData = await detRes.json();
                setPalos(detData.palo_objects.palos || []);
                setMarks(detData.palo_objects.marks || []);
            }

            // 3. Fetch Metrics
            const metRes = await fetch(`http://localhost:8000/cases/${caseId}/metrics`, { headers: authHeader });
            if (metRes.ok) {
                const metData = await metRes.json();
                setMetrics(metData);
                setOverrideCounts(metData.by_interval?.counts || [0, 0, 0, 0, 0]);
            }
        } catch (err) {
            console.error("Erro ao carregar dados de revisão:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (caseId) fetchData();

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                handleUndo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [caseId, router, actionStack]);

    const handleUndo = async () => {
        if (actionStack.length === 0) return;

        const lastAction = actionStack[actionStack.length - 1];
        try {
            const token = localStorage.getItem('pc_token');
            const res = await fetch(`http://localhost:8000/cases/${caseId}/detections/items?type=${lastAction.itemType}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(lastAction.item)
            });
            if (res.ok) {
                setActionStack(prev => prev.slice(0, -1));
                fetchData();
                setNotification({ message: "Ação desfeita.", type: 'success' });
                setTimeout(() => setNotification(null), 2000);
            }
        } catch (err) {
            console.error("Erro ao desfazer:", err);
        }
    };

    const handleDeleteItem = async (itemId: string | number, type: 'palo' | 'mark') => {
        const itemToDelete = (type === 'palo' ? palos : marks).find(i => (i.id === itemId));
        if (!itemToDelete) return;

        try {
            const token = localStorage.getItem('pc_token');
            const res = await fetch(`http://localhost:8000/cases/${caseId}/detections/items/${itemId}?type=${type}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setActionStack(prev => [...prev, { type: 'delete', item: itemToDelete, itemType: type }]);
                fetchData();
                setNotification({ message: `${type === 'palo' ? 'Palo' : 'Intervalo'} removido.`, type: 'success' });
                setTimeout(() => setNotification(null), 2000);
            }
        } catch (err) {
            console.error("Erro ao deletar item:", err);
        }
    };

    const handleSaveOverrides = async () => {
        try {
            const token = localStorage.getItem('pc_token');
            const res = await fetch(`http://localhost:8000/cases/${caseId}/metrics/overrides`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ counts: overrideCounts })
            });
            if (res.ok) {
                setIsOverriding(false);
                fetchData();
                setNotification({ message: "Totais atualizados manualmente.", type: 'success' });
                setTimeout(() => setNotification(null), 3000);
            }
        } catch (err) {
            console.error("Erro ao salvar overrides:", err);
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (isCalibrating) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newPoints: [number, number][] = [...calibrationPoints, [x, y]];
            setCalibrationPoints(newPoints);

            if (newPoints.length === 2) {
                const distPx = Math.sqrt(Math.pow(newPoints[1][0] - newPoints[0][0], 2) + Math.pow(newPoints[1][1] - newPoints[0][1], 2));
                const knownMm = 100; // Calibrating with 10cm line
                setMmPerPx(knownMm / distPx);
                setIsCalibrating(false);
            }
            return;
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold">Processando dados técnicos...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* Header de Revisão */}
            <header className="h-20 bg-slate-800 border-b border-slate-700 px-8 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
                <div className="flex items-center gap-4">
                    <Link href="/cases" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>←</span> Voltar
                    </Link>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <div>
                        <h2 className="font-bold">Revisão Técnica</h2>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">ID do Caso: #{caseId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Dataset Collector (Fase 1 Migração IA) */}
                    <button
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('pc_token');
                                const res = await fetch(`http://localhost:8000/cases/${caseId}/dataset-approve`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (res.ok) {
                                    setNotification({ message: "🧠 Coletado! Dados salvos para o treinamento.", type: 'success' });
                                } else {
                                    setNotification({ message: "Erro ao coletar dados.", type: 'error' });
                                }
                            } catch (err) {
                                setNotification({ message: "Erro de conexão.", type: 'error' });
                            } finally {
                                setTimeout(() => setNotification(null), 3000);
                            }
                        }}
                        className="px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black border border-indigo-500/20 transition-all flex items-center gap-2 uppercase tracking-tighter"
                        title="Salvar este caso como exemplo positivo para treinar a IA"
                    >
                        <span>🧠 Inserir no Dataset</span>
                    </button>

                    {/* Edit Mode Toggle */}
                    <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${isEditing ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {isEditing ? '🔓 EDITANDO' : '🔒 LEITURA'}
                        </button>
                        {isEditing && (
                            <button
                                onClick={handleUndo}
                                disabled={actionStack.length === 0}
                                className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${actionStack.length > 0 ? 'bg-slate-700 text-white hover:bg-slate-600' : 'text-slate-600 cursor-not-allowed'}`}
                                title="Desfazer (Ctrl+Z)"
                            >
                                ↩ DESFAZER
                            </button>
                        )}
                        <button
                            onClick={fetchData}
                            className="px-3 py-2 rounded-lg text-[10px] font-black text-slate-500 hover:text-white transition-all"
                            title="Recarregar dados e recalcular contagens"
                        >
                            🔄 RECONTAR
                        </button>
                    </div>

                    {/* Reprocess Button */}
                    <button
                        onClick={() => setShowReprocessModal(true)}
                        className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-xl text-xs font-bold border border-amber-500/20 transition-all flex items-center gap-2"
                    >
                        ⚡ Reprocessar
                    </button>

                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
                        <button
                            onClick={() => setShowOverlay(true)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showOverlay ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
                        >
                            Overlay ON
                        </button>
                        <button
                            onClick={() => setShowOverlay(false)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!showOverlay ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
                        >
                            Visão Crua
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            router.push(`/cases/${caseId}/clinical`);
                        }}
                        className="px-8 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-black shadow-lg shadow-green-900/20 transition-all"
                    >
                        VALIDAR E FINALIZAR
                    </button>
                </div>
            </header>

            {/* Reprocess Confirmation Modal */}
            {showReprocessModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Confirmar Reprocessamento</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Você tem certeza? Isso <strong>apagará todas as edições manuais</strong> e executará os algoritmos de IA novamente do zero. Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowReprocessModal(false)}
                                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    setShowReprocessModal(false);
                                    setLoading(true);
                                    try {
                                        const token = localStorage.getItem('pc_token');
                                        await fetch(`http://localhost:8000/cases/${caseId}/reprocess`, {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        router.push(`/cases/${caseId}`);
                                    } catch (err) {
                                        setNotification({ message: "Erro ao reprocessar.", type: 'error' });
                                        setLoading(false);
                                        setTimeout(() => setNotification(null), 3000);
                                    }
                                }}
                                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-900/20"
                            >
                                Sim, Reprocessar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-10 right-10 p-6 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 z-[100] ${notification.type === 'success' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-red-600 border-red-500 text-white'
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{notification.type === 'success' ? '🧠' : '❌'}</span>
                        <p className="font-bold">{notification.message}</p>
                    </div>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* Workspace Central */}
                <div className="flex-1 bg-black/40 p-10 overflow-auto flex justify-center items-start custom-scrollbar">
                    <div className="relative bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm cursor-crosshair group" onClick={handleCanvasClick}>
                        {/* Imagem Real do Backend */}
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Teste Palográfico"
                                className="max-w-none block"
                                style={{ width: '800px' }}
                                onLoad={(e) => {
                                    const img = e.currentTarget;
                                    const scale = 800 / img.naturalWidth;
                                    console.log("[SCALE] Natural Width:", img.naturalWidth, "Factor:", scale);
                                    setImageScale(scale);
                                }}
                            />
                        ) : (
                            <div className="w-[800px] h-[1100px] bg-slate-100 flex items-center justify-center">
                                <p className="text-slate-400 italic">Arquivo não disponível</p>
                            </div>
                        )}

                        {/* Overlay Visual dos Palos Detectados */}
                        {showOverlay && palos.map((p: any) => (
                            <div
                                key={p.id}
                                title={isEditing ? `Palo #${p.id} - Clique para remover` : `Palo #${p.id}`}
                                onClick={(e) => {
                                    if (!isEditing) return;
                                    e.stopPropagation();
                                    handleDeleteItem(p.id, 'palo');
                                }}
                                className={`absolute rounded-sm transition-all ${isEditing ? 'border-2 border-red-500 bg-red-500/20 cursor-pointer hover:bg-red-500/60 z-30' : 'border border-blue-500 bg-blue-400/10 shadow-[0_0_2px_blue] pointer-events-none'}`}
                                style={{
                                    left: `${p.bbox[0] * imageScale}px`,
                                    top: `${p.bbox[1] * imageScale}px`,
                                    width: `${p.bbox[2] * imageScale}px`,
                                    height: `${p.bbox[3] * imageScale}px`,
                                    pointerEvents: isEditing ? 'auto' : 'none'
                                }}
                            >
                                {isEditing && (
                                    <div className="absolute -top-3 -right-3 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] font-black shadow-lg">×</div>
                                )}
                            </div>
                        ))}

                        {showOverlay && marks.map((m: any, idx: number) => (
                            <div
                                key={`mark-${idx}`}
                                title={isEditing ? "Intervalo - Clique para remover" : "Intervalo Demarcado"}
                                onClick={(e) => {
                                    if (!isEditing) return;
                                    e.stopPropagation();
                                    handleDeleteItem(m.id, 'mark');
                                }}
                                className={`absolute rounded-xs transition-all ${isEditing ? 'border-2 border-orange-500 bg-orange-500/30 cursor-pointer hover:bg-orange-500/70 z-40' : 'border border-green-400 bg-green-400/20 shadow-[0_0_8px_rgba(74,222,128,0.5)] pointer-events-none'}`}
                                style={{
                                    left: `${(m.bbox[0] - 8) * imageScale}px`,
                                    top: `${(m.bbox[1] - 4) * imageScale}px`,
                                    width: `${(m.bbox[2] + 16) * imageScale}px`,
                                    height: `${(m.bbox[3] + 8) * imageScale}px`,
                                    pointerEvents: isEditing ? 'auto' : 'none'
                                }}
                            >
                                {isEditing && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-1 bg-orange-600 text-white rounded text-[7px] font-black uppercase whitespace-nowrap">Remover Intervalo</div>
                                )}
                            </div>
                        ))}
                        <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none" />
                    </div>
                </div>

                {/* Painel Lateral de Métricas */}
                <aside className="w-80 bg-slate-800 border-l border-slate-700 p-8 space-y-10 shadow-2xl overflow-y-auto">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Métricas Analíticas</h3>
                        <div className="space-y-4">
                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Detectado</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-blue-400">{metrics?.total_count || 0}</p>
                                    <span className="text-xs text-slate-500 font-bold">palos</span>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confiança da Análise</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${metrics?.confidence_level === 'High' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                                        {metrics?.confidence_level === 'High' ? 'ALTA' : 'MÉDIA'}
                                    </span>
                                </div>
                                <div className="text-xl font-black text-white">{metrics?.confidence_reasons?.score || 0}%</div>
                                <p className="text-[9px] text-slate-500 mt-1 italic">Baseado em contraste e nitidez</p>
                            </div>

                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nível de Ritmo (NOR / CV)</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${metrics?.stats?.nor <= 8 ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                                        NOR: {metrics?.stats?.nor || 0}%
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-black text-white">{metrics?.stats?.cv || 0}%</p>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Coef. Variação</span>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tamanho Médio</p>
                                <p className="text-xl font-black text-white">{metrics?.stats?.avg_height_mm || 'N/A'}</p>
                                <p className="text-[9px] text-slate-500 font-medium italic mt-1">milímetros (mm)</p>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Espaçamento</p>
                                <p className="text-xl font-black text-white">{metrics?.stats?.avg_spacing_mm || 'N/A'}</p>
                                <p className="text-[9px] text-slate-500 font-medium italic mt-1">Dist. média (mm)</p>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                                <div className="flex justify-between items-start">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Inclinação</p>
                                    <span className="text-[10px] font-bold text-white">{metrics?.stats?.slant}°</span>
                                </div>
                                <p className="text-[9px] text-slate-500 italic">Média de todos os traços</p>
                            </div>

                            <div className={`p-4 rounded-2xl border ${metrics?.stats?.tremor_suggested ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-900/50 border-slate-700/50'}`}>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tremor / Curvatura</p>
                                <p className={`text-xl font-black ${metrics?.stats?.tremor_suggested ? 'text-red-400' : 'text-green-400'}`}>
                                    {metrics?.stats?.tremor_suggested ? 'INDICADO' : 'NÃO DETECTADO'}
                                </p>
                                <p className="text-[9px] text-slate-500 italic mt-1">Análise de tortuosidade (mm)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Produção / Tempo</h3>
                            <button
                                onClick={() => setIsOverriding(!isOverriding)}
                                className={`text-[9px] font-black px-2 py-1 rounded border transition-all ${isOverriding ? 'bg-amber-500 border-amber-400 text-white' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:text-white'}`}
                            >
                                {isOverriding ? 'CANCELAR' : '✏️ EDITAR TOTAIS'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {overrideCounts.map((count: number, i: number) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase tracking-widest">Intervalo {i + 1}</span>
                                        {isOverriding ? (
                                            <input
                                                type="number"
                                                value={count}
                                                onChange={(e) => {
                                                    const newCounts = [...overrideCounts];
                                                    newCounts[i] = parseInt(e.target.value) || 0;
                                                    setOverrideCounts(newCounts);
                                                }}
                                                className="w-16 bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-amber-400 text-right font-mono"
                                            />
                                        ) : (
                                            <span className="text-blue-400 font-mono text-xs">{count}</span>
                                        )}
                                    </div>
                                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/30">
                                        <div
                                            className={`h-full transition-all duration-1000 ${isOverriding ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                                            style={{ width: `${(count / (metrics?.total_count || 1)) * 100 * 3}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isOverriding && (
                            <button
                                onClick={handleSaveOverrides}
                                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-amber-900/40 animate-pulse"
                            >
                                💾 SALVAR TOTAIS MANUAIS
                            </button>
                        )}
                    </div>

                    <div className="pt-8 border-t border-slate-700/50">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Ferramentas de Escala</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => { setIsCalibrating(true); setCalibrationPoints([]); }}
                                className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${isCalibrating ? 'bg-blue-600 text-white' : 'bg-slate-700/30 hover:bg-slate-700/60 text-slate-300'}`}
                            >
                                <span className="text-lg">📏</span> {isCalibrating ? 'Marque 10cm no papel...' : 'Calibrar Régua (Manual)'}
                            </button>
                        </div>
                        {mmPerPx && (
                            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500/20 rounded-xl">
                                <p className="text-[9px] text-blue-400 font-bold uppercase">Escala Ativa</p>
                                <p className="text-xs text-white font-mono">1px = {mmPerPx.toFixed(4)} mm</p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
        </div>
    );
}
