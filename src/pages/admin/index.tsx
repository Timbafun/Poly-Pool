import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/dashboard/AdminLayout'; // Assumindo o caminho do seu layout

interface Market {
    id: string;
    title: string;
    status: 'open' | 'closed' | 'resolved';
    total_volume: number;
    created_at: Timestamp;
}

const AdminMarketsPage = () => {
    const { user, isAdmin, loading } = useAuth();
    const [markets, setMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (loading || !isAdmin) return;

        const q = query(collection(db, 'markets'), orderBy('created_at', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const marketsList: Market[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as Omit<Market, 'id'>
            }));
            setMarkets(marketsList);
            setIsLoading(false);
        }, (error) => {
            console.error("Erro ao carregar mercados:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [loading, isAdmin]);

    if (loading) {
        return <AdminLayout><div className="p-8">Carregando autenticação...</div></AdminLayout>;
    }

    if (!user || !isAdmin) {
        return <AdminLayout><div className="p-8 text-red-600">Acesso negado. Apenas administradores.</div></AdminLayout>;
    }

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate();
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const handleViewDetails = (marketId: string) => {
        router.push(`/admin/${marketId}`);
    };

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold mb-6">Administração de Mercados</h1>
                
                <button
                    onClick={() => router.push('/admin/create')}
                    className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                >
                    + Novo Mercado
                </button>

                {isLoading ? (
                    <div className="text-center py-10">Carregando lista de mercados...</div>
                ) : markets.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">Nenhum mercado encontrado.</div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {markets.map((market) => (
                                    <tr key={market.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{market.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                market.status === 'open' ? 'bg-green-100 text-green-800' :
                                                market.status === 'closed' ? 'bg-red-100 text-red-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                                {market.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R${market.total_volume.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(market.created_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleViewDetails(market.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Detalhes / Resolver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminMarketsPage;