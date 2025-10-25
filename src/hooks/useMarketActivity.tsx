// src/hooks/useMarketActivity.tsx

import { db } from "../lib/firebase/config"; // Importação correta
import { useAuth } from "../components/AuthManager";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useState, useEffect, useMemo } from "react";

// Removida a inicialização duplicada do Firebase que estava causando o erro.

// Funções utilitárias (podem ser movidas para um arquivo utils.ts, mas funcionam aqui)
const calculateOpenPositions = (transactions, marketData = {}) => {
    const positions = {};

    transactions.forEach(t => {
        const key = `${t.marketId}-${t.option}`;
        const market = marketData[t.marketId] || { title: 'Desconhecido', currentPrice: 0 };
        const optionText = t.optionText || t.option;

        if (!positions[key]) {
            positions[key] = {
                marketId: t.marketId,
                marketTitle: market.title,
                option: t.option,
                optionText: optionText,
                shares: 0,
                costBasis: 0,
                status: 'open',
                currentPrice: market.currentPrice // Usar preço atual do mercado (exemplo)
            };
        }

        if (t.type === 'buy') {
            positions[key].shares += t.shares;
            positions[key].costBasis += t.amount_invested;
        } else if (t.type === 'sell') {
            positions[key].shares -= t.shares;
            // Simplificação: o costBasis real precisaria de lógica FIFO/LIFO mais complexa
        } else if (t.type === 'payout') {
            // Payouts podem fechar posições, dependendo da sua lógica de mercado
            // Para simplificar, focamos apenas nas transações de 'buy'/'sell'
        }
    });

    // Filtra posições com 0 ações
    return Object.fromEntries(
        Object.entries(positions).filter(([, p]) => p.shares > 0)
    );
};


export const useMarketActivity = (marketData = {}) => {
    const { currentUser } = useAuth();
    const [marketTransactions, setMarketTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setMarketTransactions([]);
            setIsLoading(false);
            return;
        }

        const fetchMarketActivity = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Obter transações do mercado
                const marketTransRef = collection(db, "market_transactions");

                const q = query(
                    marketTransRef,
                    where("userId", "==", currentUser.uid),
                    orderBy("date", "desc")
                );

                const querySnapshot = await getDocs(q);
                const fetchedTransactions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setMarketTransactions(fetchedTransactions);
            } catch (err) {
                console.error("Erro ao buscar atividade de mercado:", err);
                setError("Falha ao carregar atividade de mercado.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMarketActivity();
    }, [currentUser]);

    // Calcular posições abertas
    const openPositions = useMemo(() => {
        // Nota: A função de cálculo aqui depende de como você armazena 'marketData' (preços atuais)
        return calculateOpenPositions(marketTransactions, marketData); 
    }, [marketTransactions, marketData]);

    return { marketTransactions, openPositions, isLoading, error };
};