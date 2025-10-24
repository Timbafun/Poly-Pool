"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
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
import { getFirestore, doc, setDoc, getDoc, DocumentData, runTransaction, collection, Timestamp } from 'firebase/firestore';

const USER_COLLECTION_NAME = 'users';

interface UserData extends DocumentData {
    nome_completo: string;
    cpf: string;
    telefone: string;
    email: string;
    saldo: number;
    data_cadastro: string;
}

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userData: UserData | null;
    isLoading: boolean;
    register: (email: string, password: string, nome_completo: string, cpf: string, telefone: string) => Promise<void>;
    login: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
    placeBet: (marketId: string, option: 'A' | 'B', amount: number, price: number) => Promise<void>;
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db = getFirestore(app);

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

    const fetchData = useCallback(async (user: FirebaseUser | null) => {
        if (user) {
            try {
                const docRef = doc(db, USER_COLLECTION_NAME, user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data() as UserData);
                } else {
                    setUserData(null);
                    console.warn(`Dados de usuário não encontrados para o UID: ${user.uid}.`);
                }
            } catch (error) {
                console.error("Erro CRÍTICO ao buscar dados do usuário (Permissão/Token):", error);
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
            };

            await setDoc(doc(db, USER_COLLECTION_NAME, user.uid), data);
            
            setUserData(data); 
            setCurrentUser(user);

        } catch (error) {
            console.error("Erro CRÍTICO durante o registro (setDoc falhou):", error);
            if (user) {
                try {
                    await deleteUser(user);
                } catch (deleteError) {
                    console.error("Erro ao deletar usuário após falha do Firestore:", deleteError);
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

    const logout = () => {
        setUserData(null);
        return signOut(auth);
    };

    const value: AuthContextType = {
        currentUser,
        userData,
        isLoading,
        register,
        login,
        logout,
        placeBet,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}