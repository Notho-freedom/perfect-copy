import { useState } from "react";

export function BoostPage() {
  const [gameBoostOn, setGameBoostOn] = useState(false);

  const cards = [
    {
      title: "Game Boost",
      desc: "Install Smart Game Booster to overclock hardware to improve game performance up to 130%.",
      gauge: (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx="60" cy="60" r="55" fill="none" stroke="hsl(220 10% 20%)" strokeWidth="2" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="hsl(220 10% 18%)" strokeWidth="1" />
          <path d="M 20 85 A 45 45 0 1 1 100 85" fill="none" stroke="hsl(220 12% 22%)" strokeWidth="4" strokeLinecap="round" />
          <path d="M 20 85 A 45 45 0 1 1 100 85" fill="none"
            stroke={gameBoostOn ? "hsl(140 60% 45%)" : "hsl(220 12% 30%)"}
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray="220" strokeDashoffset={gameBoostOn ? 0 : 180}
            className="transition-all duration-700"
          />
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = -210 + (i / 19) * 240;
            const rad = (angle * Math.PI) / 180;
            return (
              <line key={i} x1={60 + 42 * Math.cos(rad)} y1={60 + 42 * Math.sin(rad)}
                x2={60 + 46 * Math.cos(rad)} y2={60 + 46 * Math.sin(rad)}
                stroke="hsl(0 0% 35%)" strokeWidth="1" />
            );
          })}
          {(() => {
            const rad = ((gameBoostOn ? 30 : -210) * Math.PI) / 180;
            return <line x1="60" y1="60" x2={60 + 30 * Math.cos(rad)} y2={60 + 30 * Math.sin(rad)}
              stroke="white" strokeWidth="2" strokeLinecap="round" className="transition-all duration-700" />;
          })()}
          <circle cx="60" cy="60" r="4" fill="hsl(0 0% 50%)" />
          <circle cx="60" cy="60" r="2" fill="white" />
        </svg>
      ),
      status: gameBoostOn ? "ON" : "OFF",
      statusColor: gameBoostOn ? "text-green-400" : "text-muted-foreground",
      buttonLabel: "Super Boost",
      hasDropdown: true,
      onAction: () => setGameBoostOn(!gameBoostOn),
      subLink: "Configure",
    },
    {
      title: "Internet Boost",
      desc: "Install iTop VPN to boost and secure your Internet connection.",
      gauge: (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx="60" cy="60" r="55" fill="none" stroke="hsl(220 10% 20%)" strokeWidth="2" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="hsl(220 10% 18%)" strokeWidth="1" />
          <circle cx="60" cy="55" r="22" fill="none" stroke="hsl(0 0% 50%)" strokeWidth="1.5" />
          <ellipse cx="60" cy="55" rx="10" ry="22" fill="none" stroke="hsl(0 0% 40%)" strokeWidth="1" />
          <line x1="38" y1="50" x2="82" y2="50" stroke="hsl(0 0% 35%)" strokeWidth="0.8" />
          <line x1="38" y1="60" x2="82" y2="60" stroke="hsl(0 0% 35%)" strokeWidth="0.8" />
          <path d="M60 38 L72 45 L72 60 Q72 70 60 78 Q48 70 48 60 L48 45 Z" fill="none" stroke="hsl(0 0% 55%)" strokeWidth="1.5" />
        </svg>
      ),
      buttonLabel: "Boost Now",
      hasDropdown: false,
      onAction: () => {},
    },
    {
      title: "System Optimize",
      desc: "Junk files, privacy traces, etc. are not good for PC. Please check if there is any on your PC now.",
      gauge: (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx="60" cy="60" r="55" fill="none" stroke="hsl(220 10% 20%)" strokeWidth="2" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="hsl(220 10% 18%)" strokeWidth="1" />
          <path d="M60 30 L80 40 L80 62 Q80 78 60 90 Q40 78 40 62 L40 40 Z" fill="none" stroke="hsl(0 0% 50%)" strokeWidth="2" />
          <path d="M48 58 L56 66 L72 50" fill="none" stroke="hsl(0 0% 45%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      buttonLabel: "Check Now",
      hasDropdown: false,
      onAction: () => {},
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8 animate-fade-in">
      <div className="grid grid-cols-3 gap-4 w-full max-w-[820px]">
        {cards.map((card, i) => (
          <div key={i} className="rounded-lg flex flex-col items-center text-center p-6 hover-lift hover-glow" style={{
            background: "hsl(220 14% 14%)",
            border: "1px solid hsl(220 10% 20%)",
            animationDelay: `${i * 100}ms`,
            animation: "fade-in 0.3s ease-out both",
          }}>
            {/* Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {card.gauge}
              {!card.status && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">i</span>
                </div>
              )}
            </div>

            {/* Status if available */}
            {card.status && (
              <span className={`text-sm font-bold transition-colors duration-300 mt-2 ${card.statusColor}`}>
                {card.status}
              </span>
            )}

            {/* Title */}
            <h3 className="text-base font-bold text-foreground mt-2">{card.title}</h3>

            {/* Description — fixed height to align buttons */}
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 min-h-[44px]">
              {card.desc}
            </p>

            {/* Button — uniform height, same line across cards */}
            <div className="flex items-stretch w-full max-w-[180px] rounded overflow-hidden mt-auto h-9">
              <button onClick={card.onAction}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-all duration-200 btn-press">
                {card.buttonLabel}
              </button>
              {card.hasDropdown && (
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 border-l border-white/20 transition-colors flex items-center">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M3 5l3 3 3-3z" /></svg>
                </button>
              )}
            </div>

            {card.subLink && (
              <button className="text-xs text-muted-foreground hover:text-foreground underline transition-colors mt-2">
                {card.subLink}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
