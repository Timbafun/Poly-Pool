"use client";

import React, { useState } from 'react';
import { useAuth } from '../AuthManager';

function BalanceModal({ mode, currentBalance, onClose }) {
    const { deposit, withdraw } = useAuth();
    const [amount, setAmount] = useState(100.00); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const isDeposit = mode === 'deposit';
    const title = isDeposit ? 'Realizar Depósito' : 'Solicitar Saque';
    const actionText = isDeposit ? 'Depositar' : 'Sacar';
    const formatBRL = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (amount <= 0) {
            setError("O valor deve ser positivo.");
            return;
        }
        if (!isDeposit && amount > currentBalance) {
            setError("Saldo insuficiente para o saque.");
            return;
        }

        setIsLoading(true);
        try {
            if (isDeposit) {
                await deposit(amount);
                alert(`Depósito de ${formatBRL(amount)} realizado com sucesso! (Simulado)`);
            } else {
                await withdraw(amount);
                alert(`Saque de ${formatBRL(amount)} solicitado com sucesso! (Simulado)`);
            }
            onClose(); 
        } catch (err) {
            setError(err.message || `Erro ao processar ${actionText.toLowerCase()}. Tente novamente.`);
        } finally {
            setIsLoading(false);
        }
    };

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
                
                <h3 className="text-2xl font-bold mb-4 text-[var(--primary)] text-center">
                    {title}
                </h3>
                
                {error && <p className="bg-[var(--destructive)] text-[var(--destructive-foreground)] p-3 rounded mb-4 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="flex justify-between items-center bg-[var(--input)] p-4 rounded-lg border border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)] font-medium">Seu Saldo Atual:</span>
                        <span className="font-extrabold text-2xl text-[var(--primary)]">{formatBRL(currentBalance)}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                            Valor a {isDeposit ? 'Depositar' : 'Sacar'} (R$)
                        </label>
                        <input 
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={amount.toFixed(2)}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-full p-3 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] text-xl focus:ring-[var(--ring)] focus:border-[var(--ring)] outline-none"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        className={`w-full p-4 rounded-md font-bold transition-colors ${isDeposit ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-[var(--card-foreground)]`}
                        disabled={isLoading || amount <= 0 || (!isDeposit && amount > currentBalance)}
                    >
                        {isLoading ? 'Processando...' : actionText}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BalanceModal;