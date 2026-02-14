"use client";
import { API_BASE_URL } from "../config";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RecoverPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/password/reset-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const errData = await res.json();
                setError(errData.detail || 'Falha ao solicitar recuperação');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white dark:bg-[var(--color-surface-dark)] p-10 rounded-[2.5rem] shadow-xl border border-[var(--color-border)] text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-[var(--color-primary)]">Link Enviado!</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                        Se o e-mail <strong>{email}</strong> estiver cadastrado em nosso sistema, você receberá um link para redefinir sua senha em instantes.
                    </p>
                    <div className="pt-4">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-secondary)] hover:underline">
                            <ArrowLeft size={16} />
                            Voltar ao Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--color-primary)] rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-[var(--color-primary)]/20">
                        <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--color-primary)] tracking-tighter">PaloCheck</h1>
                </div>

                <div className="bg-white dark:bg-[var(--color-surface-dark)] p-10 rounded-[2.5rem] shadow-xl border border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">Recuperar senha</h2>
                    <p className="text-xs text-[var(--text-secondary)] font-medium mb-8 leading-relaxed">
                        Informe seu e-mail profissional para receber as instruções de recuperação.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Seu E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@clinica.com.br"
                                    className="w-full bg-[var(--color-bg)] h-14 pl-12 pr-4 rounded-2xl border border-transparent focus:border-[var(--color-secondary)] focus:bg-white outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-accent h-16 text-sm flex items-center justify-center gap-3 active:scale-95 disabled:grayscale"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    ENVIAR INSTRUÇÕES
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/login" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                Cancelar e voltar ao login
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
