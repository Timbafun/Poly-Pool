"use client";

import React from 'react';

function SportsMarketCard({ team1, team2, volume, league, time }) {
    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4 flex flex-col cursor-pointer">
            
            <div className="text-xs font-medium text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                {league} - {time}
            </div>

            <h3 className="text-xl font-bold text-[var(--primary)] mb-4 leading-tight">
                {team1.name} vs {team2.name}
            </h3>

            <div className="flex items-center space-x-4 mb-4">
                
                {/* Time 1 */}
                <div className="flex-1 text-center">
                    <div className="text-5xl mb-1" role="img" aria-label={team1.name}>
                        {team1.logo}
                    </div>
                    <p className="font-semibold text-lg text-[var(--foreground)]">{team1.name}</p>
                    <p className={`font-extrabold text-2xl mt-1 ${team1.percentage > team2.percentage ? 'text-green-500' : 'text-[var(--muted-foreground)]'}`}>
                        {team1.percentage}%
                    </p>
                </div>

                <div className="text-xl font-bold text-[var(--muted-foreground)]">
                    VS
                </div>

                {/* Time 2 */}
                <div className="flex-1 text-center">
                    <div className="text-5xl mb-1" role="img" aria-label={team2.name}>
                        {team2.logo}
                    </div>
                    <p className="font-semibold text-lg text-[var(--foreground)]">{team2.name}</p>
                    <p className={`font-extrabold text-2xl mt-1 ${team2.percentage > team1.percentage ? 'text-green-500' : 'text-[var(--muted-foreground)]'}`}>
                        {team2.percentage}%
                    </p>
                </div>
            </div>

            <div className="text-sm text-[var(--muted-foreground)] text-center mt-auto p-2 bg-[var(--background)] rounded">
                Volume Total: {volume}
            </div>
        </div>
    );
}

export default SportsMarketCard;