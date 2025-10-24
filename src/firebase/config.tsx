// /src/firebase/config.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    // CHAVE TEMPORARIAMENTE FIXA PARA ELIMINAR O ERRO
    apiKey: "AIzaSyCWGE5ZNn5ie7DFJ5rwP0YAnsuH-mMsKOA", 
    authDomain: "poolpoly-70baa.firebaseapp.com",
    projectId: "poolpoly-70baa",
    storageBucket: "poolpoly-70baa.firebasestorage.app",
    messagingSenderId: "671174494389",
    appId: "1:671174494389:web:27b9294ca82d5d038856fc",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

export const auth = getAuth(app);