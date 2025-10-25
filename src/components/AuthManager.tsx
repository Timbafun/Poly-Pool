"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, DocumentData } from 'firebase/firestore';

// Correção do caminho de importação para o seu config.tsx
import { auth, db } from '@/lib/firebase/config'; 

const USER_COLLECTION_NAME = 'users';

interface UserData extends DocumentData {
    isAdmin: boolean;
    saldo: number;
    email: string;
}

interface AuthContextType {
    currentUser: User | null;
    userData: UserData | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    register: (email: string, password: string, displayName: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (user: User) => {
        try {
            const userDocRef = doc(db, USER_COLLECTION_NAME, user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data() as UserData;
                setUserData(data);
            } else {
                // Caso o documento do Firestore não exista (usuário criado via console, por exemplo)
                console.warn("Documento de usuário não encontrado no Firestore.");
                setUserData({ isAdmin: false, saldo: 0, email: user.email || '' } as UserData);
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            setUserData(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                fetchUserData(user);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await fetchUserData(userCredential.user);
            return userCredential;
        } catch (error) {
            // Lança o erro para ser tratado no componente de Login (UI)
            throw error; 
        }
    };

    const register = async (email: string, password: string, displayName: string) => {
        try {
            // 1. Cria o usuário no Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Salva dados adicionais no Firestore
            const userDataToStore = {
                email: user.email,
                nome_completo: displayName,
                isAdmin: false,
                saldo: 0,
                data_cadastro: new Date().toISOString(),
            };
            
            const userDocRef = doc(db, USER_COLLECTION_NAME, user.uid);
            await setDoc(userDocRef, userDataToStore);

            setUserData(userDataToStore as UserData);
            return userCredential;
        } catch (error) {
            // Lança o erro para ser tratado no componente de Cadastro (UI)
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUserData(null);
    };

    const value: AuthContextType = {
        currentUser,
        userData,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};