import { MarketCard } from "./market-card";
import { BinaryMarketCard } from "./binary-market-card";
import { SportsMarketCard } from "./sports-market-card";

export function MarketGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Timeline Market */}
      <MarketCard
        title="When will the Government shutdown end?"
        icon="🏛️"
        volume="$2m Vol."
        options={[
          { label: "October 27-30", percentage: 8 },
          { label: "October 31-Novembe...", percentage: 14 },
        ]}
      />

      {/* Multiple Choice Market */}
      <MarketCard
        title="New York City Mayoral Election"
        icon="🗽"
        volume="$274m Vol."
        options={[
          { label: "Zohran Mamdani", percentage: 92 },
          { label: "Andrew Cuomo", percentage: 7 },
        ]}
      />

      {/* Timeline Market */}
      <MarketCard
        title="US x Venezuela military engagement by...?"
        icon="🇺🇸"
        volume="$5m Vol."
        options={[
          { label: "October 24", percentage: 9 },
          { label: "October 31", percentage: 27 },
        ]}
      />

      {/* Sports Market */}
      <MarketCard
        title="World Series Champion 2025"
        icon="⚾"
        volume="$71m Vol."
        options={[
          { label: "Los Angeles Dodgers", percentage: 69 },
          { label: "Toronto Blue Jays", percentage: 32 },
        ]}
      />

      {/* Sports Head to Head */}
      <SportsMarketCard
        team1={{ name: "Vikings", logo: "🏈", percentage: 39 }}
        team2={{ name: "Chargers", logo: "⚡", percentage: 62 }}
        volume="$2m Vol."
        league="NFL"
        time="Tomorrow 12:15 AM"
      />

      {/* Fed Decision Market */}
      <MarketCard
        title="Fed decision in October?"
        icon="💵"
        volume="$116m Vol."
        options={[
          { label: "50+ bps decrease", percentage: 2 },
          { label: "25 bps decrease", percentage: 96 },
        ]}
      />

      {/* Binary Market with Chance */}
      <BinaryMarketCard
        title="Will Trump meet with Putin again by...?"
        icon="🤝"
        volume="$4m Vol."
        options={[
          { label: "October 31", percentage: 1 },
          { label: "November 30", percentage: 20 },
        ]}
      />

      {/* Government Shutdown */}
      <MarketCard
        title="Will the Government shutdown end by...?"
        icon="🏛️"
        volume="$345k Vol."
        options={[
          { label: "October 31", percentage: 16 },
          { label: "November 15", percentage: 62 },
        ]}
      />

      {/* Synthetix Competition */}
      <MarketCard
        title="Who will win the Synthetix trading competition?"
        icon="📊"
        volume="$39k Vol."
        options={[
          { label: "贝无妄 Web3Feng", percentage: 45 },
          { label: "Keyboard Monkey", percentage: 7 },
        ]}
      />

      {/* Binary Chance Card */}
      <BinaryMarketCard
        title="Maduro out in 2025?"
        icon="🇻🇪"
        volume="$4m Vol."
        chance={23}
      />

      {/* Russia Ukraine */}
      <BinaryMarketCard
        title="Russia x Ukraine ceasefire in 2025?"
        icon="🕊️"
        volume="$24m Vol."
        chance={13}
      />

      {/* Trump Xi Meeting */}
      <BinaryMarketCard
        title="Will Trump meet with Xi Jinping by October 31?"
        icon="🤝"
        volume="$3m Vol."
        chance={92}
      />

      {/* Trump Pardon */}
      <MarketCard
        title="Who will Trump pardon in 2025?"
        icon="⚖️"
        volume="$6m Vol."
        options={[
          { label: "Roger Ver", percentage: 15 },
          { label: "Diddy", percentage: 14 },
        ]}
      />

      {/* Monad Airdrop */}
      <MarketCard
        title="Monad airdrop by...?"
        icon="🪂"
        volume="$12m Vol."
        options={[
          { label: "November 15", percentage: 12 },
          { label: "November 30", percentage: 89 },
        ]}
      />

      {/* Ireland Election */}
      <MarketCard
        title="Ireland Presidential Election"
        icon="🇮🇪"
        volume="$135m Vol."
        options={[
          { label: "Catherine Connolly", percentage: 96 },
          { label: "Heather Humphreys", percentage: 4 },
        ]}
      />

      {/* More markets... */}
      <MarketCard
        title="Ethereum price on October 23?"
        icon="💎"
        volume="$1m Vol."
        options={[
          { label: "<3,500", percentage: 1, variant: "small" },
          { label: "3,500-3,600", percentage: 1, variant: "small" },
        ]}
      />

      <MarketCard
        title="Republican Presidential Nominee 2028"
        icon="🐘"
        volume="$59m Vol."
        options={[
          { label: "J.D. Vance", percentage: 54 },
          { label: "Marco Rubio", percentage: 7 },
        ]}
      />

      <MarketCard
        title="Presidential Election Winner 2028"
        icon="🏛️"
        volume="$88m Vol."
        options={[
          { label: "JD Vance", percentage: 29 },
          { label: "Gavin Newsom", percentage: 23 },
        ]}
      />
    </div>
  );
}
