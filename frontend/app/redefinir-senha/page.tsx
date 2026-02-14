"use client";
import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Token de recuperação ausente ou inválido.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/password/reset-confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login?reset=ok');
                }, 3000);
            } else {
                const errData = await res.json();
                setError(errData.detail || 'Falha ao redefinir senha');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
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
                    <h2 className="text-2xl font-black text-[var(--color-primary)]">Senha Alterada!</h2>
                    <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                        Sua senha foi redefinida com sucesso. Você será redirecionado para a tela de login em alguns segundos...
                    </p>
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
                    <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">Nova Senha</h2>
                    <p className="text-xs text-[var(--text-secondary)] font-medium mb-8 leading-relaxed">
                        Crie uma senha forte para garantir a segurança dos seus dados.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="No mínimo 8 caracteres"
                                    className="w-full bg-[var(--color-bg)] h-14 pl-12 pr-12 rounded-2xl border border-transparent focus:border-[var(--color-secondary)] focus:bg-white outline-none transition-all text-sm font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Confirmar Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repita a senha"
                                    className="w-full bg-[var(--color-bg)] h-14 pl-12 pr-12 rounded-2xl border border-transparent focus:border-[var(--color-secondary)] focus:bg-white outline-none transition-all text-sm font-medium"
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
                            disabled={loading || !token}
                            className="w-full btn-accent h-16 text-sm flex items-center justify-center gap-3 active:scale-95 disabled:grayscale"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    SALVAR NOVA SENHA
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
