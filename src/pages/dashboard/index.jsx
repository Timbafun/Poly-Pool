"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../components/AuthManager';
import BalanceModal from '../../components/BalanceModal';
import { useBalanceTransactions } from '../../hooks/useBalanceTransactions';
import { useMarketActivity } from '../../hooks/useMarketActivity';

function PortfolioPage() {
    const { currentUser, userData, isLoading: isAuthLoading, logout } = useAuth();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState(''); 
    const [activeTab, setActiveTab] = useState('positions');

    const { transactions: balanceTransactions, isLoading: isBalanceTransLoading } = useBalanceTransactions();
    const { marketTransactions, openPositions, isLoading: isMarketActivityLoading } = useMarketActivity(); 

    if (isAuthLoading) {
        return <div className="text-center p-20 text-xl text-[var(--primary-foreground)]">Carregando autenticação...</div>;
    }

    if (!currentUser) {
        router.push('/login');
        return null;
    }
    
    if (!userData) {
        return <div className="text-center p-20 text-xl text-[var(--primary-foreground)]">Carregando dados do usuário...</div>;
    }

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleOpenModal = (mode) => {
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const currentBalance = userData?.saldo || 0;
    const formatBRL = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;
    
    const openPositionsArray = useMemo(() => {
        return Object.values(openPositions).filter(p => p.status === 'open');
    }, [openPositions]);

    const PositionsTable = () => {
        if (isMarketActivityLoading) {
            return <p className="text-center p-8 text-[var(--muted-foreground)]">Calculando suas posições...</p>;
        }

        if (openPositionsArray.length === 0) {
            return <p className="text-center p-8 text-[var(--muted-foreground)]">Você não tem posições abertas em mercados ativos.</p>;
        }
        
        return (
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Mercado</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Opção</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Ações</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Preço Atual</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Valor Atual (R$)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {openPositionsArray.map((p) => (
                            <tr 
                                key={`${p.marketId}-${p.option}`} 
                                className="hover:bg-[var(--background)] transition-colors cursor-pointer"
                                onClick={() => router.push(`/market/${p.marketId}`)}
                            >
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold">{p.marketTitle}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{p.optionText}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{p.shares.toFixed(2)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatBRL(p.currentPrice)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold">{formatBRL(p.shares * p.currentPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        );
    };

    const BalanceHistoryTable = () => {
         if (isBalanceTransLoading) {
            return <p className="text-center p-8 text-[var(--muted-foreground)]">Carregando histórico de saldo...</p>;
        }
        
        if (balanceTransactions.length === 0) {
            return <p className="text-center p-8 text-[var(--muted-foreground)]">Nenhuma transação de saldo encontrada.</p>;
        }

        return (
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Data</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Tipo</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Valor (R$)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {balanceTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-[var(--background)] transition-colors">
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(t.date.seconds * 1000).toLocaleString('pt-BR')}</td>
                                <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${t.type === 'deposit' ? 'text-green-500' : t.type === 'withdraw' ? 'text-red-500' : 'text-yellow-500'}`}>
                                    {t.type.toUpperCase()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatBRL(t.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        );
    };
    
    const MarketActivityTable = () => {
         if (isMarketActivityLoading) {
            return <p className="p-8 text-center text-[var(--muted-foreground)]">Carregando atividade de mercado...</p>;
        }
        
        if (marketTransactions.length === 0) {
            return <p className="p-8 text-center text-[var(--muted-foreground)]">Nenhuma transação de mercado registrada.</p>;
        }

        return (
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Data</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Tipo</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Mercado</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Valor (R$)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {marketTransactions.map((t) => {
                            let typeColor = 'text-[var(--foreground)]';
                            let amountDisplay = t.amount_invested || t.amount_received || t.amount || 0;
                            let typeText = t.type.toUpperCase();

                            if (t.type === 'buy') {
                                typeColor = 'text-red-500';
                            } else if (t.type === 'sell' || t.type === 'payout') {
                                typeColor = 'text-green-500';
                            }

                            return (
                                <tr key={t.id} className="hover:bg-[var(--background)] transition-colors">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(t.date.seconds * 1000).toLocaleString('pt-BR')}</td>
                                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${typeColor}`}>
                                        {typeText}
                                    </td>
                                    <td 
                                        className="px-4 py-2 whitespace-nowrap text-sm font-semibold cursor-pointer hover:text-[var(--primary)]"
                                        onClick={() => t.marketId && router.push(`/market/${t.marketId}`)}
                                    >
                                        {t.marketTitle} ({t.optionText || t.option || '-'})
                                    </td>
                                    <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-bold ${typeColor}`}>
                                        {t.type === 'buy' && '- '}
                                        {formatBRL(amountDisplay)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
             </div>
        );
    };


    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-8">
            <header className="flex justify-between items-center py-4 border-b border-[var(--border)] mb-8">
                <h1 className="text-3xl font-extrabold text-[var(--primary)]">
                    Seu Portfólio PoolPoly
                </h1>
                <button
                    onClick={handleLogout}
                    className="py-2 px-4 bg-[var(--destructive)] text-[var(--destructive-foreground)] rounded-lg font-medium hover:bg-opacity-90 transition-opacity"
                >
                    Sair
                </button>
            </header>

            <div className="max-w-6xl mx-auto space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-lg col-span-1">
                        <p className="text-sm text-[var(--muted-foreground)] mb-1">Cash / Saldo Disponível</p>
                        <p className="text-4xl font-extrabold text-[var(--primary)] mb-6">
                            {formatBRL(currentBalance)}
                        </p>
                        
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleOpenModal('deposit')}
                                className="flex-1 py-3 px-4 bg-green-600 text-[var(--card-foreground)] rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                Depositar
                            </button>
                            <button
                                onClick={() => handleOpenModal('withdraw')}
                                className="flex-1 py-3 px-4 bg-red-600 text-[var(--card-foreground)] rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Sacar
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-lg col-span-1">
                        <p className="text-sm text-[var(--muted-foreground)] mb-1">Valor do Portfolio</p>
                        <p className="text-4xl font-extrabold text-[var(--primary)] mb-6">
                            {formatBRL(openPositionsArray.reduce((acc, p) => acc + (p.shares * p.currentPrice), 0))}
                        </p>
                    </div>

                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-lg col-span-1">
                        <p className="text-sm text-[var(--muted-foreground)] mb-1">Lucro / Prejuízo</p>
                        <p className="text-4xl font-extrabold text-[var(--primary)] mb-6">
                            {formatBRL(0.00)}
                        </p>
                    </div>
                </div>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-lg mt-8">
                    
                    <div className="flex border-b border-[var(--border)] mb-4">
                        <button
                            onClick={() => setActiveTab('positions')}
                            className={`py-2 px-4 font-semibold ${activeTab === 'positions' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                        >
                            Posições Abertas
                        </button>
                         <button
                            onClick={() => setActiveTab('market_activity')}
                            className={`py-2 px-4 font-semibold ${activeTab === 'market_activity' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                        >
                            Transações de Mercado
                        </button>
                         <button
                            onClick={() => setActiveTab('balance_history')}
                            className={`py-2 px-4 font-semibold ${activeTab === 'balance_history' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                        >
                            Histórico de Saldo (D/S)
                        </button>
                    </div>

                    {activeTab === 'positions' && <PositionsTable />}
                    {activeTab === 'market_activity' && <MarketActivityTable />}
                    {activeTab === 'balance_history' && <BalanceHistoryTable />}
                </div>
            </div>
            
            {isModalOpen && (
                <BalanceModal 
                    mode={modalMode}
                    currentBalance={currentBalance}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

export default PortfolioPage;
```eof