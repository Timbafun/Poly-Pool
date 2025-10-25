// src/hooks/useBalanceTransactions.tsx

// Importe db e auth do seu arquivo de configuração central
import { db } from "../lib/firebase/config"; // Assumindo que config.tsx é a fonte
import { useAuth } from "../components/AuthManager";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";

// Removida toda a inicialização duplicada do Firebase que estava aqui.

export const useBalanceTransactions = () => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        const fetchTransactions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Referência à coleção 'transactions'
                const transactionsRef = collection(db, "transactions");

                // Cria uma consulta filtrando pelo ID do usuário logado e ordenando por data
                const q = query(
                    transactionsRef,
                    where("userId", "==", currentUser.uid),
                    orderBy("date", "desc")
                );

                const querySnapshot = await getDocs(q);
                const fetchedTransactions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setTransactions(fetchedTransactions);
            } catch (err) {
                console.error("Erro ao buscar transações de saldo:", err);
                setError("Falha ao carregar transações.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [currentUser]);

    return { transactions, isLoading, error };
};