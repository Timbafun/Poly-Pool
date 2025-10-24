"use client";

import React, { useState } from 'react';
import { getFirestore, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { useRouter } from 'next/router';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function ResolveMarketModal({ market, onClose }) {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const isResolved = market.status !== 'open';

    const handleResolve = async () => {
        if (isResolved || !selectedOption) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        const marketRef = doc(db, 'markets', market.id);

        try {
            await runTransaction(db, async (transaction) => {
                const marketDoc = await transaction.get(marketRef);

                if (!marketDoc.exists()) {
                    throw new Error("Market document does not exist!");
                }
                
                const currentMarket = marketDoc.data();
                
                if (currentMarket.status !== 'open') {
                    throw new Error("Market is already resolved!");
                }
                
                const winningOption = selectedOption;
                const losingOption = selectedOption === 'A' ? 'B' : 'A';
                
                const totalSharesA = currentMarket.shares_A;
                const totalSharesB = currentMarket.shares_B;
                const totalVolume = currentMarket.total_volume;
                
                const fees = totalVolume * 0.05; 
                const totalPayout = totalVolume - fees; 
                
                const winningShares = winningOption === 'A' ? totalSharesA : totalSharesB;

                const priceA = winningOption === 'A' ? 1.00 : 0.00;
                const priceB = winningOption === 'B' ? 1.00 : 0.00;
                
                const percentageA = winningOption === 'A' ? 100 : 0;
                const percentageB = winningOption === 'B' ? 100 : 0;
                
                const payoutPerShare = winningShares > 0 ? totalPayout / winningShares : 0;

                const winningSharesKey = `shares_${winningOption}`;
                const losingSharesKey = `shares_${losingOption}`;
                const winningPriceKey = `price_${winningOption}`;
                const losingPriceKey = `price_${losingOption}`;
                const winningPercentageKey = `percentage_${winningOption}`;
                const losingPercentageKey = `percentage_${losingOption}`;
                
                transaction.update(marketRef, {
                    status: 'resolved',
                    resolved_option: winningOption,
                    [winningPriceKey]: 1.00,
                    [losingPriceKey]: 0.00,
                    [winningPercentageKey]: 100,
                    [losingPercentageKey]: 0,
                    resolvedAt: serverTimestamp(),
                    payoutPerShare: payoutPerShare,
                });
                
            });

            setSuccess(`Mercado resolvido com sucesso! Ganhador: Opção ${selectedOption}. A liquidação dos usuários será processada.`);
            
            setTimeout(() => {
                onClose();
                router.reload();
            }, 3000); 

        } catch (e) {
            console.error("Erro ao resolver o mercado:", e);
            setError(`Erro: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const optionText = {
        A: market.option_A,
        B: market.option_B,
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-lg p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-[var(--primary)]">
                    {isResolved ? `Mercado Resolvido (${market.resolved_option})` : 'Resolver Mercado'}
                </h2>
                <p className="mb-4 text-lg font-semibold">{market.title}</p>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">Selecione a opção que se concretizou para liquidar o mercado e pagar os vencedores.</p>

                {isResolved ? (
                    <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
                        Este mercado já foi resolvido para a Opção {market.resolved_option}.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={() => setSelectedOption('A')}
                            className={`w-full py-3 px-4 rounded-lg transition-all border-2 font-medium ${
                                selectedOption === 'A' 
                                    ? 'bg-green-700 border-green-500 text-white' 
                                    : 'bg-[var(--background)] border-[var(--border)] hover:bg-[var(--background)]/80'
                            }`}
                        >
                            Opção A: {optionText.A}
                        </button>
                        <button
                            onClick={() => setSelectedOption('B')}
                            className={`w-full py-3 px-4 rounded-lg transition-all border-2 font-medium ${
                                selectedOption === 'B' 
                                    ? 'bg-red-700 border-red-500 text-white' 
                                    : 'bg-[var(--background)] border-[var(--border)] hover:bg-[var(--background)]/80'
                            }`}
                        >
                            Opção B: {optionText.B}
                        </button>
                    </div>
                )}
                

                {error && <p className="p-3 bg-red-800/20 text-red-400 border border-red-400 rounded-lg mt-4">{error}</p>}
                {success && <p className="p-3 bg-green-800/20 text-green-400 border border-green-400 rounded-lg mt-4">{success}</p>}

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg font-medium hover:bg-[var(--secondary)]/80 transition-colors"
                    >
                        Fechar
                    </button>
                    {!isResolved && (
                        <button
                            onClick={handleResolve}
                            disabled={loading || !selectedOption}
                            className="py-2 px-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Liquidando...' : 'Confirmar Resolução'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResolveMarketModal;
```eof