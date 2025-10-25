"use client";

import React from 'react';

// Definição de tipo (simplificada)
interface Market {
    id: string;
    title: string;
    status: 'open' | 'resolved';
    total_volume: number;
}

interface MarketListProps {
    markets: Market[];
}

// Exportação nomeada para corresponder ao import { MarketList } em admin/index.tsx
export function MarketList({ markets }: MarketListProps) {
    if (markets.length === 0) {
        return (
            <div className="text-center p-8 bg-[var(--secondary)] rounded-lg text-[var(--secondary-foreground)]">
                Nenhum mercado encontrado. Crie o primeiro!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Mercados Atuais ({markets.length})</h2>
            {/* ... Lógica de listagem dos mercados ... */}
        </div>
    );
}