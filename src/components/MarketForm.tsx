"use client";

import React, { useState } from 'react';
// import { collection, addDoc } from 'firebase/firestore'; // Importação real do Firestore

function MarketForm({ onClose, db }) {
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('open');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        // Lógica de criação de mercado aqui. Exemplo:
        /*
        try {
            await addDoc(collection(db, "markets"), { title, status, ... });
            console.log("Novo Mercado Criado!");
        } catch (error) {
            console.error("Erro ao criar mercado:", error);
        }
        */
        
        console.log("Novo Mercado Criado (simulação):", { title, status });

        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--card)] rounded-xl shadow-2xl w-full max-w-xl p-6 relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-2xl"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 text-[var(--primary)]">Criar Novo Mercado</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campos do formulário... */}
                    <button 
                        type="submit"
                        className="w-full p-3 rounded-md bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Criando...' : 'Confirmar Criação'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MarketForm;