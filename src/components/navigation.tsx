"use client";

import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const trendingTabs = ["Trending", "Breaking", "New"];
const categories = [
  "Politics",
  "Sports",
  "Finance",
  "Crypto",
  "Geopolitics",
  "Earnings",
  "Tech",
  "Culture",
  "World",
  "Economy"
];

export function Navigation() {
  const [activeTab, setActiveTab] = useState("Trending");

  return (
    <nav className="border-b border-[#2c3e50] bg-[#1f2937]">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center gap-8">
          {/* Trending Tabs */}
          <div className="flex items-center gap-4 border-r border-[#2c3e50] pr-8">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            {trendingTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-4 text-sm font-medium transition-colors relative",
                  activeTab === tab
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Categories */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                className="py-4 text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
