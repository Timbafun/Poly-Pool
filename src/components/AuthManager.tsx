"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    Auth,
    UserCredential, // Importação adicionada para tipagem de login
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, DocumentData } from 'firebase/firestore'; // Importação DocumentData

// Definições de Tipos (TypeScript)
// Substituímos [key: string]: any; por [key: string]: unknown; para satisfazer o linter
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
    login: (email: string, password: string) => Promise<UserCredential>; // Tipo de retorno corrigido
    logout: () => Promise<void>;
}

// 1. Configuração do Firebase
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar
const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db = getFirestore(app);

// Inicialização do Contexto
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
                const docRef = doc(db, 'usuarios', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data() as UserData);
                } else {
                    setUserData(null);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
                setUserData(null);
            }
        } else {
            setUserData(null);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            await fetchData(user);
            setIsLoading(false);
        });

        return unsubscribe;
    }, [fetchData]);

    const register = async (email: string, password: string, nome_completo: string, cpf: string, telefone: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const data: UserData = {
            nome_completo,
            cpf,
            telefone,
            email,
            saldo: 0.00,
            data_cadastro: new Date().toISOString(),
        };

        await setDoc(doc(db, 'usuarios', user.uid), data);
        setUserData(data);
    };

    const login = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
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
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}