"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { useAuth } from '../../components/AuthManager';
import { useTransactions } from '../../hooks/useTransactions';

// Inicialização do Firebase (Deve estar na configuração global, mas repetimos para o código ser puro)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function MarketDetailPage() {
    const router = useRouter();
    const { id: marketId } = router.query;
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    
    const [market, setMarket] = useState(null);
    const [isMarketLoading, setIsMarketLoading] = useState(true);
    const [marketError, setMarketError] = useState(null);
    
    // Busca as transações do usuário para este mercado
    const { transactions, isLoading: isTransLoading, error: transError } = useTransactions(marketId);

    // Função para buscar os dados do mercado
    useEffect(() => {
        if (!marketId) return;

        const fetchMarket = async () => {
            if (!currentUser) {
                // Se o usuário não estiver logado, redireciona (regra de segurança)
                router.push('/login');
                return;
            }
            
            setIsMarketLoading(true);
            try {
                const docRef = doc(db, 'markets', marketId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setMarket(docSnap.data());
                } else {
                    setMarketError("Mercado não encontrado.");
                }
            } catch (error) {
                setMarketError(error.message);
            } finally {
                setIsMarketLoading(false);
            }
        };

        fetchMarket();
    }, [marketId, currentUser, router]);

    if (isAuthLoading || isMarketLoading) {
        return <div className="text-center p-20 text-xl text-[var(--primary-foreground)]">Carregando detalhes do mercado...</div>;
    }

    if (marketError) {
        return <div className="text-center p-20 text-xl text-[var(--destructive)]">{marketError}</div>;
    }
    
    if (!market) return null; // Não deve acontecer se o erro for tratado

    const formatBRL = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-8">
            <header className="flex justify-between items-center py-4 border-b border-[var(--border)] mb-8">
                <button 
                    onClick={() => router.push('/')} 
                    className="text-[var(--primary)] hover:text-opacity-80 transition-opacity"
                >
                    &larr; Voltar para Mercados
                </button>
                <h1 className="text-3xl font-extrabold text-[var(--primary)]">
                    Detalhes do Mercado
                </h1>
            </header>

            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Título Principal */}
                <h2 className="text-3xl font-bold text-[var(--primary-foreground)]">
                    {market.title}
                </h2>

                {/* Status e Volume */}
                <div className="flex justify-start space-x-8 text-lg">
                    <p><strong>Status:</strong> <span className={market.status === 'open' ? 'text-green-500' : 'text-red-500'}>{market.status === 'open' ? 'Aberto' : 'Fechado'}</span></p>
                    <p><strong>Volume Total:</strong> {formatBRL(market.total_volume)}</p>
                    <p><strong>Encerramento:</strong> {new Date(market.resolution_date).toLocaleDateString('pt-BR')}</p>
                </div>
                
                {/* Opções e Botões de Compra (Simples) */}
                <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] space-y-4">
                    <h3 className="text-xl font-bold mb-4">Negociação</h3>
                    {/* Aqui entraria o BuyModal diretamente, mas para evitar repetição, mantemos o foco no histórico */}
                    <p className="text-[var(--muted-foreground)]">Para comprar, clique nos botões "Sim" ou "Não" na tela inicial ou use o modal de compra já implementado.</p>
                </div>

                {/* Histórico de Transações do Usuário */}
                <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                    <h3 className="text-xl font-bold mb-4 text-[var(--primary-foreground)]">
                        Suas Transações neste Mercado
                    </h3>
                    
                    {isTransLoading && <p className="text-center text-[var(--muted-foreground)]">Carregando histórico...</p>}
                    {transError && <p className="text-center text-[var(--destructive)]">Erro ao carregar transações: {transError}</p>}
                    
                    {!isTransLoading && transactions.length === 0 && (
                        <p className="text-center text-[var(--muted-foreground)]">Você ainda não fez apostas neste mercado.</p>
                    )}

                    {!isTransLoading && transactions.length > 0 && (
                        <table className="min-w-full divide-y divide-[var(--border)]">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Data</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Ação</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Opção</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Investido (R$)</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Ações Compradas</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Preço na Compra</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-[var(--background)] transition-colors">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(t.date.seconds * 1000).toLocaleString('pt-BR')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-green-500 font-medium">{t.type === 'buy' ? 'COMPRA' : 'VENDA'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold">{market[`option_${t.option}`]}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatBRL(t.amount_invested)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{t.shares_bought.toFixed(2)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatBRL(t.price_at_purchase)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MarketDetailPage;