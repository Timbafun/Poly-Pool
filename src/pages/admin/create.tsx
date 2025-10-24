"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function CreateMarketPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        option_A: '',
        option_B: '',
        initial_liquidity: 1000,
        resolve_date: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = () => {
        const { title, option_A, option_B, initial_liquidity, resolve_date } = formData;
        return title && option_A && option_B && initial_liquidity > 0 && resolve_date;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            setError('Preencha todos os campos obrigatórios e garanta que a liquidez inicial seja maior que zero.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const initialPrice = 0.5;
            const shares = formData.initial_liquidity / initialPrice;

            const marketData = {
                title: formData.title,
                option_A: formData.option_A,
                option_B: formData.option_B,
                description: formData.description,
                
                initial_liquidity: formData.initial_liquidity,
                total_volume: formData.initial_liquidity,
                
                price_A: initialPrice,
                price_B: initialPrice,
                percentage_A: 50,
                percentage_B: 50,
                
                shares_A: shares,
                shares_B: shares,
                
                resolve_date: new Date(formData.resolve_date),
                resolved_option: null,
                status: 'open',
                
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'markets'), marketData);

            setSuccess('Mercado criado com sucesso!');
            setFormData({
                title: '',
                option_A: '',
                option_B: '',
                initial_liquidity: 1000,
                resolve_date: '',
                description: '',
            });

        } catch (err) {
            console.error(err);
            setError('Erro ao criar o mercado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-8">
            <header className="flex justify-between items-center py-4 border-b border-[var(--border)] mb-8">
                <button onClick={() => router.push('/')} className="text-xl text-[var(--primary)] hover:text-opacity-80 transition-opacity">
                    &larr; Voltar
                </button>
                <h1 className="text-3xl font-extrabold text-[var(--primary)]">
                    Criar Novo Mercado
                </h1>
                <div></div>
            </header>

            <div className="max-w-3xl mx-auto bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-[var(--primary-foreground)] mb-1">Título do Mercado (A Pergunta)</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="option_A" className="block text-sm font-medium text-[var(--primary-foreground)] mb-1">Opção A (Sim)</label>
                            <input
                                type="text"
                                id="option_A"
                                name="option_A"
                                value={formData.option_A}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="option_B" className="block text-sm font-medium text-[var(--primary-foreground)] mb-1">Opção B (Não)</label>
                            <input
                                type="text"
                                id="option_B"
                                name="option_B"
                                value={formData.option_B}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="initial_liquidity" className="block text-sm font-medium text-[var(--primary-foreground)] mb-1">Liquidez Inicial (R$)</label>
                            <input
                                type="number"
                                id="initial_liquidity"
                                name="initial_liquidity"
                                value={formData.initial_liquidity}
                                onChange={handleChange}
                                required
                                min="1"
                                step="any"
                                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                            />
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">Valor inicial para garantir a negociação (min R$ 1).</p>
                        </div>
                        <div>
                            <label htmlFor="resolve_date" className="block text-sm font-medium text-[var(--primary-foreground)] mb-1">Data/Hora de Resolução</label>
                            <input
                                type="datetime-local"
                                id="resolve_date"
                                name="resolve_date"
                                value={formData.resolve_date}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                            />
                        </div>
                    </div>
                    
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-[var(--primary-foreground)] mb-1">Descrição Detalhada (Opcional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                        ></textarea>
                    </div>


                    {error && <p className="p-3 bg-red-800/20 text-red-400 border border-red-400 rounded-lg">{error}</p>}
                    {success && <p className="p-3 bg-green-800/20 text-green-400 border border-green-400 rounded-lg">{success}</p>}

                    <button
                        type="submit"
                        disabled={loading || !isFormValid()}
                        className="w-full py-3 px-4 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-bold hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Criando Mercado...' : 'Criar Mercado'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateMarketPage;