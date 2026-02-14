"use client";
import { API_BASE_URL } from "../config";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = new URLSearchParams();
            payload.append('username', email);
            payload.append('password', password);

            const res = await fetch(`${API_BASE_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: payload,
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('pc_token', data.access_token);
                localStorage.setItem('pc_token_type', data.token_type);

                // Redirecionar para o dashboard principal
                router.push('/cases');
            } else {
                if (res.status === 404) {
                    setError('Serviço de autenticação indisponível. Contate o suporte.');
                } else if (res.status === 401) {
                    setError('E-mail ou senha inválidos.');
                } else {
                    const errData = await res.json();
                    if (typeof errData.detail === 'string') {
                        setError(errData.detail);
                    } else if (Array.isArray(errData.detail)) {
                        setError(errData.detail[0]?.msg || 'Erro de validação nos dados');
                    } else {
                        setError('Falha na autenticação');
                    }
                }
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo / Brand */}
                <div className="flex flex-col items-center mb-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--color-primary)] rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-[var(--color-primary)]/20">
                        <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--color-primary)] tracking-tighter">PaloCheck</h1>
                        <p className="text-sm text-[var(--text-secondary)] font-medium">Plataforma Segura para Avaliação Clínica</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-[var(--color-surface-dark)] p-10 rounded-[2.5rem] shadow-xl border border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-primary)] mb-8">Acesse sua conta</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">E-mail Profissional</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40" size={18} />
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

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Sua Senha</label>
                                <Link href="/recuperar-senha" title="Recuperar senha" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-secondary)] hover:brightness-90 transition-all">Esqueci a senha</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-40" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
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

                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-secondary)] focus:ring-[var(--color-secondary)]" />
                            <label htmlFor="remember" className="text-xs font-semibold text-[var(--text-secondary)] cursor-pointer">Lembrar de mim</label>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold"
                            >
                                ⚠️ {error}
                            </motion.div>
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
                                    ACESSAR PLATAFORMA
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                        Não tem acesso? <Link href="/register" className="text-[var(--color-secondary)] font-bold hover:underline">Solicitar conta para Psicólogo</Link>
                    </p>
                    <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[var(--color-border)]">
                        <p className="text-[9px] text-[var(--text-secondary)] leading-tight font-medium opacity-60">
                            Uso restrito a profissionais certificados. O acesso é auditado e monitorado para segurança dos dados dos pacientes sob LGPD.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
