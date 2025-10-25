"use client";

import React from 'react';

function BinaryMarketCard({ title, icon, volume, chance }) {
    const isHighChance = chance >= 50;

    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 flex flex-col cursor-pointer">
            
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-[var(--primary)] leading-snug">
                    {title}
                </h3>
                <div className="text-3xl" role="img" aria-label="Icon">
                    {icon}
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 text-sm text-[var(--muted-foreground)]">
                <span>Volume Total: {volume}</span>
                <span>Tipo: Binário (Sim/Não)</span>
            </div>

            <div className="flex items-center space-x-2 mt-auto">
                {/* Opção SIM */}
                <div className={`flex-1 p-3 rounded-lg text-center font-bold transition-colors ${isHighChance ? 'bg-green-600 text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)]'}`}>
                    <span className="block text-xl">{chance}%</span>
                    <span className="text-xs font-normal opacity-80">SIM</span>
                </div>

                {/* Opção NÃO */}
                <div className={`flex-1 p-3 rounded-lg text-center font-bold transition-colors ${!isHighChance ? 'bg-red-600 text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)]'}`}>
                    <span className="block text-xl">{100 - chance}%</span>
                    <span className="text-xs font-normal opacity-80">NÃO</span>
                </div>
            </div>

        </div>
    );
}

export default BinaryMarketCard;