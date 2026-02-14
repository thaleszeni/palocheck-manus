"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, HelpCircle, Send, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SuporteContent() {
    const searchParams = useSearchParams();
    const focusTarget = searchParams.get('focus');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        priority: 'normal',
        user_email: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) setSuccess(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="py-20 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--color-secondary)] mb-4 transition-colors">
                    <ArrowLeft size={16} /> Voltar para Home
                </Link>

                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-[var(--color-primary)] tracking-tighter uppercase">Central de Ajuda</h1>
                    <p className="text-lg text-[var(--text-secondary)] font-medium">Estamos aqui para garantir sua estabilidade operacional.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* WhatsApp Card */}
                    <motion.div
                        animate={focusTarget === 'whatsapp' ? { scale: 1.05, borderColor: '#1AA6B7' } : {}}
                        className={`card-premium p-8 text-center space-y-6 flex flex-col items-center border-2 ${focusTarget === 'whatsapp' ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/5' : 'border-transparent bg-white'}`}
                    >
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-lg shadow-green-600/5">
                            <MessageCircle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-black text-xl text-[var(--color-primary)]">WhatsApp</h3>
                            <p className="text-xs text-slate-500 font-medium">Suporte imediato para dúvidas técnicas e plantão clínico.</p>
                        </div>
                        <a href="https://wa.me/550000000000" target="_blank" className="w-full btn-secondary text-[10px] font-black uppercase tracking-widest py-3 hover:bg-green-600 hover:text-white hover:border-green-600">
                            Iniciar Conversa
                        </a>
                    </motion.div>

                    {/* Email Card */}
                    <div className="card-premium p-8 text-center space-y-6 flex flex-col items-center bg-white">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-600/5">
                            <Mail size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-black text-xl text-[var(--color-primary)]">E-mail</h3>
                            <p className="text-xs text-slate-500 font-medium">Envio de logs, solicitações comerciais e feedback.</p>
                        </div>
                        <a href="mailto:suporte@palocheck.com.br" className="w-full btn-secondary text-[10px] font-black uppercase tracking-widest py-3">
                            Enviar E-mail
                        </a>
                    </div>

                    {/* Help Center Placeholder */}
                    <div className="card-premium p-8 text-center space-y-6 flex flex-col items-center bg-white opacity-60">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                            <HelpCircle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-black text-xl text-[var(--color-primary)] tracking-tight">Tutoriais</h3>
                            <p className="text-xs text-slate-500 font-medium italic">Base de conhecimento em construção profissional.</p>
                        </div>
                        <button disabled className="w-full btn-secondary text-[10px] font-black uppercase tracking-widest py-3 cursor-not-allowed">
                            Em breve
                        </button>
                    </div>
                </div>

                {/* Ticket Form */}
                <div className="max-w-3xl mx-auto pt-10">
                    <div className="card-premium p-10 bg-white">
                        <h2 className="text-2xl font-black text-[var(--color-primary)] mb-8 tracking-tight">Abrir Chamado Técnico</h2>

                        {success ? (
                            <div className="py-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-black text-xl text-[var(--color-primary)]">Ticket Aberto!</h3>
                                    <p className="text-sm text-slate-500 font-medium">Recebemos sua solicitação. Nosso suporte responderá em até 12h úteis.</p>
                                </div>
                                <button onClick={() => setSuccess(false)} className="text-xs font-black uppercase tracking-widest text-[var(--color-secondary)] hover:underline">Abrir novo ticket</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu E-mail de Cadastro *</label>
                                    <input required type="email" value={formData.user_email} onChange={e => setFormData({ ...formData, user_email: e.target.value })} className="form-input-palo" placeholder="voce@exemplo.com" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assunto / Tópico *</label>
                                        <input required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="form-input-palo" placeholder="Ex: Erro no Upload" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prioridade</label>
                                        <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="form-input-palo appearance-none">
                                            <option value="low">Baixa (Dúvidas)</option>
                                            <option value="normal">Normal (Operação)</option>
                                            <option value="high">Alta (Interrupção)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição Detalhada *</label>
                                    <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="form-input-palo py-4 h-auto" placeholder="Explique o que está acontecendo..." />
                                </div>

                                <button disabled={loading} type="submit" className="w-full btn-accent h-16 flex items-center justify-center gap-3">
                                    {loading ? <Loader2 className="animate-spin" /> : <>ABRIR CHAMADO TÉCNICO <Send size={18} /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .form-input-palo {
          width: 100%;
          background: var(--color-bg);
          height: 3.5rem;
          padding: 0 1.25rem;
          border-radius: 1rem;
          border: 1px solid transparent;
          font-size: 0.875rem;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }
        .form-input-palo:focus { border-color: var(--color-secondary); background: white; }
      `}</style>
        </main>
    );
}

export default function SuportePage() {
    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <LandingHeader />
            <Suspense fallback={<div className="h-screen flex items-center justify-center font-black text-[var(--color-primary)] animate-pulse">CARREGANDO CANAIS...</div>}>
                <SuporteContent />
            </Suspense>
            <LandingFooter />
        </div>
    );
}
