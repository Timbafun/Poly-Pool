import { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
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

const calculatePrices = (market) => {
    if (market.total_volume === 0 || isNaN(market.total_volume) || !market.total_volume) {
        return {
            ...market,
            price_A: 0.50,
            price_B: 0.50,
            percentage_A: 50,
            percentage_B: 50,
        };
    }
    
    // Cálculo AMM simplificado: Preço = (Pool do Outro Lado) / (Volume Total)
    const total = market.pool_A + market.pool_B;
    
    // Evita divisão por zero
    if (total === 0) {
        return {
            ...market,
            price_A: 0.50,
            price_B: 0.50,
            percentage_A: 50,
            percentage_B: 50,
        };
    }
    
    const price_A = market.pool_B / total; 
    const price_B = market.pool_A / total;

    const percentage_A = Math.round(price_A * 100);
    const percentage_B = Math.round(price_B * 100);
    
    // Garante que a soma das porcentagens não ultrapasse 100% devido ao arredondamento
    const sumPercent = percentage_A + percentage_B;
    
    return {
        ...market,
        price_A: parseFloat(price_A.toFixed(2)),
        price_B: parseFloat(price_B.toFixed(2)),
        percentage_A: sumPercent > 100 ? percentage_A - (sumPercent - 100) : percentage_A,
        percentage_B: sumPercent > 100 ? percentage_B : percentage_B + (100 - sumPercent), // Ajusta o B para fechar 100
    };
};

export const useMarkets = () => {
    const [markets, setMarkets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const marketsCol = collection(db, 'markets');
        
        const unsubscribe = onSnapshot(marketsCol, (snapshot) => {
            const marketsList = snapshot.docs.map(doc => {
                const data = doc.data();
                return calculatePrices({
                    id: doc.id,
                    ...data
                });
            });
            setMarkets(marketsList);
            setIsLoading(false);
            setError(null);
        }, (err) => {
            console.error("Erro ao buscar mercados:", err);
            setError(err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { markets, isLoading, error };
};