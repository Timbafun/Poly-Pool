import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
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

export const useTransactions = (marketId) => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser || !marketId) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        const transactionsCol = collection(db, 'transacoes');
        
        // Query: Apenas transações deste usuário E deste mercado
        const q = query(
            transactionsCol, 
            where('userId', '==', currentUser.uid),
            where('marketId', '==', marketId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const transactionsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Ordena pela data mais recente primeiro
            transactionsList.sort((a, b) => b.date.seconds - a.date.seconds);

            setTransactions(transactionsList);
            setIsLoading(false);
            setError(null);
        }, (err) => {
            console.error("Erro ao buscar transações:", err);
            setError(err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, marketId]);

    return { transactions, isLoading, error };
};