"use client";

import React, { useState } from 'react';
import TradeModal from '@/components/TradeModal'; 
import { useAuth } from '@/components/AuthManager';
import { useRouter } from 'next/navigation';

interface Market {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'resolved';
    total_volume: number;
    price_A: number;
    price_B: number;
    percentage_A: number;
    percentage_B: number;
    type: 'binary' | 'sports';
}

interface MarketCardProps {
    market: Market;
}

const MarketCard = ({ market }: MarketCardProps) => {
    // Adiciona verificação para corrigir o erro "Cannot read properties of undefined"
    if (!market) {
        return null; 
    }
    
    const [isTradeModalOpen, setIsTradeModal] = useState(false);
    const { userData } = useAuth();
    const router = useRouter();
    
    const displayPercentage = (percentage: number) => {
        if (isNaN(percentage) || percentage === undefined || percentage === null || market.total_volume === 0) {
            return '--%'; 
        }
        return `${Math.round(percentage)}%`;
    };

    const handleTrade = (option: 'A' | 'B') => {
        if (!userData) {
            router.push('/login');
            return;
        }
        setIsTradeModalOpen(true);
    };

    const percentageA = market.percentage_A || 50;
    const percentageB = market.percentage_B || 50;

    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-4 flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{market.title}</h3>
            
            <div className="text-sm text-[var(--muted-foreground)]">
                Volume Total: ${market.total_volume ? (market.total_volume / 1000000).toFixed(1) + 'M' : '0M'} Vol.
            </div>

            <div className="flex justify-between items-center space-x-2">
                
                <button 
                    onClick={() => handleTrade('A')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
                >
                    <span className="block text-2xl font-extrabold">{displayPercentage(percentageA)}</span>
                    <span className="block text-sm mt-1">SIM / Opção A</span>
                </button>

                <button 
                    onClick={() => handleTrade('B')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
                >
                    <span className="block text-2xl font-extrabold">{displayPercentage(percentageB)}</span>
                    <span className="block text-sm mt-1">NÃO / Opção B</span>
                </button>
            </div>

            <TradeModal 
                isOpen={isTradeModalOpen} 
                onClose={() => setIsTradeModalOpen(false)} 
                market={market} 
            />
        </div>
    );
};

export default MarketCard;