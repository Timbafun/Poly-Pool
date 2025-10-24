import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { FilterTabs } from "@/components/filter-tabs";
import { MarketGrid } from "@/components/market-grid";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1a2533]">
      <Header />
      <Navigation />
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <FilterTabs />
        <MarketGrid />
      </div>
    </div>
  );
}
