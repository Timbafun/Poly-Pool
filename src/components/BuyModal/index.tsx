"use client";

import React, { useState } from 'react';
import { useAuth } from '../AuthManager';

function BuyModal({ market, option, price, onClose, currentBalance }) {
    const { placeBet } = useAuth();
    const [amount, setAmount] = useState(10.00);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const optionText = market[`option_${option}`];
    
    const shares = amount / price;
    
    const formatBRL = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (amount <= 0 || amount > currentBalance) {
            setError(amount <= 0 ? "O valor da aposta deve ser positivo." : "Saldo insuficiente para esta aposta.");
            return;
        }

        setIsLoading(true);
        try {
            await placeBet(market.id, option, amount, price);
            alert(`Aposta de ${formatBRL(amount)} em "${optionText}" realizada com sucesso!`);
            onClose(); 
        } catch (err) {
            setError(err.message || "Erro ao processar a aposta. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!market) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--card)] rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-2xl"
                    disabled={isLoading}
                >
                    &times;
                </button>
                
                <h3 className="text-xl font-bold mb-2 text-[var(--primary)]">
                    Comprar Ações: {optionText}
                </h3>
                <p className="text-[var(--foreground)] mb-4">{market.title}</p>
                
                {error && <p className="bg-[var(--destructive)] text-[var(--destructive-foreground)] p-3 rounded mb-4 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="flex justify-between items-center bg-[var(--input)] p-3 rounded-lg border border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Seu Saldo:</span>
                        <span className="font-bold text-lg text-[var(--primary)]">{formatBRL(currentBalance)}</span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded-lg bg-[var(--secondary)]">
                        <span className="text-[var(--secondary-foreground)]">Preço Atual por Ação:</span>
                        <span className="font-extrabold text-xl text-[var(--secondary-foreground)]">{formatBRL(price)}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                            Valor a Apostar (R$)
                        </label>
                        <input 
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={amount.toFixed(2)}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-full p-3 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:ring-[var(--ring)] focus:border-[var(--ring)] outline-none"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="p-3 bg-[var(--background)] rounded-lg text-[var(--foreground)]">
                        <p className="text-sm">Você receberá aproximadamente:</p>
                        <p className="font-bold text-2xl text-[var(--primary)] mt-1">
                            {shares.toFixed(2)} ações
                        </p>
                    </div>

                    <button 
                        type="submit"
                        className="w-full p-3 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] font-bold hover:opacity-90 transition-opacity"
                        disabled={isLoading || amount <= 0 || amount > currentBalance}
                    >
                        {isLoading ? 'Processando...' : `Confirmar Compra de ${formatBRL(amount)}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BuyModal;