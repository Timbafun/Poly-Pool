"use client";

import { Search, SlidersHorizontal, Bookmark, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

const filters = [
  "All",
  "Trump",
  "Gov Shutdown",
  "Venezuela",
  "Global Elections",
  "NYC Mayor",
  "Gaza"
];

export function FilterTabs() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        {/* Search */}
        <div className="flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-10 bg-[#2c3e50] border-[#3d5266] text-white placeholder:text-gray-500"
          />
        </div>

        {/* Filter & Bookmark Buttons */}
        <Button variant="outline" size="icon" className="bg-[#2c3e50] border-[#3d5266] text-white hover:bg-[#3d5266]">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-[#2c3e50] border-[#3d5266] text-white hover:bg-[#3d5266]">
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              activeFilter === filter
                ? "bg-blue-600 text-white"
                : "bg-[#2c3e50] text-gray-300 hover:bg-[#3d5266]"
            )}
          >
            {filter}
          </button>
        ))}
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
