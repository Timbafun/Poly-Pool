"use client";

import React, { useState } from 'react';
import { useAuth } from '../AuthManager';

function TradeModal({ market, option, price, onClose, currentBalance, maxShares }) {
    const { placeBet, sellBet } = useAuth();
    const [mode, setMode] = useState('buy');
    const [amount, setAmount] = useState(10.00);
    const [shares, setShares] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const optionText = market[`option_${option}`];
    
    const calculatedShares = mode === 'buy' ? amount / price : shares;
    const calculatedAmountValue = mode === 'sell' ? shares * price : amount;

    const formatBRL = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsSuccess(false);
        
        if (mode === 'buy') {
            if (amount <= 0 || amount > currentBalance) {
                setMessage(amount <= 0 ? "O valor deve ser positivo." : "Saldo insuficiente.");
                return;
            }
        } else {
            if (shares <= 0 || shares > maxShares) {
                setMessage(shares <= 0 ? "O número de ações deve ser positivo." : `Você só possui ${maxShares.toFixed(2)} ações.`);
                return;
            }
        }

        setIsLoading(true);
        try {
            if (mode === 'buy') {
                await placeBet(market.id, option, amount, price);
                setMessage(`Compra de ${formatBRL(amount)} em "${optionText}" realizada com sucesso!`);
            } else {
                await sellBet(market.id, option, shares, price);
                setMessage(`Venda de ${shares.toFixed(2)} ações por ${formatBRL(calculatedAmountValue)} realizada com sucesso!`);
            }
            setIsSuccess(true);
            setTimeout(onClose, 1500);
        } catch (err) {
            setMessage(err.message || "Erro ao processar a negociação. Tente novamente.");
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
                    Negociar Ações: {optionText}
                </h3>
                <p className="text-[var(--foreground)] mb-4">{market.title}</p>
                
                <div className="flex mb-4 p-1 bg-[var(--background)] rounded-lg">
                    <button
                        onClick={() => { setMode('buy'); setMessage(null); setIsSuccess(false); }}
                        className={`flex-1 p-2 rounded-md font-semibold transition-colors ${mode === 'buy' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
                        disabled={isLoading}
                    >
                        Comprar
                    </button>
                    <button
                        onClick={() => { setMode('sell'); setMessage(null); setIsSuccess(false); }}
                        className={`flex-1 p-2 rounded-md font-semibold transition-colors ${mode === 'sell' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
                        disabled={isLoading || maxShares <= 0}
                    >
                        Vender
                    </button>
                </div>
                
                {message && (
                    <p className={`p-3 rounded mb-4 text-sm text-center ${isSuccess ? 'bg-green-600 text-white' : 'bg-[var(--destructive)] text-[var(--destructive-foreground)]'}`}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="flex justify-between items-center bg-[var(--input)] p-3 rounded-lg border border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Seu Saldo:</span>
                        <span className="font-bold text-lg text-[var(--primary)]">{formatBRL(currentBalance)}</span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded-lg bg-[var(--secondary)]">
                        <span className="text-[var(--secondary-foreground)]">Preço Atual por Ação:</span>
                        <span className="font-extrabold text-xl text-[var(--secondary-foreground)]">{formatBRL(price)}</span>
                    </div>

                    {mode === 'buy' ? (
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
                    ) : (
                             <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                                    Quantidade de Ações a Vender (Máx: {maxShares.toFixed(2)})
                                </label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={maxShares.toFixed(2)}
                                    value={shares.toFixed(2)}
                                    onChange={(e) => setShares(parseFloat(e.target.value) || 0)}
                                    className="w-full p-3 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:ring-[var(--ring)] focus:border-[var(--ring)] outline-none"
                                    disabled={isLoading}
                                />
                            </div>
                    )}
                    
                    <div className="p-3 bg-[var(--background)] rounded-lg text-[var(--foreground)]">
                        <p className="text-sm">
                            {mode === 'buy' ? 'Você receberá aproximadamente:' : 'Você receberá (R$) aproximadamente:'}
                        </p>
                        <p className="font-bold text-2xl text-[var(--primary)] mt-1">
                            {mode === 'buy' ? `${calculatedShares.toFixed(2)} ações` : formatBRL(calculatedAmountValue)}
                        </p>
                    </div>

                    <button 
                        type="submit"
                        className="w-full p-3 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] font-bold hover:opacity-90 transition-opacity"
                        disabled={isLoading || (mode === 'buy' && amount <= 0) || (mode === 'sell' && shares <= 0)}
                    >
                        {isLoading ? 'Processando...' : mode === 'buy' ? `Confirmar Compra de ${formatBRL(amount)}` : `Confirmar Venda por ${formatBRL(calculatedAmountValue)}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TradeModal;