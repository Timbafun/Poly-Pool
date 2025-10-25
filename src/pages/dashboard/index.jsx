"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthManager';
import { useRouter } from 'next/navigation';

function PortfolioPage() {
    const { currentUser, isLoading, userData } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, isLoading, router]);

    if (isLoading || !currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
                <p className="text-xl text-[var(--foreground)]">Carregando...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--primary)]">Dashboard do Usuário</h1>
                <p className="text-[var(--foreground)]">Bem-vindo(a), {userData?.nome_completo || currentUser.email}.</p>
            </header>

            <main className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[var(--card)] p-6 rounded-lg shadow-lg border border-[var(--border)]">
                        <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-2">Seu Saldo</h2>
                        <p className="text-3xl font-bold text-[var(--primary)]">R$ {userData?.saldo?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-[var(--card)] p-6 rounded-lg shadow-lg border border-[var(--border)]">
                        <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-2">Atividade Recente</h2>
                        <p className="text-[var(--muted-foreground)]">Nenhuma atividade registrada.</p>
                    </div>
                    <div className="bg-[var(--card)] p-6 rounded-lg shadow-lg border border-[var(--border)]">
                        <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-2">Status da Conta</h2>
                        <p className="text-[var(--primary)]">Ativa</p>
                    </div>
                </div>

                <div className="bg-[var(--card)] p-6 rounded-lg shadow-lg border border-[var(--border)]">
                    <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-4">Configurações Rápidas</h2>
                    <button 
                        onClick={() => console.log('Recurso de saque em desenvolvimento.')}
                        className="p-3 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-md hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors mr-3"
                    >
                        Saque Rápido
                    </button>
                    <button 
                        onClick={() => router.push('/settings')}
                        className="p-3 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-md hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors"
                    >
                        Perfil
                    </button>
                </div>
            </main>
        </div>
    );
}

export default PortfolioPage;