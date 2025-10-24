const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.processMarketPayout = functions.firestore
    .document('markets/{marketId}')
    .onUpdate(async (change, context) => {
        const after = change.after.data();
        const before = change.before.data();
        const marketId = context.params.marketId;

        if (after.status === 'resolved' && before.status !== 'resolved') {
            
            const resolvedOption = after.resolved_option;
            const payoutPerShare = after.payoutPerShare || 0;

            if (!resolvedOption) {
                return null;
            }

            const transactionsSnapshot = await db.collection('transacoes')
                .where('marketId', '==', marketId)
                .where('type', '==', 'buy')
                .get();

            const userShares = {};

            transactionsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const userId = data.userId;
                const option = data.option;
                const shares = data.shares_bought || 0;
                
                if (!userShares[userId]) {
                    userShares[userId] = { A: 0, B: 0 };
                }
                userShares[userId][option] += shares;
            });
            
            const winningOptionSharesKey = resolvedOption;

            const batch = db.batch();
            let totalPayoutAmount = 0;

            for (const userId in userShares) {
                const winningShares = userShares[userId][winningOptionSharesKey];
                
                if (winningShares > 0.001) { 
                    
                    const payoutAmount = winningShares * payoutPerShare;
                    totalPayoutAmount += payoutAmount;

                    if (payoutAmount > 0) {
                        
                        const userRef = db.collection('users').doc(userId);
                        batch.update(userRef, {
                            saldo: admin.firestore.FieldValue.increment(payoutAmount)
                        });

                        const saldoTxRef = db.collection('transacoes_saldo').doc();
                        batch.set(saldoTxRef, {
                            userId: userId,
                            marketId: marketId,
                            amount: payoutAmount,
                            type: 'payout',
                            date: admin.firestore.FieldValue.serverTimestamp(),
                            description: `Pagamento de lucro do mercado: ${after.title} - Opção ${resolvedOption}`,
                        });
                    }
                }
            }
            
            const fees = after.total_volume * 0.05;
            
            const feeTxRef = db.collection('transacoes_saldo').doc();
            batch.set(feeTxRef, {
                userId: 'SYSTEM_FEE', 
                marketId: marketId,
                amount: fees,
                type: 'fee',
                date: admin.firestore.FieldValue.serverTimestamp(),
                description: `Taxa de 5% do mercado: ${after.title}`,
            });

            batch.update(db.collection('markets').doc(marketId), {
                total_payout_amount: totalPayoutAmount,
                total_fee_amount: fees,
            });

            await batch.commit();
            
            return { success: true, totalPayoutAmount };
        }

        return null;
    });