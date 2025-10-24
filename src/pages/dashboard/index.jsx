"use client";

import React, { useEffect } from 'react';
import { useAuth } from '../../components/AuthManager';
import { useRouter } from 'next/router';
import { Header } from '../../components/header'; // Importação do componente Header

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

function DashboardPage() {
    const { currentUser, userData, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !currentUser) {
            router.replace('/login'); 
        }
    }, [isLoading, currentUser, router]);

    if (isLoading || !currentUser) {
        return <div className="text-center p-12 text-lg text-[var(--primary-foreground)]">Verificando autenticação...</div>;
    }

    if (!userData) {
        return <div className="text-center p-12 text-lg text-[var(--primary-foreground)]">Carregando dados do usuário...</div>;
    }

    const saldoFormatado = userData.saldo !== undefined 
        ? parseFloat(userData.saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : 'R$ 0,00';

    return (
        <>
            <Header /> {/* Componente Header adicionado aqui */}
            <div className="max-w-[800px] mx-auto my-12 p-8 rounded-xl shadow-2xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)]">
                <h1 className="text-3xl font-bold mb-6 text-[var(--primary-foreground)]">Dashboard PoolPoly</h1>
                <p className="mb-4 text-[var(--foreground)]">Bem-vindo(a), **{userData.nome_completo || 'Usuário'}**!</p>

                <div className="p-6 mb-6 rounded-lg text-center bg-[var(--secondary)] border border-[var(--border)]">
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">Seu Saldo Atual</h3>
                    <p className="text-4xl font-extrabold mt-2 text-[var(--chart-1)]">
                        {saldoFormatado}
                    </p>
                </div>

                <div className="p-4 mb-8 rounded-lg bg-[var(--popover)] border border-[var(--border)] text-[var(--popover-foreground)]">
                    <h3 className="text-xl font-semibold mb-3 border-b border-[var(--border)] pb-2 text-[var(--primary)]">Detalhes da Conta</h3>
                    <p className="mb-2"><strong>E-mail:</strong> {currentUser.email}</p>
                    <p className="mb-2"><strong>CPF:</strong> {userData.cpf || 'Não informado'}</p>
                    <p className="mb-2"><strong>Telefone:</strong> {userData.telefone || 'Não informado'}</p>
                    <p><strong>Status:</strong> <span className="text-green-500 font-medium">Ativa</span></p>
                </div>

                <button onClick={logout} 
                        className="w-full p-3 rounded-md bg-[var(--destructive)] text-[var(--destructive-foreground)] font-bold hover:opacity-90 transition-opacity">
                    Sair da Conta (Logout)
                </button>
            </div>
        </>
    );
}

export default DashboardPage;