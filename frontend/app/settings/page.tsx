"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
    const [rulesets, setRulesets] = useState<any[]>([]);
    const [activeRuleset, setActiveRuleset] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'norms' | 'profile' | 'reports'>('norms');

    // Professional Profile State
    const [profile, setProfile] = useState({
        name: 'Dr. Psicólogo Responsável',
        crp: '06/123456',
        institution: 'Clínica de Psicologia Avançada',
        logo_url: '/logo_demo.png'
    });

    const [newRuleset, setNewRuleset] = useState({
        name: '',
        author: '',
        year: new Date().getFullYear(),
        intervals_config: { count: 5 },
        thresholds: { high_nor: 8, high_cv: 15 },
        templates: { nor_stable: '', nor_unstable: '', intro: '', productivity: '' },
        is_active: true
    });

    const fetchData = async () => {
        try {
            const listRes = await fetch('http://localhost:8000/settings/rulesets');
            if (listRes.ok) setRulesets(await listRes.json());

            const activeRes = await fetch('http://localhost:8000/settings/ruleset/active');
            if (activeRes.ok) setActiveRuleset(await activeRes.json());
        } catch (err) {
            console.error("Erro ao carregar configurações:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateRuleset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/settings/rulesets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRuleset),
            });
            if (res.ok) {
                setShowAddModal(false);
                fetchData();
                alert("Protocolo salvo e ativado com sucesso!");
            } else {
                alert("Erro ao salvar protocolo. Verifique os dados.");
            }
        } catch (err) {
            console.error("Erro ao salvar ruleset:", err);
            alert("Erro de conexão ao salvar.");
        }
    };

    if (loading) return <div className="p-10 text-slate-500 font-medium font-sans">Carregando configurações técnicas...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar Simples */}
            <aside className="w-64 bg-slate-900 p-6 flex flex-col fixed h-full shadow-2xl">
                <div className="flex items-center gap-3 mb-10 text-white">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">PC</div>
                    <span className="font-bold text-xl tracking-tight">PaloCheck</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/cases" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all font-medium">
                        Listagem de Casos
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20">
                        Configurações
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 pl-64 p-10">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Configurações & Workspace</h1>
                        <p className="text-slate-500 mt-2 font-medium">Personalize seu ambiente de trabalho e critérios clínicos.</p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-8 border-b border-slate-200 mb-10">
                    {[
                        { id: 'norms', label: 'Normas Técnicas', icon: '📝' },
                        { id: 'profile', label: 'Perfil Profissional', icon: '👤' },
                        { id: 'reports', label: 'Templates de Laudo', icon: '📄' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-10 max-w-6xl">
                    {activeTab === 'norms' && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Protocolo Vigente</h3>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                                >
                                    + NOVO PROTOCOLO
                                </button>
                            </div>
                            {/* Active Ruleset Details (Rendered below) */}
                        </>
                    )}

                    {activeTab === 'norms' && (
                        <>
                            <div className="bg-white rounded-[2rem] p-10 border-2 border-blue-500 shadow-xl shadow-blue-500/5 transition-all">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                                        <span className="text-3xl">⭐</span> Protocolo Ativo: {activeRuleset?.name}
                                    </h2>
                                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest">Versão {activeRuleset?.version}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-8 mb-10">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">Autor / Fonte</p>
                                        <p className="text-lg font-bold text-slate-800">{activeRuleset?.author || 'Não especificado'}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">Ano de Referência</p>
                                        <p className="text-lg font-bold text-slate-800">{activeRuleset?.year || 'N/A'}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] mb-1">Intervalos do Teste</p>
                                        <p className="text-lg font-bold text-slate-800">{activeRuleset?.intervals_config?.count} tempos de 1min</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Limiares e Critérios</h3>
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-slate-600">NOR Máximo (% Estabilidade)</label>
                                            <div className="text-4xl font-black text-slate-900 tabular-nums">{activeRuleset?.thresholds?.high_nor}%</div>
                                            <p className="text-xs text-slate-400 leading-relaxed italic">Refere-se ao limite superior de oscilação rítmica aceitável para este grupo normativo.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-slate-600">CV Máximo (% Variabilidade)</label>
                                            <div className="text-4xl font-black text-slate-900 tabular-nums">{activeRuleset?.thresholds?.high_cv}%</div>
                                            <p className="text-xs text-slate-400 leading-relaxed italic">O Coeficiente de Variação mede a dispersão geral da produtividade.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ruleset Management Table */}
                            <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800">Repositório de Normas Técnicas</h3>
                                    <p className="text-xs text-slate-400 font-medium">Protocolos cadastrados profissionalmente</p>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/30">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Título do Protocolo</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Autor/Ano</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rulesets.map((rs) => (
                                            <tr key={rs.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-slate-900">{rs.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{rs.description || 'Sem descrição.'}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-bold text-slate-700">{rs.author}</p>
                                                    <p className="text-[10px] text-slate-400 font-black">{rs.year}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {rs.is_active ?
                                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">Protocolo Ativo</span> :
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest">Inativo</span>
                                                    }
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="px-4 py-2 text-blue-600 font-black hover:bg-blue-50 rounded-xl transition-all text-xs">Visualizar Lógica</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-black text-slate-900 mb-8">Dados do Profissional (para o PDF)</h2>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº Registro (CRP/CRM)</label>
                                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={profile.crp} onChange={e => setProfile({ ...profile, crp: e.target.value })} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instituição / Clínica</label>
                                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={profile.institution} onChange={e => setProfile({ ...profile, institution: e.target.value })} />
                                </div>
                            </div>
                            <div className="mt-10 p-6 bg-slate-900 rounded-2xl text-white flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold">Assinada por Padrão</h4>
                                    <p className="text-xs text-slate-400 mt-1">Esses dados serão carimbados automaticamente no rodapé de cada PDF gerado.</p>
                                </div>
                                <button className="px-6 py-3 bg-blue-600 rounded-xl font-bold text-sm">Atualizar Dados</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Personalização da Redação</h2>
                            <p className="text-slate-500 mb-10">Configure como a IA deve redigir os parágrafos automáticos.</p>

                            <div className="space-y-8">
                                {[
                                    { label: 'Introdução do Laudo', desc: 'Texto inicial que aparece antes das métricas.' },
                                    { label: 'Análise de Ritmo (Estável)', desc: 'Texto para quando o NOR está dentro do limite.' },
                                    { label: 'Análise de Ritmo (Instável)', desc: 'Texto para quando o NOR está acima do limite.' },
                                ].map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{item.label}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded cursor-help">Tag dinâmica: &#123;&#123;valor&#125;&#125;</span>
                                        </div>
                                        <textarea
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none min-h-[100px] text-sm font-medium focus:border-blue-400 transition-all"
                                            placeholder="Digite o texto padrão aqui..."
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Add Ruleset */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Novo Protocolo Técnico</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Insira as normas oficiais conforme o manual técnico.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 transition-all bg-slate-100 p-3 rounded-2xl">✕</button>
                        </div>

                        <form onSubmit={handleCreateRuleset} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Protocolo</label>
                                    <input
                                        required
                                        placeholder="Ex: Tabela Vetor (Superior)"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                        value={newRuleset.name}
                                        onChange={(e) => setNewRuleset({ ...newRuleset, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Autor / Editora</label>
                                    <input
                                        placeholder="Ex: Editora Vetor"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                        value={newRuleset.author}
                                        onChange={(e) => setNewRuleset({ ...newRuleset, author: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-6">
                                <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-[0.2em] mb-2 text-center">Configurações Normativas</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest ml-1">NOR Máximo (%)</label>
                                        <input type="number" step="0.1" className="w-full p-4 bg-white border border-blue-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-center"
                                            value={newRuleset.thresholds.high_nor}
                                            onChange={(e) => setNewRuleset({ ...newRuleset, thresholds: { ...newRuleset.thresholds, high_nor: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest ml-1">CV Máximo (%)</label>
                                        <input type="number" step="0.1" className="w-full p-4 bg-white border border-blue-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-center"
                                            value={newRuleset.thresholds.high_cv}
                                            onChange={(e) => setNewRuleset({ ...newRuleset, thresholds: { ...newRuleset.thresholds, high_cv: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest ml-1">Intervalos</label>
                                        <input type="number" className="w-full p-4 bg-white border border-blue-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-center"
                                            value={newRuleset.intervals_config.count}
                                            onChange={(e) => setNewRuleset({ ...newRuleset, intervals_config: { count: parseInt(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-slate-500 font-black hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all">SALVAR E ATIVAR PROTOCOLO</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
        </div>
    );
}
