import React from 'react';
import { Button } from "@/components/ui/button";

interface BinaryMarketCardProps {
  title?: string;
  icon?: string;
  volume?: string;
  chance?: number;
  options?: { label: string; percentage: number }[];
}

export function BinaryMarketCard({ title = "Mercado Binário", icon = "❓", volume = "$0 Vol.", chance = 50 }: BinaryMarketCardProps) {
  const yesPercentage = chance;
  const noPercentage = 100 - chance;

  return (
    <div className="bg-[#1c2834] border border-[#3d5266] rounded-xl p-6 shadow-xl flex flex-col justify-between h-full">
      <div className="text-xl mb-2">{icon}</div>
      <h3 className="text-white text-lg font-semibold mb-4 min-h-[50px] line-clamp-2">
        {title}
      </h3>
      
      <div className="flex w-full mb-3 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: `${yesPercentage}%` }} />
          <div className="h-full bg-red-500" style={{ width: `${noPercentage}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg">
          Sim ({yesPercentage}%)
        </Button>
        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg">
          Não ({noPercentage}%)
        </Button>
      </div>
      
      <div className="text-xs text-gray-400 mt-3 flex justify-between">
          <span>{volume}</span>
          <span>Aposta Agora</span>
      </div>
    </div>
  );
}