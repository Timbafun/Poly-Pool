"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 1. Configuração do Firebase (Substitua pelos seus dados)
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
const auth = getAuth(app);
const db = getFirestore(app);

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async (user) => {
        if (user) {
            try {
                const docRef = doc(db, 'usuarios', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                } else {
                    setUserData({}); 
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
                setUserData({});
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

    const register = async (email, password, nome_completo, cpf, telefone) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const data = {
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

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        setUserData(null);
        return signOut(auth);
    };

    const value = {
        currentUser,
        userData,
        isLoading,
        register,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}