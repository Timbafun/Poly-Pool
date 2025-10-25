import { useEffect, useState } from 'react';
import { useRouter } from ''next/navigation';
import { db } from '@/firebase/config';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/components/AuthManager';

interface MarketData {
    title: string;
    description: string;
    status: 'open' | 'closed' | 'resolved';
    option_a_name: string;
    option_b_name: string;
    option_a_price: number;
    option_b_price: number;
    total_volume: number;
    payoutPerShare?: number;
    resolved_option?: 'A' | 'B';
    total_payout_amount?: number;
    total_fee_amount?: number;
    created_at: Timestamp;
    close_date: Timestamp;
}

const LiquidationControls = ({ marketData, marketId, user }: { marketData: MarketData, marketId: string, user: any }) => {
    const [isResolving, setIsResolving] = useState(false);
    const [message, setMessage] = useState('');

    const handleResolve = async (resolvedOption: 'A' | 'B') => {
        if (!confirm(`Tem certeza que deseja resolver o mercado para a opção '${resolvedOption}'? Esta ação é irreversível e acionará os pagamentos.`)) {
            return;
        }

        setIsResolving(true);
        setMessage('');

        try {
            const response = await fetch('/api/market/resolve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    marketId: marketId,
                    resolvedOption: resolvedOption,
                    userId: user.uid
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Sucesso: ${data.message || 'Mercado resolvido e pagamentos processados.'}`);
            } else {
                setMessage(`Erro: ${data.error || 'Falha ao resolver o mercado.'}`);
            }

        } catch (error) {
            setMessage('Erro de conexão ou servidor.');
        } finally {
            setIsResolving(false);
        }
    };

    if (marketData.status === 'resolved') {
        return (
            <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded mt-4">
                <h3 className="font-bold">MERCADO LIQUIDADO</h3>
                <p>Opção Vencedora: **{marketData.resolved_option}**</p>
                <p>Total Pago: R${marketData.total_payout_amount ? marketData.total_payout_amount.toFixed(2) : 'N/A'}</p>
            </div>
        );
    }

    if (marketData.status !== 'closed') {
        return (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded mt-4">
                <p>O mercado deve estar **FECHADO** para ser resolvido.</p>
            </div>
        );
    }
    
    return (
        <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-red-600">Área de Liquidação</h2>
            {message && (
                <div className={`p-3 mb-4 rounded ${message.startsWith('Erro') ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                    {message}
                </div>
            )}
            <p className="mb-4">Selecione a opção vencedora. Esta ação fechará o mercado e acionará a lógica de pagamento.</p>
            <div className="flex space-x-4">
                <button
                    onClick={() => handleResolve('A')}
                    disabled={isResolving}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition duration-150 disabled:bg-gray-400"
                >
                    {isResolving ? 'Processando...' : 'Resolver para Opção A'}
                </button>
                <button
                    onClick={() => handleResolve('B')}
                    disabled={isResolving}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition duration-150 disabled:bg-gray-400"
                >
                    {isResolving ? 'Processando...' : 'Resolver para Opção B'}
                </button>
            </div>
        </div>
    );
};

const AdminMarketDetailPage = () => {
    const router = useRouter();
    const { marketId } = router.query;
    const { user, isAdmin, loading } = useAuth();
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [firestoreError, setFirestoreError] = useState<string | null>(null);

    useEffect(() => {
        if (!marketId || typeof marketId !== 'string') return;

        const marketRef = doc(db, 'markets', marketId);
        
        const unsubscribe = onSnapshot(marketRef, (docSnap) => {
            if (docSnap.exists()) {
                setMarketData(docSnap.data() as MarketData);
                setFirestoreError(null);
            } else {
                setFirestoreError('Mercado não encontrado.');
                setMarketData(null);
            }
        }, (error) => {
            setFirestoreError("Falha ao carregar dados do mercado.");
            setMarketData(null);
        });

        return () => unsubscribe();
    }, [marketId]);

    if (loading) {
        return <div className="p-8">Carregando autenticação...</div>;
    }

    if (!user || !isAdmin) {
        return <div className="p-8 text-red-600">Acesso negado. Apenas administradores.</div>;
    }

    if (firestoreError) {
        return <div className="p-8 text-red-600">Erro: {firestoreError}</div>;
    }

    if (!marketData) {
        return <div className="p-8">Carregando detalhes do mercado...</div>;
    }
    
    const formatDate = (timestamp: Timestamp | Date | undefined) => {
        if (!timestamp) return 'N/A';
        const date = (timestamp as Timestamp).toDate ? (timestamp as Timestamp).toDate() : new Date(timestamp as Date);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button 
                onClick={() => router.push('/admin')}
                className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
            >
                &larr; Voltar para a Lista de Mercados
            </button>

            <h1 className="text-3xl font-extrabold mb-4">{marketData.title}</h1>
            <p className={`text-sm font-semibold mb-6 p-2 rounded inline-block ${
                marketData.status === 'open' ? 'bg-green-200 text-green-800' :
                marketData.status === 'closed' ? 'bg-red-200 text-red-800' :
                marketData.status === 'resolved' ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-800'
            }`}>
                Status: {marketData.status.toUpperCase()}
            </p>

            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                    <p><strong>Descrição:</strong> {marketData.description}</p>
                    <p><strong>Criado em:</strong> {formatDate(marketData.created_at)}</p>
                    <p><strong>Opção A:</strong> {marketData.option_a_name} ({marketData.option_a_price.toFixed(2)})</p>
                    <p><strong>Opção B:</strong> {marketData.option_b_name} ({marketData.option_b_price.toFixed(2)})</p>
                    <p><strong>Volume Total:</strong> R${marketData.total_volume.toFixed(2)}</p>
                    <p><strong>Encerrar em:</strong> {formatDate(marketData.close_date)}</p>
                    {marketData.payoutPerShare !== undefined && (
                        <p className="col-span-2"><strong>Pagamento por Ação:</strong> R${marketData.payoutPerShare.toFixed(4)}</p>
                    )}
                </div>
            </div>
            
            <LiquidationControls marketData={marketData} marketId={marketId as string} user={user} />
            
            {marketData.total_fee_amount && (
                <div className="mt-4 p-4 bg-yellow-100 rounded">
                    <p><strong>Taxas do Sistema (5%):</strong> R${marketData.total_fee_amount.toFixed(2)}</p>
                </div>
            )}
        </div>
    );
};

export default AdminMarketDetailPage;