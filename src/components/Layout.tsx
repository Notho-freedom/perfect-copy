import { useState } from "react";
import { Menu, Minus, Square, X, MessageSquare } from "lucide-react";
import { HamburgerMenu } from "./HamburgerMenu";
import { ChatOverlay } from "./ChatOverlay";

type Page = "scan" | "boost" | "tools" | "action-center";

interface LayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
}

const sidebarItems: { id: Page; label: string }[] = [
  { id: "scan", label: "Scan" },
  { id: "boost", label: "Boost" },
  { id: "tools", label: "Tools" },
  { id: "action-center", label: "Action Center" },
];

/* SVG icons matching Driver Booster style */
function ScanIcon({ active }: { active: boolean }) {
  const color = active ? "hsl(0, 72%, 51%)" : "hsl(0, 0%, 55%)";
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" stroke={color} strokeWidth="2" fill="none" />
      <path d="M14 3 A11 11 0 0 1 25 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="14" r="3" fill={color} />
    </svg>
  );
}

function BoostIcon({ active }: { active: boolean }) {
  const color = active ? "hsl(0, 72%, 51%)" : "hsl(0, 0%, 55%)";
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4C8.5 4 4 8.5 4 14s4.5 10 10 10 10-4.5 10-10S19.5 4 14 4z" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M14 7C10.1 7 7 10.1 7 14s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M14 14 L10 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ToolsIcon({ active }: { active: boolean }) {
  const color = active ? "hsl(0, 72%, 51%)" : "hsl(0, 0%, 55%)";
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="8" width="8" height="6" rx="1" stroke={color} strokeWidth="1.8" fill="none" />
      <rect x="16" y="8" width="8" height="6" rx="1" stroke={color} strokeWidth="1.8" fill="none" />
      <rect x="4" y="17" width="8" height="6" rx="1" stroke={color} strokeWidth="1.8" fill="none" />
      <rect x="16" y="17" width="8" height="6" rx="1" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="22" cy="7" r="3" fill={active ? "hsl(45, 90%, 55%)" : "hsl(0, 0%, 40%)"} />
    </svg>
  );
}

function ActionCenterIcon({ active }: { active: boolean }) {
  const color = active ? "hsl(0, 72%, 51%)" : "hsl(0, 0%, 55%)";
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="5" y="5" width="8" height="8" rx="1.5" fill={color} />
      <rect x="15" y="5" width="8" height="8" rx="1.5" fill={color} />
      <rect x="5" y="15" width="8" height="8" rx="1.5" fill={color} />
      <rect x="15" y="15" width="8" height="8" rx="1.5" fill={color} />
      <circle cx="23" cy="5" r="3" fill="hsl(45, 90%, 55%)" />
    </svg>
  );
}

const iconComponents: Record<Page, React.FC<{ active: boolean }>> = {
  scan: ScanIcon,
  boost: BoostIcon,
  tools: ToolsIcon,
  "action-center": ActionCenterIcon,
};

export function Layout({ currentPage, onPageChange, children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden select-none" style={{ background: "hsl(220 18% 7%)" }}>
      {/* Title bar */}
      <div className="flex items-center justify-between h-9 px-3 shrink-0" style={{ background: "hsl(220 18% 8%)", WebkitAppRegion: "drag" } as React.CSSProperties}>
        <div className="w-[100px] shrink-0" />
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <span className="text-[13px] font-medium text-muted-foreground tracking-wide">Driver Booster 13.1</span>
          <span className="text-[9px] border border-primary/60 text-primary px-1.5 py-0.5 rounded font-bold leading-none">FREE</span>
        </div>
        <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mr-2 shadow-lg shadow-red-500/30">
            <span className="text-white text-[10px] font-bold">%</span>
          </div>
          <button onClick={() => setChatOpen(true)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => window.electronAPI?.minimize()} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => window.electronAPI?.maximize()} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Square className="w-3 h-3 text-muted-foreground" />
          </button>
          <button onClick={() => window.electronAPI?.close()} className="p-1.5 rounded hover:bg-red-600/80 transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
          {/* Hamburger — top */}
          <button
            onClick={() => setMenuOpen(true)}
            className="w-full flex flex-col items-center py-4 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200 hover-scale-sm shrink-0"
          >
            <Menu className="w-7 h-7" />
          </button>

          {/* Nav items — centered */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 w-full">
          {sidebarItems.map((item) => {
            const active = currentPage === item.id;
            const Icon = iconComponents[item.id];
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`relative w-full flex flex-col items-center gap-1.5 py-4 transition-all duration-200 hover-scale-sm ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary shadow-lg shadow-primary/50 transition-all duration-300" />
                )}
                <Icon active={active} />
                <span className={`text-[11px] font-medium transition-colors duration-200 ${active ? "text-primary" : ""}`}>{item.label}</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* Main content with page transition */}
        <div className="flex-1 flex flex-col min-h-0 overflow-auto" style={{ background: "hsl(220 14% 12%)" }}>
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom promo banner with close button */}
      {bannerVisible && (
        <div className="h-[52px] shrink-0 flex items-center px-4 relative overflow-hidden animate-fade-in" style={{ background: "linear-gradient(135deg, hsl(350 60% 65%), hsl(20 70% 55%))" }}>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3 shrink-0">
            <span className="text-lg">🎁</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-white">Don't Miss Out - 90% OFF + 2 Extra Months Free!</div>
            <div className="text-[11px] text-white/80">Last chance to grab top-tier PC performance – unleash it for all your needs before it's gone!</div>
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            <button className="bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold px-5 py-2 rounded transition-colors shadow-lg">Check It Out</button>
            <button className="text-[11px] text-white/90 hover:text-white underline transition-colors">Enter Code</button>
          </div>
          <button onClick={() => setBannerVisible(false)} className="ml-3 p-1 rounded-full hover:bg-white/20 transition-colors shrink-0">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Hamburger menu */}
      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {/* Chat overlay */}
      <ChatOverlay open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
