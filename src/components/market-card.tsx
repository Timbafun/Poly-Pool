"use client";

import React, { useState } from 'react';
import BuyModal from '../BuyModal'; 
import { useAuth } from '../AuthManager'; 

function MarketCard({ market }) {
    const { userData } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null); 
    const [selectedPrice, setSelectedPrice] = useState(0); 

    const isMarketOpen = market.status === 'open';

    const getPriceColor = (percentage) => {
        if (percentage >= 70) return 'bg-green-600';
        if (percentage >= 50) return 'bg-yellow-600';
        return 'bg-red-600';
    };
    
    const formatVolume = (volume) => `R$ ${volume.toFixed(2).replace('.', ',')}`;

    const handleBuyClick = (option, price) => {
        if (!isMarketOpen) return;
        
        setSelectedOption(option);
        setSelectedPrice(price);
        setIsModalOpen(true);
    };

    const currentBalance = userData?.saldo || 0;

    return (
        <>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 flex flex-col">
                
                <h3 className="text-lg font-semibold text-[var(--primary)] mb-3 leading-snug">
                    {market.title}
                </h3>

                <div className="flex justify-between items-end mb-4 text-sm">
                    <div className="text-[var(--foreground)] opacity-70">
                        Volume Total: {formatVolume(market.total_volume)}
                    </div>
                    <div className="text-[var(--muted-foreground)]">
                        Encerra: {new Date(market.resolution_date).toLocaleDateString('pt-BR')}
                    </div>
                </div>

                <div className="space-y-3">
                    
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => handleBuyClick('A', market.price_A)}
                            className={`flex-grow p-3 rounded-lg text-[var(--card-foreground)] font-bold text-left ${getPriceColor(market.percentage_A)} transition-colors`}
                            disabled={!isMarketOpen}
                        >
                            {market.option_A} 
                        </button>
                        <div className="w-16 text-right font-extrabold text-xl text-[var(--primary-foreground)]">
                            {market.percentage_A}%
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => handleBuyClick('B', market.price_B)}
                            className={`flex-grow p-3 rounded-lg text-[var(--card-foreground)] font-bold text-left ${getPriceColor(market.percentage_B)} transition-colors`}
                            disabled={!isMarketOpen}
                        >
                            {market.option_B} 
                        </button>
                        <div className="w-16 text-right font-extrabold text-xl text-[var(--primary-foreground)]">
                            {market.percentage_B}%
                        </div>
                    </div>
                </div>
                
                {!isMarketOpen && (
                    <div className="mt-4 text-center text-sm font-medium text-[var(--muted-foreground)]">
                        Mercado Fechado
                    </div>
                )}
            </div>
            
            {isModalOpen && selectedOption && (
                <BuyModal 
                    market={market}
                    option={selectedOption}
                    price={selectedPrice}
                    currentBalance={currentBalance}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}

export default MarketCard;