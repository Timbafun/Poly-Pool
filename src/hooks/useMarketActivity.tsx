import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../components/AuthManager'; 
import { initializeApp } from 'firebase/app';

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

export const useMarketActivity = () => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [openPositions, setOpenPositions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setTransactions([]);
            setOpenPositions({});
            setIsLoading(false);
            return;
        }

        const transacoesCol = collection(db, 'transacoes');
        const transacoesSaldoCol = collection(db, 'transacoes_saldo');
        
        const qMarket = query(
            transacoesCol, 
            where('userId', '==', currentUser.uid)
        );
        
        const qPayouts = query(
            transacoesSaldoCol, 
            where('userId', '==', currentUser.uid),
            where('type', '==', 'payout')
        );

        const unsubscribeMarket = onSnapshot(qMarket, async (marketSnap) => {
            const tempPositions = {};
            const marketIds = new Set();
            let allTransactions = [];

            marketSnap.docs.forEach(doc => {
                const data = doc.data();
                marketIds.add(data.marketId);
                allTransactions.push({ id: doc.id, ...data, type: data.type, isMarketTx: true });

                if (!tempPositions[data.marketId]) {
                    tempPositions[data.marketId] = { A: 0, B: 0, marketId: data.marketId };
                }

                if (data.type === 'buy') {
                    tempPositions[data.marketId][data.option] += data.shares_bought;
                } else if (data.type === 'sell') {
                    tempPositions[data.marketId][data.option] -= data.shares_sold;
                }
            });

            const unsubscribePayouts = onSnapshot(qPayouts, async (payoutSnap) => {
                const payoutTransactions = payoutSnap.docs.map(doc => {
                    const data = doc.data();
                    marketIds.add(data.marketId);
                    return { id: doc.id, ...data, type: 'payout', isMarketTx: false };
                });
                
                const combinedTransactions = [...allTransactions, ...payoutTransactions];

                const finalPositions = {};
                const marketsData = {};
                const marketPromises = [];

                for (const marketId of marketIds) {
                    const marketRef = doc(db, 'markets', marketId);
                    marketPromises.push(getDoc(marketRef));
                }

                const marketSnaps = await Promise.all(marketPromises);
                
                marketSnaps.forEach(marketSnap => {
                    if (marketSnap.exists()) {
                        marketsData[marketSnap.id] = marketSnap.data();
                        const marketId = marketSnap.id;
                        const data = marketsData[marketId];

                        if (tempPositions[marketId]) {
                            const pos = tempPositions[marketId];
                            
                            if (pos.A > 0.01) {
                                finalPositions[`${marketId}-A`] = {
                                    marketId,
                                    marketTitle: data.title,
                                    option: 'A',
                                    optionText: data.option_A,
                                    shares: pos.A,
                                    status: data.status,
                                    currentPrice: data.price_A,
                                };
                            }
                            if (pos.B > 0.01) {
                                finalPositions[`${marketId}-B`] = {
                                    marketId,
                                    marketTitle: data.title,
                                    option: 'B',
                                    optionText: data.option_B,
                                    shares: pos.B,
                                    status: data.status,
                                    currentPrice: data.price_B,
                                };
                            }
                        }
                    }
                });
                
                const finalTransactions = combinedTransactions.map(t => ({
                    ...t,
                    marketTitle: marketsData[t.marketId]?.title || 'Mercado Desconhecido',
                    optionText: t.option ? marketsData[t.marketId]?.[`option_${t.option}`] : null,
                }));
                
                finalTransactions.sort((a, b) => b.date.seconds - a.date.seconds);

                setTransactions(finalTransactions);
                setOpenPositions(finalPositions);
                setIsLoading(false);
                setError(null);
            }, (err) => {
                setError(err);
                setIsLoading(false);
            });
            
            return () => unsubscribePayouts();

        }, (err) => {
            setError(err);
            setIsLoading(false);
        });

        return () => unsubscribeMarket();
    }, [currentUser]);

    return { marketTransactions: transactions, openPositions, isLoading, error };
};