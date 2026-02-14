"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DemoSuccessPage() {
    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center space-y-8"
            >
                <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-600 mx-auto shadow-xl shadow-green-600/5 border border-green-100">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-[var(--color-primary)] tracking-tighter uppercase">Solicitação Recebida</h1>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                        Obrigado pelo seu interesse! Nossa equipe técnica analisará sua solicitação e entrará em contato via WhatsApp ou e-mail em breve para agendar sua demonstração personalizada.
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/" className="btn-accent px-10 flex items-center justify-center gap-3">
                        VOLTAR PARA HOME <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
