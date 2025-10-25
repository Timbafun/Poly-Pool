import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Chave de API atualizada
const firebaseConfig = {
    apiKey: "AIzaSyCWGE5ZNn5ie7DFJ5rwP0YAnsuH-mMsKOA",
    authDomain: "poolpoly-70baa.firebaseapp.com",
    projectId: "poolpoly-70baa",
    storageBucket: "poolpoly-70baa.appspot.com",
    messagingSenderId: "671174494389",
    appId: "1:671174494389:web:27b9294ca82d5d038856fc",
};

// Verificação de inicialização: Se já existir um app, use-o; senão, inicialize.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };