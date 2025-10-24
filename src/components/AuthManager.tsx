"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser,
    User as FirebaseUser,
    Auth,
    UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, DocumentData, runTransaction, collection, Timestamp, query, where, getDocs, QuerySnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

const USER_COLLECTION_NAME = 'users';

interface UserData extends DocumentData {
    nome_completo: string;
    cpf: string;
    telefone: string;
    email: string;
    saldo: number;
    data_cadastro: string;
    isAdmin?: boolean; // Adicionado para a checagem de administrador
}

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userData: UserData | null;
    isLoading: boolean;
    isAdmin: boolean; // Adicionado para a checagem de administrador
    register: (email: string, password: string, nome_completo: string, cpf: string, telefone: string) => Promise<void>;
    login: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
    placeBet: (marketId: string, option: 'A' | 'B', amount: number, price: number) => Promise<void>;
    sellBet: (marketId: string, option: 'A' | 'B', shares: number, price: number) => Promise<void>;
    deposit: (amount: number) => Promise<void>;
    withdraw: (amount: number) => Promise<void>;
    resolveMarket: (marketId: string, winningOption: 'A' | 'B') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Variável calculada para checar se é administrador
    const isAdmin = userData?.isAdmin ?? false;

    const fetchData = useCallback(async (user: FirebaseUser | null) => {
        if (user) {
            try {
                // Adicionando um listener para atualizações em tempo real dos dados do usuário (incluindo isAdmin)
                const docRef = doc(db, USER_COLLECTION_NAME, user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data() as UserData);
                } else {
                    setUserData(null);
                }
            } catch (error) {
                setUserData(null);
            }
        } else {
            setUserData(null);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchData(user);
            }
            setIsLoading(false);
        });

        return unsubscribe;
    }, [fetchData]);

    const register = async (email: string, password: string, nome_completo: string, cpf: string, telefone: string) => {
        let user: FirebaseUser | null = null;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            user = userCredential.user;

            await user.getIdToken(true); 

            const data: UserData = {
                nome_completo,
                cpf,
                telefone,
                email,
                saldo: 0.00,
                data_cadastro: new Date().toISOString(),
                isAdmin: false, // Define explicitamente como false no registro
            };

            await setDoc(doc(db, USER_COLLECTION_NAME, user.uid), data);
            
            setUserData(data); 
            setCurrentUser(user);

        } catch (error) {
            if (user) {
                try {
                    await deleteUser(user);
                } catch (deleteError) {
                }
            }
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
           const userCredential = await signInWithEmailAndPassword(auth, email, password);
           const user = userCredential.user;

           await user.getIdToken(true); 

           return userCredential;
    };

    const placeBet = async (marketId: string, option: 'A' | 'B', amount: number, price: number) => {
        if (!currentUser || !userData) {
            throw new Error("Usuário não autenticado ou dados ausentes.");
        }
        
        const amountCents = Math.round(amount * 100);

        const marketRef = doc(db, 'markets', marketId);
        const userRef = doc(db, 'users', currentUser.uid);
        
        try {
            await runTransaction(db, async (transaction) => {
                const marketDoc = await transaction.get(marketRef);
                const userDoc = await transaction.get(userRef);

                if (!marketDoc.exists()) {
                    throw new Error("Mercado não encontrado.");
                }

                if (!userDoc.exists()) {
                    throw new Error("Dados do usuário não encontrados.");
                }

                const marketData = marketDoc.data();
                const userData = userDoc.data();
                const userCurrentBalanceCents = Math.round(userData.saldo * 100);

                if (userCurrentBalanceCents < amountCents) {
                    throw new Error("Saldo insuficiente para esta aposta.");
                }
                
                const amountShares = amount / price; 
                
                let newPoolA = marketData.pool_A;
                let newPoolB = marketData.pool_B;
                
                if (option === 'A') {
                    newPoolA += amount; 
                } else if (option === 'B') {
                    newPoolB += amount; 
                } else {
                    throw new Error("Opção de aposta inválida.");
                }
                
                const newTotalVolume = marketData.total_volume + amount;
                const newBalanceCents = userCurrentBalanceCents - amountCents;
                
                transaction.update(marketRef, {
                    pool_A: newPoolA,
                    pool_B: newPoolB,
                    total_volume: newTotalVolume,
                });

                transaction.update(userRef, {
                    saldo: newBalanceCents / 100,
                });
                
                const transactionRef = doc(collection(db, 'transacoes'));
                transaction.set(transactionRef, {
                    userId: currentUser.uid,
                    marketId: marketId,
                    option: option,
                    amount_invested: amount,
                    shares_bought: amountShares,
                    price_at_purchase: price,
                    date: Timestamp.now(),
                    type: 'buy',
                });
            });

            await fetchData(currentUser); 
            
        } catch (error) {
            throw error;
        }
    };
    
    const sellBet = async (marketId: string, option: 'A' | 'B', sharesToSell: number, price: number) => {
        if (!currentUser || !userData) {
            throw new Error("Usuário não autenticado ou dados ausentes.");
        }
        
        const marketRef = doc(db, 'markets', marketId);
        const userRef = doc(db, 'users', currentUser.uid);
        
        try {
            await runTransaction(db, async (transaction) => {
                const marketDoc = await transaction.get(marketRef);
                const userDoc = await transaction.get(userRef);

                if (!marketDoc.exists()) {
                    throw new Error("Mercado não encontrado.");
                }

                if (!userDoc.exists()) {
                    throw new Error("Dados do usuário não encontrados.");
                }

                const transacoesCol = collection(db, 'transacoes');
                const q = query(
                    transacoesCol, 
                    where('userId', '==', currentUser.uid),
                    where('marketId', '==', marketId),
                    where('option', '==', option)
                );
                
                const transacoesSnap = await getDocs(q) as QuerySnapshot<DocumentData>; 
                
                let totalShares = 0;
                transacoesSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.type === 'buy') {
                        totalShares += data.shares_bought;
                    } else if (data.type === 'sell') {
                        totalShares -= data.shares_sold;
                    }
                });
                
                if (sharesToSell > totalShares) {
                    throw new Error(`Você só possui ${totalShares.toFixed(2)} ações de ${option}.`);
                }
                
                const amountReceived = sharesToSell * price;
                const amountCents = Math.round(amountReceived * 100);
                
                const marketData = marketDoc.data();
                const userData = userDoc.data();
                const userCurrentBalanceCents = Math.round(userData.saldo * 100);

                let newPoolA = marketData.pool_A;
                let newPoolB = marketData.pool_B;

                if (option === 'A') {
                    newPoolA -= amountReceived;
                } else if (option === 'B') {
                    newPoolB -= amountReceived;
                }
                
                if (newPoolA < 0 || newPoolB < 0) {
                     throw new Error("Erro de liquidez no pool. Tente vender menos.");
                }

                const newTotalVolume = marketData.total_volume - amountReceived;
                const newBalanceCents = userCurrentBalanceCents + amountCents;
                
                transaction.update(marketRef, {
                    pool_A: newPoolA,
                    pool_B: newPoolB,
                    total_volume: newTotalVolume,
                });

                transaction.update(userRef, {
                    saldo: newBalanceCents / 100,
                });
                
                const transactionRef = doc(collection(db, 'transacoes'));
                transaction.set(transactionRef, {
                    userId: currentUser.uid,
                    marketId: marketId,
                    option: option,
                    amount_received: amountReceived,
                    shares_sold: sharesToSell,
                    price_at_sale: price,
                    date: Timestamp.now(),
                    type: 'sell',
                });
            });

            await fetchData(currentUser); 
            
        } catch (error) {
            throw error;
        }
    };
    
    const deposit = async (amount: number) => {
        if (!currentUser || !userData) {
            throw new Error("Usuário não autenticado.");
        }
        
        const userRef = doc(db, 'users', currentUser.uid);
        const amountCents = Math.round(amount * 100);

        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error("Dados do usuário não encontrados.");
                }

                const userData = userDoc.data();
                const userCurrentBalanceCents = Math.round(userData.saldo * 100);
                
                const newBalanceCents = userCurrentBalanceCents + amountCents;
                
                transaction.update(userRef, {
                    saldo: newBalanceCents / 100,
                });
                
                const transactionRef = doc(collection(db, 'transacoes_saldo'));
                transaction.set(transactionRef, {
                    userId: currentUser.uid,
                    amount: amount,
                    date: Timestamp.now(),
                    type: 'deposit',
                });
            });

            await fetchData(currentUser);
        } catch (error) {
            throw error;
        }
    };
    
    const withdraw = async (amount: number) => {
        if (!currentUser || !userData) {
            throw new Error("Usuário não autenticado.");
        }
        
        const userRef = doc(db, 'users', currentUser.uid);
        const amountCents = Math.round(amount * 100);

        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error("Dados do usuário não encontrados.");
                }

                const userData = userDoc.data();
                const userCurrentBalanceCents = Math.round(userData.saldo * 100);

                if (userCurrentBalanceCents < amountCents) {
                    throw new Error("Saldo insuficiente para este saque.");
                }
                
                const newBalanceCents = userCurrentBalanceCents - amountCents;
                
                transaction.update(userRef, {
                    saldo: newBalanceCents / 100,
                });

                const transactionRef = doc(collection(db, 'transacoes_saldo'));
                transaction.set(transactionRef, {
                    userId: currentUser.uid,
                    amount: amount,
                    date: Timestamp.now(),
                    type: 'withdraw',
                });
            });

            await fetchData(currentUser);
        } catch (error) {
            throw error;
        }
    };
    
    const resolveMarket = async (marketId: string, winningOption: 'A' | 'B') => {
        if (!currentUser) {
            throw new Error("Ação de administrador requer autenticação.");
        }
        
        // Embora a checagem isAdmin não esteja aqui para evitar complexidade de importação,
        // o front-end deve ter feito a checagem antes de chamar esta função.

        const marketRef = doc(db, 'markets', marketId);
        
        const transacoesCol = collection(db, 'transacoes');
        const q = query(
            transacoesCol, 
            where('marketId', '==', marketId),
            where('option', '==', winningOption)
        );
        
        const transacoesSnap = await getDocs(q); 

        const sharesByUserId = {};
        
        transacoesSnap.docs.forEach(doc => {
            const data = doc.data();
            const userId = data.userId;

            if (!sharesByUserId[userId]) {
                sharesByUserId[userId] = 0;
            }
            
            if (data.type === 'buy') {
                sharesByUserId[userId] += data.shares_bought;
            } else if (data.type === 'sell' && data.option === winningOption) {
                 sharesByUserId[userId] -= data.shares_sold;
            }
        });
        
        const winningUserUpdates = Object.entries(sharesByUserId).filter(([userId, shares]) => shares > 0.01);
        
        if (winningUserUpdates.length === 0) {
            await setDoc(marketRef, { status: 'closed', winning_option: winningOption, resolved_at: Timestamp.now() }, { merge: true });
            return; 
        }

        const payoutPromises = winningUserUpdates.map(([userId, shares]) => {
            const amountToCredit = shares * 1.00;
            const amountCents = Math.round(amountToCredit * 100);
            const userDocRef = doc(db, 'users', userId);

            return runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userCurrentBalanceCents = Math.round(userData.saldo * 100);
                    const newBalanceCents = userCurrentBalanceCents + amountCents;

                    transaction.update(userDocRef, {
                        saldo: newBalanceCents / 100,
                    });
                    
                    const transactionRef = doc(collection(db, 'transacoes_saldo'));
                    transaction.set(transactionRef, {
                        userId: userId,
                        amount: amountToCredit,
                        marketId: marketId,
                        date: Timestamp.now(),
                        type: 'payout',
                        details: `Pagamento pela resolução de mercado: Opção ${winningOption} (${shares.toFixed(2)} ações).`
                    });

                    return amountToCredit;
                }
                return 0;
            });
        });

        await Promise.all(payoutPromises);
        
        await setDoc(marketRef, { status: 'resolved', winning_option: winningOption, resolved_at: Timestamp.now() }, { merge: true });
    };

    const logout = () => {
        setUserData(null);
        return signOut(auth);
    };

    const value: AuthContextType = {
        currentUser,
        userData,
        isLoading,
        isAdmin, // Adicionado ao contexto
        register,
        login,
        logout,
        placeBet,
        sellBet,
        deposit,
        withdraw,
        resolveMarket,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}