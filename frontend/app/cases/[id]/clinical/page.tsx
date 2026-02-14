"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Origin Icon Component
const OriginBadge = ({ isAuto }: { isAuto: boolean }) => (
    <span className={`text-xs px-2 py-0.5 rounded-full ${isAuto ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'}`}>
        {isAuto ? '🤖 Auto' : '✏️ Manual'}
    </span>
);

export default function ClinicalPage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [reviewed, setReviewed] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Auto Data (Layer 1)
    const [autoMetrics, setAutoMetrics] = useState<any>(null);

    // Manual/Clinical Data (Layer 2 & 3) with origin tracking
    const [clinicalData, setClinicalData] = useState({
        productivity: {
            counts: [0, 0, 0, 0, 0],
            total: 0,
            nor: 0,
            classification: "",
            isManual: [false, false, false, false, false]
        },
        slant: {
            average: 90,
            by_interval: [90, 90, 90, 90, 90],
            classification: "",
            isManual: false
        },
        sizes: {
            max: [0, 0, 0, 0, 0],
            min: [0, 0, 0, 0, 0],
            classification: ""
        },
        distances: {
            palos: [0, 0, 0, 0, 0],
            lines: [0, 0, 0, 0, 0],
            classification_palos: "",
            classification_lines: ""
        },
        margins: {
            left: [0, 0, 0, 0, 0],
            right: [0, 0, 0, 0, 0],
            top: 0,
            classification_left: "",
            classification_right: "",
            classification_top: ""
        },
        qualitative: {
            tremor_suggested: false,
            tremor_confirmed: false,
            crossings: false,
            touching_lines: false,
            hooks: { top_left: 0, top_right: 0, bottom_left: 0, bottom_right: 0 }
        },
        observation: ""
    });

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const token = localStorage.getItem('pc_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const metRes = await fetch(`http://localhost:8000/cases/${caseId}/metrics`, { headers });
                if (metRes.ok) {
                    const data = await metRes.json();
                    setAutoMetrics(data);

                    // Pre-fill with auto values
                    setClinicalData(prev => ({
                        ...prev,
                        productivity: {
                            ...prev.productivity,
                            counts: data.by_interval?.counts || [0, 0, 0, 0, 0],
                            total: data.total_count || 0,
                            nor: data.stats?.nor || 0
                        },
                        slant: {
                            ...prev.slant,
                            average: data.stats?.slant || 90,
                            by_interval: data.stats?.slant_by_interval || [90, 90, 90, 90, 90],
                            classification: data.stats?.slant_classification || ""
                        },
                        sizes: {
                            ...prev.sizes,
                            max: data.stats?.size_max_by_interval || [0, 0, 0, 0, 0],
                            min: data.stats?.size_min_by_interval || [0, 0, 0, 0, 0]
                        },
                        margins: {
                            ...prev.margins,
                            left: data.stats?.margins_mm?.left || [0, 0, 0, 0, 0],
                            right: data.stats?.margins_mm?.right || [0, 0, 0, 0, 0],
                            top: data.stats?.margins_mm?.top || 0
                        },
                        qualitative: {
                            ...prev.qualitative,
                            tremor_suggested: data.stats?.tremor_suggested || false,
                            crossings: data.stats?.crossings_detected || false,
                            hooks: data.stats?.hooks || { top_left: 0, top_right: 0, bottom_left: 0, bottom_right: 0 }
                        },
                        distances: {
                            ...prev.distances,
                            lines: [data.stats?.interline_avg_mm || 0, 0, 0, 0, 0]
                        }
                    }));
                }
            } catch (err) {
                console.error("Erro ao carregar análise:", err);
            } finally {
                setLoading(false);
            }
        };
        if (caseId) fetchAnalysis();
    }, [caseId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('pc_token');
            const res = await fetch(`http://localhost:8000/cases/${caseId}/clinical`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...clinicalData,
                    is_reviewed: reviewed
                })
            });
            if (res.ok) {
                const data = await res.json();
                setNotification({ message: "Laudo salvo com sucesso!", type: 'success' });

                // Automatic Download / Open PDF if finalized
                if (data.report_url) {
                    window.open(data.report_url, '_blank');
                }
            } else {
                const errorData = await res.json().catch(() => ({ detail: 'Erro desconhecido' }));
                setNotification({ message: `Erro: ${errorData.detail || 'Falha ao salvar'}`, type: 'error' });
            }
        } catch (err) {
            console.error("Save error:", err);
            setNotification({ message: "Erro de conexão ao salvar.", type: 'error' });
        } finally {
            setSaving(false);
            // Auto hide notification
            setTimeout(() => setNotification(null), 5000);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Carregando formulário clínico...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            <header className="bg-white border-b border-slate-200 px-8 h-16 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <Link href={`/cases/${caseId}`} className="text-slate-500 hover:text-blue-600 font-medium">← Voltar</Link>
                    <h1 className="font-bold text-slate-800">Formulário Clínico Completo</h1>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">Fase 2</span>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={reviewed}
                            onChange={(e) => setReviewed(e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="text-sm font-bold text-slate-700">Revisão Realizada</span>
                    </label>
                    <button
                        onClick={handleSave}
                        disabled={saving || !reviewed}
                        className={`px-6 py-2 rounded-lg font-bold transition ${reviewed
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {saving ? 'Salvando...' : 'Salvar Laudo'}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto mt-8 space-y-10 px-6">

                {/* 1. Produtividade */}
                <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Produtividade</h2>
                        <OriginBadge isAuto={!clinicalData.productivity.isManual.some(m => m)} />
                    </div>
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i}>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{i + 1}º Tempo</label>
                                <input
                                    type="number"
                                    className={`w-full rounded-lg p-3 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500 ${clinicalData.productivity.isManual[i]
                                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                                        : 'bg-blue-50 border border-blue-100 text-blue-900'
                                        }`}
                                    value={clinicalData.productivity.counts[i]}
                                    onChange={(e) => {
                                        const newCounts = [...clinicalData.productivity.counts];
                                        const newIsManual = [...clinicalData.productivity.isManual];
                                        newCounts[i] = parseInt(e.target.value) || 0;
                                        newIsManual[i] = true;
                                        setClinicalData({
                                            ...clinicalData,
                                            productivity: { ...clinicalData.productivity, counts: newCounts, isManual: newIsManual }
                                        });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-8 text-slate-600">
                        <span><strong>Total:</strong> {clinicalData.productivity.counts.reduce((a, b) => a + b, 0)}</span>
                        <span><strong>NOR:</strong> {autoMetrics?.stats?.nor?.toFixed(2) || 0}</span>
                        <span><strong>CV:</strong> {autoMetrics?.stats?.cv?.toFixed(2) || 0}%</span>
                    </div>
                </section>

                {/* 2. Inclinação (Slant) - NEW */}
                <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Inclinação (Slant)</h2>
                        <OriginBadge isAuto={!clinicalData.slant.isManual} />
                    </div>
                    <div className="flex items-center gap-8 mb-6">
                        <div className="text-center">
                            <p className="text-4xl font-black text-blue-600">{clinicalData.slant.average.toFixed(1)}°</p>
                            <p className="text-xs text-slate-400 uppercase font-bold">Média Geral</p>
                        </div>
                        <div className="flex-1 grid grid-cols-5 gap-2">
                            {clinicalData.slant.by_interval.map((angle, i) => (
                                <div key={i} className="text-center bg-slate-50 p-2 rounded">
                                    <p className="text-lg font-bold text-slate-700">{angle.toFixed(1)}°</p>
                                    <p className="text-[10px] text-slate-400">{i + 1}º Tempo</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {[
                            { label: "Vertical (90°±5)", class: "vertical" },
                            { label: "Incl. à Direita", class: "right" },
                            { label: "Incl. à Esquerda", class: "left" }
                        ].map(({ label, class: cls }) => (
                            <button
                                key={cls}
                                onClick={() => setClinicalData({
                                    ...clinicalData,
                                    slant: { ...clinicalData.slant, classification: label, isManual: true }
                                })}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${clinicalData.slant.classification === label
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. Tamanho */}
                <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Tamanho dos Palos</h2>
                        <OriginBadge isAuto={true} />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="w-20 font-bold text-slate-600">Maior:</span>
                            <div className="grid grid-cols-5 gap-2 flex-1">
                                {clinicalData.sizes.max.map((v, i) => (
                                    <div key={i} className="bg-green-50 border border-green-100 rounded p-2 text-center">
                                        <span className="font-bold text-green-800">{v}</span>
                                        <span className="text-xs text-slate-400 ml-1">mm</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="w-20 font-bold text-slate-600">Menor:</span>
                            <div className="grid grid-cols-5 gap-2 flex-1">
                                {clinicalData.sizes.min.map((v, i) => (
                                    <div key={i} className="bg-red-50 border border-red-100 rounded p-2 text-center">
                                        <span className="font-bold text-red-800">{v}</span>
                                        <span className="text-xs text-slate-400 ml-1">mm</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic mt-2">* Valores convertidos automaticamente de pixels para milímetros baseados na calibração.</p>
                    </div>
                </section>

                {/* 4. Margens & Entrelinhas - NEW */}
                <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Layout e Margens (mm)</h2>
                        <OriginBadge isAuto={true} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Margens */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Margem Superior</label>
                                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex justify-between">
                                    <span className="font-bold text-slate-900">{clinicalData.margins.top} mm</span>
                                    <span className="text-[10px] text-slate-400">Topo da folha ao 1º palo</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Margens Esquerdas (por tempo)</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {clinicalData.margins.left.map((m, i) => (
                                        <div key={i} className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                                            <p className="font-bold text-slate-700">{m}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Margens Direitas (por tempo)</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {clinicalData.margins.right.map((m, i) => (
                                        <div key={i} className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                                            <p className="font-bold text-slate-700">{m}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Entrelinhas */}
                        <div className="space-y-6">
                            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Média de Entrelinhas</p>
                                <h3 className="text-4xl font-black">{clinicalData.distances.lines[0]} mm</h3>
                                <div className="mt-4 pt-4 border-t border-white/20 text-sm opacity-90">
                                    Distância média vertical entre o centróide das linhas detectadas.
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {["Normal", "Aumentado", "Diminuído"].map((label) => (
                                    <button
                                        key={label}
                                        onClick={() => setClinicalData({
                                            ...clinicalData,
                                            distances: { ...clinicalData.distances, classification_lines: label }
                                        })}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition ${clinicalData.distances.classification_lines === label
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Indicadores Qualitativos */}
                <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Indicadores Qualitativos</h2>

                    {/* Tremor */}
                    <div className={`p-4 rounded-lg mb-4 flex justify-between items-center ${clinicalData.qualitative.tremor_suggested ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'
                        }`}>
                        <div>
                            <span className="font-bold text-slate-700">Tremor</span>
                            {clinicalData.qualitative.tremor_suggested && (
                                <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                                    ⚠️ Sugestão do Sistema
                                </span>
                            )}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={clinicalData.qualitative.tremor_confirmed}
                                onChange={(e) => setClinicalData({
                                    ...clinicalData,
                                    qualitative: { ...clinicalData.qualitative, tremor_confirmed: e.target.checked }
                                })}
                                className="w-5 h-5 text-amber-600 rounded"
                            />
                            <span className="text-sm font-bold">Confirmar Tremor</span>
                        </label>
                    </div>

                    {/* Cruzamentos */}
                    <div className="p-4 bg-slate-50 rounded-lg flex justify-between items-center">
                        <span className="font-bold text-slate-700">Linhas se cruzam / tocam</span>
                        <input
                            type="checkbox"
                            checked={clinicalData.qualitative.crossings}
                            onChange={(e) => setClinicalData({
                                ...clinicalData,
                                qualitative: { ...clinicalData.qualitative, crossings: e.target.checked }
                            })}
                            className="w-5 h-5 text-blue-600 rounded"
                        />
                    </div>
                </section>

                {/* 5. Ganchos */}
                <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Ganchos</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { key: 'top_left', label: 'Sup. Esq' },
                            { key: 'top_right', label: 'Sup. Dir' },
                            { key: 'bottom_left', label: 'Inf. Esq' },
                            { key: 'bottom_right', label: 'Inf. Dir' }
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold"
                                    value={(clinicalData.qualitative.hooks as any)[key]}
                                    onChange={(e) => setClinicalData({
                                        ...clinicalData,
                                        qualitative: {
                                            ...clinicalData.qualitative,
                                            hooks: { ...clinicalData.qualitative.hooks, [key]: parseInt(e.target.value) || 0 }
                                        }
                                    })}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. Observações do Psicólogo */}
                <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Observações do Psicólogo</h2>
                    <p className="text-sm text-slate-500 mb-4">
                        Este texto será incluído no laudo final em PDF. Descreva sua síntese clínica, interpretação dos resultados e recomendações.
                    </p>
                    <textarea
                        className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="Ex: O examinando apresentou produtividade dentro da média esperada para sua faixa etária. A inclinação dos traços sugere tendência à introversão. Não foram observados sinais de tremor ou outras alterações qualitativas significativas..."
                        value={clinicalData.observation}
                        onChange={(e) => setClinicalData({
                            ...clinicalData,
                            observation: e.target.value
                        })}
                    />
                    <p className="text-xs text-slate-400 mt-2 italic">
                        * Máximo recomendado: 500 caracteres para melhor formatação no laudo.
                    </p>
                </section>

            </main>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-10 right-10 p-6 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 z-[100] ${notification.type === 'success' ? 'bg-green-600 border-green-500 text-white' : 'bg-red-600 border-red-500 text-white'
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{notification.type === 'success' ? '✅' : '❌'}</span>
                        <p className="font-bold">{notification.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
