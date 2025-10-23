import { Button } from "@/components/ui/button";
import { RepeatIcon, Share2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketOption {
  label: string;
  percentage: number;
  variant?: "small";
}

interface MarketCardProps {
  title: string;
  icon: string;
  volume: string;
  options: MarketOption[];
}

export function MarketCard({ title, icon, volume, options }: MarketCardProps) {
  return (
    <div className="bg-[#2c3e50] rounded-xl p-4 hover:bg-[#334155] transition-colors cursor-pointer border border-[#3d5266]">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">{icon}</div>
        <h3 className="text-white font-medium text-sm flex-1 leading-tight">{title}</h3>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {options.map((option, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-gray-300">{option.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{option.percentage}%</span>
              <Button
                size="sm"
                className={cn(
                  "h-6 px-3 text-xs",
                  option.percentage > 50
                    ? "bg-green-700/80 hover:bg-green-700 text-white"
                    : "bg-gray-600/50 hover:bg-gray-600 text-gray-300"
                )}
              >
                Yes
              </Button>
              <Button
                size="sm"
                className={cn(
                  "h-6 px-3 text-xs",
                  option.percentage < 50
                    ? "bg-red-700/80 hover:bg-red-700 text-white"
                    : "bg-gray-600/50 hover:bg-gray-600 text-gray-300"
                )}
              >
                No
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#3d5266]">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          {volume}
          <RepeatIcon className="h-3 w-3" />
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-white hover:bg-[#3d5266]"
          >
            <Share2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-white hover:bg-[#3d5266]"
          >
            <Bookmark className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
