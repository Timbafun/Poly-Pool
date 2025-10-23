import React from 'react';
import { Button } from "@/components/ui/button";

interface SportsMarketCardProps {
    team1: { name: string, logo: string, percentage: number };
    team2: { name: string, logo: string, percentage: number };
    volume: string;
    league: string;
    time: string;
}

export function SportsMarketCard({ team1, team2, volume, league, time }: SportsMarketCardProps) {
    return (
        <div className="bg-[#1c2834] border border-[#3d5266] rounded-xl p-6 shadow-xl">
            <div className="text-sm text-gray-400 mb-2">{league} - {time}</div>
            <h3 className="text-white text-lg font-semibold mb-4">
                {team1.logo} {team1.name} vs. {team2.logo} {team2.name}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="bg-[#2c3e50] border-[#3d5266] text-white hover:bg-[#3d5266]">
                    {team1.name} ({team1.percentage}%)
                </Button>
                <Button variant="outline" className="bg-[#2c3e50] border-[#3d5266] text-white hover:bg-[#3d5266]">
                    {team2.name} ({team2.percentage}%)
                </Button>
            </div>
            
            <div className="text-xs text-gray-400 mt-3">{volume}</div>
        </div>
    );
}