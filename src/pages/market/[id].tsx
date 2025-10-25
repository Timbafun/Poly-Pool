"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useMarket } from '../../hooks/useMarkets';
import TradeModal from '../../components/TradeModal';
import { useAuth } from '../../components/AuthManager';
import { useMarketUserPositions } from '../../hooks/useMarketUserPositions';
import { useMarketTransactions } from '../../hooks/useMarketTransactions'; // NOVO HOOK

function MarketDetailsPage() {
    const router = useRouter();
    const { id: marketId } = router.query;
    
    const { market, isLoading: isMarketLoading, error: marketError } = useMarket(marketId);
    const { userData, isLoading: isAuthLoading } = useAuth();
    const { positions, isLoading: isPositionsLoading } = useMarketUserPositions(marketId);
    const { transactions, isLoading: isTransLoading } = useMarketTransactions(marketId); // NOVO

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null); 
    const [selectedPrice, setSelectedPrice] = useState(0); 
    const [activeTab, setActiveTab] = useState('chart'); // 'chart', 'transactions', 'user_pos'

    useEffect(() => {
        if (!marketId) return;
        
        // Se o mercado não carregar ou houver erro, podemos redirecionar
        if (!isMarketLoading && !market && !marketError) {
             // Redirecionar para a home se o mercado não for encontrado (opcional)
             // router.push('/');
        }
    }, [marketId, isMarketLoading, market, marketError, router]);


    if (isMarketLoading || isAuthLoading) {
        return <div className="text-center p-20 text-xl text-[var(--primary-foreground)]">Carregando mercado...</div>;
    }

    if (marketError) {
        return <div className="text-center p-20 text-xl text-red-500">Erro ao carregar o mercado: {marketError.message}</div>;
    }
    
    if (!market) {
        return <div className="text-center p-20 text-xl text-[var(--primary-foreground)]">Mercado não encontrado.</div>;
    }

    const currentBalance = userData?.saldo || 0;
    const isMarketOpen = market.status === 'open';
    const formatBRL = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

    const handleTradeClick = (option, price) => {
        setSelectedOption(option);
        setSelectedPrice(price);
        setIsModalOpen(true);
    };

    const getPriceColor = (percentage) => {
        if (percentage >= 70) return 'bg-green-600';
        if (percentage >= 50) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    // --- Componentes das Abas ---

    // 1. Histórico Simulado/Gráfico (Chart)
    const ChartTab = () => {
        // Simular histórico de preço usando as transações existentes
        const priceHistory = transactions
            .filter(t => t.type === 'buy')
            .map(t => ({
                date: t.date,
                priceA: t.option === 'A' ? t.price_at_purchase : null,
                priceB: t.option === 'B' ? t.price_at_purchase : null,
                option: t.option,
            }))
            .sort((a, b) => a.date.seconds - b.date.seconds);

        if (priceHistory.length === 0) {
            return <p className="p-8 text-center text-[var(--muted-foreground)]">Nenhuma transação de compra registrada para simular o histórico de preço.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Data</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">{market.option_A}</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">{market.option_B}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {priceHistory.map((h, index) => (
                            <tr key={index} className="hover:bg-[var(--background)] transition-colors">
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(h.date.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                    {h.option === 'A' ? formatBRL(h.priceA) : '-'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                     {h.option === 'B' ? formatBRL(h.priceB) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                    *Esta é uma simulação de histórico de preço baseada apenas nas transações de compra registradas.
                </p>
            </div>
        );
    };

    // 2. Transações de Mercado (Activity)
    const TransactionsTab = () => {
        if (isTransLoading) {
            return <p className="p-8 text-center text-[var(--muted-foreground)]">Carregando transações...</p>;
        }
        
        if (transactions.length === 0) {
            return <p className="p-8 text-center text-[var(--muted-foreground)]">Nenhuma transação de compra/venda registrada neste mercado.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Data/Hora</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Ação</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Opção</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Preço</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Ações</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Valor (R$)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-[var(--background)] transition-colors">
                                <td className="px-4 py-2 whitespace-nowrap text-xs">
                                    {new Date(t.date.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                                <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${t.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                                    {t.type.toUpperCase()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold">{t.option}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                    {formatBRL(t.price_at_purchase || t.price_at_sale)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                    {(t.shares_bought || t.shares_sold || 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                    {formatBRL(t.amount_invested || t.amount_received || 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // 3. Posições do Usuário (User Positions)
    const UserPositionsTab = () => {
         if (isPositionsLoading) {
            return <p className="p-8 text-center text-[var(--muted-foreground)]">Calculando suas posições...</p>;
        }
        
        const userPositions = Object.values(positions).filter(p => p.shares > 0.01);

        if (userPositions.length === 0) {
            return <p className="p-8 text-center text-[var(--muted-foreground)]">Você não tem ações neste mercado.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Opção</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Ações Compradas</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Valor Atual (R$)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {userPositions.map((p) => (
                            <tr key={p.option} className="hover:bg-[var(--background)] transition-colors">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold">{p.optionText}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{p.shares.toFixed(2)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold">{formatBRL(p.shares * p.currentPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-8">
            <header className="flex justify-between items-center py-4 border-b border-[var(--border)] mb-8">
                 <button onClick={() => router.push('/')} className="text-xl text-[var(--primary)] hover:text-opacity-80 transition-opacity">
                    &larr; Voltar para Mercados
                </button>
                <h1 className="text-3xl font-extrabold text-[var(--primary)]">
                    Detalhes do Mercado
                </h1>
                <div></div>
            </header>

            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* ---------------------------------- */}
                {/* INFORMAÇÕES PRINCIPAIS E OPÇÕES */}
                {/* ---------------------------------- */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-[var(--primary-foreground)] mb-4 leading-snug">
                        {market.title}
                    </h2>
                    
                    <div className="flex justify-between items-center text-sm mb-4">
                         <div className="text-[var(--muted-foreground)]">
                            Volume Total: <span className="font-bold text-[var(--foreground)]">{formatBRL(market.total_volume)}</span>
                        </div>
                        <div className={`font-bold ${isMarketOpen ? 'text-green-500' : 'text-red-500'}`}>
                            Status: {isMarketOpen ? 'ABERTO' : 'FECHADO'}
                        </div>
                    </div>

                    <div className="space-y-3">
                        
                        {/* Opção A */}
                        <div className="flex items-center space-x-4 p-3 bg-[var(--background)] rounded-lg">
                            <div className="w-16 text-right font-extrabold text-2xl text-[var(--primary)]">
                                {market.percentage_A}%
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-[var(--foreground)]">{market.option_A}</p>
                                <p className="text-sm text-[var(--muted-foreground)]">
                                    Preço: <span className="font-bold">{formatBRL(market.price_A)}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => handleTradeClick('A', market.price_A)} 
                                className={`py-2 px-4 rounded-lg font-bold text-[var(--card-foreground)] transition-colors ${getPriceColor(market.percentage_A)} hover:bg-opacity-90`}
                                disabled={!isMarketOpen}
                            >
                                Negociar
                            </button>
                        </div>

                        {/* Opção B */}
                        <div className="flex items-center space-x-4 p-3 bg-[var(--background)] rounded-lg">
                            <div className="w-16 text-right font-extrabold text-2xl text-[var(--primary)]">
                                {market.percentage_B}%
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-[var(--foreground)]">{market.option_B}</p>
                                <p className="text-sm text-[var(--muted-foreground)]">
                                    Preço: <span className="font-bold">{formatBRL(market.price_B)}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => handleTradeClick('B', market.price_B)}
                                className={`py-2 px-4 rounded-lg font-bold text-[var(--card-foreground)] transition-colors ${getPriceColor(market.percentage_B)} hover:bg-opacity-90`}
                                disabled={!isMarketOpen}
                            >
                                Negociar
                            </button>
                        </div>
                    </div>
                </div>

                {/* ---------------------------------- */}
                {/* ABAS DE INFORMAÇÕES (Gráfico, Transações, Posições) */}
                {/* ---------------------------------- */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-lg">
                    <div className="flex border-b border-[var(--border)] mb-4">
                        <button
                            onClick={() => setActiveTab('chart')}
                            className={`py-2 px-4 font-semibold ${activeTab === 'chart' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                        >
                            Gráfico / Histórico
                        </button>
                         <button
                            onClick={() => setActiveTab('transactions')}
                            className={`py-2 px-4 font-semibold ${activeTab === 'transactions' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                        >
                            Atividade (Transações)
                        </button>
                        <button
                            onClick={() => setActiveTab('user_pos')}
                            className={`py-2 px-4 font-semibold ${activeTab === 'user_pos' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                        >
                            Minhas Posições
                        </button>
                    </div>

                    {activeTab === 'chart' && <ChartTab />}
                    {activeTab === 'transactions' && <TransactionsTab />}
                    {activeTab === 'user_pos' && <UserPositionsTab />}

                </div>

            </div>
            
            {isModalOpen && selectedOption && (
                <TradeModal 
                    market={market}
                    option={selectedOption}
                    price={selectedPrice}
                    currentBalance={currentBalance}
                    maxShares={selectedOption === 'A' ? positions.A.shares : positions.B.shares} 
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

export default MarketDetailsPage;