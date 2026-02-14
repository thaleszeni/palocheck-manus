"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';
import { CheckCircle2, Loader2, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        role: '',
        email: '',
        whatsapp: '',
        city_uf: '',
        estimated_volume: '<50',
        message: '',
        privacy: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.privacy) {
            setError('Você precisa concordar com a Política de Privacidade.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8000/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/demo/obrigado');
            } else {
                const data = await res.json();
                setError(data.detail || 'Falha ao enviar solicitação.');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <LandingHeader />

            <main className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--color-secondary)] mb-10 transition-colors">
                        <ArrowLeft size={16} /> Voltar para Home
                    </Link>

                    <div className="grid lg:grid-cols-5 gap-16">
                        <div className="lg:col-span-2 space-y-8">
                            <h1 className="text-4xl md:text-5xl font-black text-[var(--color-primary)] leading-[1.1] tracking-tighter">
                                Veja o PaloCheck <br />
                                <span className="text-[var(--color-secondary)]">em prática.</span>
                            </h1>
                            <p className="text-lg text-[var(--text-secondary)] font-medium leading-relaxed">
                                Descubra como automatizar sua medição rítmica com segurança e precisão profissional. Nossa equipe entrará em contato em até 24h.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Demonstração de precisão",
                                    "Fluxo de revisão assistida",
                                    "Configuração de normas",
                                    "Segurança e LGPD"
                                ].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-[var(--color-primary)]">
                                        <CheckCircle2 size={18} className="text-[var(--color-secondary)]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="lg:col-span-3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card-premium p-10 bg-white"
                            >
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo *</label>
                                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input-palo" placeholder="Seu nome" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clínica / Empresa *</label>
                                            <input required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="form-input-palo" placeholder="Nome da empresa" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail Corporativo *</label>
                                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="form-input-palo" placeholder="voce@clinica.com.br" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp *</label>
                                            <input required value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className="form-input-palo" placeholder="(00) 00000-0000" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Volume estimado de exames/mês</label>
                                        <select
                                            value={formData.estimated_volume}
                                            onChange={e => setFormData({ ...formData, estimated_volume: e.target.value })}
                                            className="form-input-palo appearance-none"
                                        >
                                            <option value="<50">Até 50 exames</option>
                                            <option value="50-200">50 a 200 exames</option>
                                            <option value="200-500">200 a 500 exames</option>
                                            <option value="500+">Mais de 500 exames</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mensagem (Opcional)</label>
                                        <textarea rows={3} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="form-input-palo py-4 h-auto" placeholder="Conte-nos sua necessidade..." />
                                    </div>

                                    <div className="flex items-start gap-3 px-1">
                                        <input required type="checkbox" id="privacy" checked={formData.privacy} onChange={e => setFormData({ ...formData, privacy: e.target.checked })} className="mt-1 w-4 h-4 rounded border-slate-300" />
                                        <label htmlFor="privacy" className="text-[10px] font-medium text-slate-500 leading-tight">
                                            Concordo que o PaloCheck processe meus dados para fins de contato comercial e demonstração, conforme a Política de Privacidade e LGPD.
                                        </label>
                                    </div>

                                    {error && <p className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</p>}

                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full btn-accent h-16 flex items-center justify-center gap-3 active:scale-[0.98] disabled:grayscale"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>ENVIAR SOLICITAÇÃO <Send size={18} /></>}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />

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
        .form-input-palo:focus {
          border-color: var(--color-secondary);
          background: white;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
      `}</style>
        </div>
    );
}
