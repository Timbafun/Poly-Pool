import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWGE5ZNn5ie7DFJ5rwP0YAnsuH-mMsKOA",
  authDomain: "poolpoly-70baa.firebaseapp.com",
  projectId: "poolpoly-70baa",
  storageBucket: "poolpoly-70baa.firebasestorage.app",
  messagingSenderId: "671174494389",
  appId: "1:671174494389:web:27b9294ca82d5d038856fc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); 
    const [userData, setUserData] = useState(null);     
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserData = useCallback(async (uid) => {
        try {
            const userDocRef = doc(db, "usuarios", uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            } else {
                setUserData({ saldo: 0.00, nome_completo: 'Usuário', telefone: 'N/A', cpf: 'N/A' });
            }
        } catch (e) {
            console.error("Erro ao buscar dados do usuário:", e);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchUserData(user.uid);
            } else {
                setCurrentUser(null);
                setUserData(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe(); 
    }, [fetchUserData]);

    const register = async (email, password, nome, cpf, telefone) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "usuarios", user.uid), {
                userId: user.uid,
                nome_completo: nome,
                cpf: cpf,
                email: email,
                telefone: telefone,
                data_cadastro: serverTimestamp(),
                saldo: 0.00,
                moeda: 'BRL',
                status_conta: 'Ativa'
            });
            return user;
        } catch (error) {
            throw error; 
        }
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return firebaseSignOut(auth);
    };

    const value = {
        currentUser,
        userData,
        isLoading,
        register,
        login,
        logout,
        db 
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};