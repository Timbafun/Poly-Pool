import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
    try {
        const { marketId, resolvedOption, userId } = await request.json();

        if (!marketId || !resolvedOption || !userId) {
            return NextResponse.json({ error: 'Market ID, resolved option, and User ID are required.' }, { status: 400 });
        }

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || !userSnap.data().isAdmin) {
             return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem resolver mercados.' }, { status: 403 });
        }
        
        const marketRef = doc(db, 'markets', marketId);
        const marketSnap = await getDoc(marketRef);

        if (!marketSnap.exists()) {
            return NextResponse.json({ error: 'Mercado não encontrado.' }, { status: 404 });
        }
        
        const marketData = marketSnap.data();
        
        if (marketData.status === 'resolved') {
            return NextResponse.json({ message: 'Mercado já resolvido.' }, { status: 200 });
        }

        const payoutPerShare = marketData.payoutPerShare || 0;
        
        const transactionsQuery = query(collection(db, 'transacoes'), 
            where('marketId', '==', marketId), 
            where('type', '==', 'buy')
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);

        const userShares = {};

        transactionsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const txnUserId = data.userId;
            const option = data.option;
            const shares = data.shares_bought || 0;
            
            if (!userShares[txnUserId]) {
                userShares[txnUserId] = { A: 0, B: 0 };
            }
            userShares[txnUserId][option] += shares;
        });

        const winningOptionSharesKey = resolvedOption;
        const batch = writeBatch(db);
        let totalPayoutAmount = 0;

        for (const txnUserId in userShares) {
            const winningShares = userShares[txnUserId][winningOptionSharesKey];
            
            if (winningShares > 0.001) { 
                
                const payoutAmount = winningShares * payoutPerShare;
                totalPayoutAmount += payoutAmount;

                if (payoutAmount > 0) {
                    
                    const userPayoutRef = doc(db, 'users', txnUserId);
                    batch.update(userPayoutRef, {
                        saldo: increment(payoutAmount)
                    });

                    const saldoTxRef = doc(collection(db, 'transacoes_saldo'));
                    batch.set(saldoTxRef, {
                        userId: txnUserId,
                        marketId: marketId,
                        amount: payoutAmount,
                        type: 'payout',
                        date: serverTimestamp(),
                        description: `Pagamento de lucro do mercado: ${marketData.title} - Opção ${resolvedOption}`,
                    });
                }
            }
        }
        
        const fees = marketData.total_volume * 0.05;
        
        const feeTxRef = doc(collection(db, 'transacoes_saldo'));
        batch.set(feeTxRef, {
            userId: 'SYSTEM_FEE', 
            marketId: marketId,
            amount: fees,
            type: 'fee',
            date: serverTimestamp(),
            description: `Taxa de 5% do mercado: ${marketData.title}`,
        });

        batch.update(marketRef, {
            total_payout_amount: totalPayoutAmount,
            total_fee_amount: fees,
        });

        await batch.commit();

        return NextResponse.json({ success: true, message: `Liquidação concluída. Total pago: R$${totalPayoutAmount.toFixed(2)}` });

    } catch (error) {
        console.error("Erro na liquidação do mercado:", error);
        return NextResponse.json({ error: 'Erro interno do servidor durante a liquidação.' }, { status: 500 });
    }
}