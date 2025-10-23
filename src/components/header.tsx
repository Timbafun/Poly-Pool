import { Search, Menu, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="border-b border-[#2c3e50] bg-[#1f2937]">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm" />
          </div>
          <span className="text-xl font-bold text-white">Poolmarket</span>
          <span className="text-lg">🇺🇸</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search polymarket"
            className="pl-10 bg-[#2c3e50] border-[#3d5266] text-white placeholder:text-gray-500"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-600 bg-[#1f2937] px-1.5 font-mono text-xs text-gray-400">
            /
          </kbd>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-[#2c3e50]">
            <HelpCircle className="h-4 w-4 mr-2" />
            How it works
          </Button>
          <Button variant="ghost" className="text-white hover:bg-[#2c3e50]">
            Log In
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Sign Up
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-[#2c3e50]">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
