"use client"; // Necessário devido ao uso de hooks

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
// CORREÇÃO: Importa 'db' do firebase/config, com o caminho relativo correto
import { db } from '../../lib/firebase/config'; 
// CORREÇÃO: Usando 'next/router' para 'pages', o caminho deve ser resolvido corretamente
import { useRouter } from 'next/router';
// CORREÇÃO: Importa 'useAuth' do AuthManager, com o caminho relativo correto
import { useAuth } from '../../components/AuthManager'; 

// CORREÇÃO DE CAMINHO: Ajuste para refletir a subida correta de /src/pages/admin para /src/components
import MarketForm from '../../components/MarketForm'; 
import { MarketList } from '../../components/MarketList'; 

// Definição de tipo (pode ser necessário criar um arquivo de tipos)
interface Market {
    id: string;
    title: string;
    status: 'open' | 'resolved';
    resolution_date: Date;
    total_volume: number;
    // ... outras propriedades de mercado
}

function AdminPanel() {
    const { userData, loading } = useAuth();
    const router = useRouter();
    const [markets, setMarkets] = useState<Market[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // 1. Redirecionamento e verificação de administrador
    useEffect(() => {
        if (!loading) {
            if (!userData || !userData.isAdmin) {
                // Redireciona para a página principal ou mostra erro
                router.push('/');
            }
        }
    }, [userData, loading, router]);

    // 2. Carregamento de dados
    useEffect(() => {
        if (userData && userData.isAdmin) {
            const marketsRef = collection(db, "markets");
            const q = query(marketsRef, orderBy("resolution_date", "desc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMarkets: Market[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Conversão de Timestamp para Date (se necessário)
                    resolution_date: doc.data().resolution_date.toDate(),
                })) as Market[];
                
                setMarkets(fetchedMarkets);
                setIsLoadingData(false);
            }, (error) => {
                console.error("Erro ao carregar mercados:", error);
                setIsLoadingData(false);
            });

            return () => unsubscribe();
        }
    }, [userData]);

    if (loading || !userData || !userData.isAdmin) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500">
                Acesso negado. Apenas administradores.
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-6 bg-[var(--background)] min-h-screen">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[var(--primary)]">Painel Administrativo</h1>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Criar Novo Mercado
                </button>
            </header>

            {isFormOpen && (
                <MarketForm 
                    onClose={() => setIsFormOpen(false)} 
                    db={db} // Passando db para o formulário se necessário
                />
            )}

            {isLoadingData ? (
                <div className="text-center text-[var(--muted-foreground)]">Carregando mercados...</div>
            ) : (
                <MarketList markets={markets} />
            )}
        </div>
    );
}

export default AdminPanel;