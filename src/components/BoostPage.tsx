import { useState } from "react";

interface BoostCard {
  title: string;
  icon: string;
  status: string;
  statusColor: string;
  buttonLabel: string;
  description: string;
  hasConfig?: boolean;
}

const boostCards: BoostCard[] = [
  {
    title: "Game Boost",
    icon: "🎮",
    status: "OFF",
    statusColor: "text-gray-400",
    buttonLabel: "Super Boost",
    description: "Boost PC for a better gaming experience by stopping unnecessary services and optimizing system settings.",
    hasConfig: true,
  },
  {
    title: "Internet Boost",
    icon: "🌐",
    status: "Ready",
    statusColor: "text-green-400",
    buttonLabel: "Boost Now",
    description: "Optimize internet settings to improve download speed and reduce latency for a smoother online experience.",
  },
  {
    title: "System Optimize",
    icon: "⚡",
    status: "Not Checked",
    statusColor: "text-yellow-400",
    buttonLabel: "Check Now",
    description: "Analyze system performance and clean up junk files, invalid registry entries, and startup items.",
  },
];

export function BoostPage() {
  const [states, setStates] = useState<Record<string, string>>({
    "Game Boost": "OFF",
    "Internet Boost": "Ready",
    "System Optimize": "Not Checked",
  });

  const handleAction = (title: string) => {
    setStates(prev => ({
      ...prev,
      [title]: prev[title] === "OFF" ? "ON" : prev[title] === "Ready" ? "Boosted ✓" : "Optimized ✓",
    }));
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-lg font-semibold text-gray-200 mb-5">Performance Boost</h2>
      <div className="grid grid-cols-3 gap-4">
        {boostCards.map(card => {
          const currentStatus = states[card.title] || card.status;
          const isActive = currentStatus === "ON" || currentStatus === "Boosted ✓" || currentStatus === "Optimized ✓";
          return (
            <div key={card.title} className="rounded-lg p-5 flex flex-col items-center text-center gap-4 border border-border transition-colors hover:border-gray-600"
              style={{ background: "hsl(220 14% 15%)" }}>
              {/* Gauge area */}
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(220 12% 22%)" strokeWidth="5" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={isActive ? "hsl(140 60% 45%)" : "hsl(220 12% 30%)"}
                    strokeWidth="5" strokeDasharray={264} strokeDashoffset={isActive ? 0 : 180}
                    strokeLinecap="round" className="transition-all duration-700 -rotate-90 origin-center" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-3xl">{card.icon}</div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-200">{card.title}</h3>
                <span className={`text-xs ${isActive ? "text-green-400" : card.statusColor}`}>{currentStatus}</span>
                {card.hasConfig && (
                  <button className="block text-[10px] text-blue-400 hover:underline mx-auto mt-1">Configure</button>
                )}
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed">{card.description}</p>

              <button
                onClick={() => handleAction(card.title)}
                className={`mt-auto px-5 py-2 rounded text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {isActive ? "Active" : card.buttonLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
