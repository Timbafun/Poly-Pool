"use client";

import React, { useState } from 'react';
import BuyModal from '../BuyModal'; 
import { useAuth } from '../AuthManager'; 
import { useRouter } from 'next/router'; // Importar o Router

function MarketCard({ market }) {
    const { userData } = useAuth();
    const router = useRouter(); 
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

    const handleCardClick = () => {
        // Redireciona para a página de detalhes do mercado
        router.push(`/market/${market.id}`);
    };

    // Ação de compra é chamada ao clicar nos botões 'Sim'/'Não'
    const handleBuyClick = (option, price, event) => {
        event.stopPropagation(); // Evita que o clique do botão acione o clique do Card
        if (!isMarketOpen) return;
        
        setSelectedOption(option);
        setSelectedPrice(price);
        setIsModalOpen(true);
    };

    const currentBalance = userData?.saldo || 0;

    return (
        <>
            {/* Adicionando onClick no div principal para navegação */}
            <div 
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 flex flex-col cursor-pointer"
                onClick={handleCardClick} 
            >
                
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
                            // Passando o evento para evitar a navegação
                            onClick={(e) => handleBuyClick('A', market.price_A, e)} 
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
                            // Passando o evento para evitar a navegação
                            onClick={(e) => handleBuyClick('B', market.price_B, e)}
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