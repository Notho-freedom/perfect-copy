import { useState } from "react";
import { Menu, Minus, Square, X, ChevronDown } from "lucide-react";
import { HamburgerMenu } from "./HamburgerMenu";

type Page = "scan" | "boost" | "tools" | "action-center";

interface LayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
}

const sidebarItems: { id: Page; label: string; icon: string }[] = [
  { id: "scan", label: "Scan / Update", icon: "🔍" },
  { id: "boost", label: "Boost", icon: "🚀" },
  { id: "tools", label: "Tools", icon: "🔧" },
  { id: "action-center", label: "Action Center", icon: "📦" },
];

export function Layout({ currentPage, onPageChange, children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden select-none" style={{ background: "hsl(220 18% 7%)" }}>
      {/* Title bar */}
      <div className="flex items-center justify-between h-10 px-3 shrink-0" style={{ background: "hsl(220 16% 10%)" }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(true)} className="p-1 rounded hover:bg-white/10 transition-colors">
            <Menu className="w-4 h-4 text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-[8px] font-bold text-white">DB</div>
            <span className="text-sm font-semibold text-gray-200">Driver Booster 13.1</span>
            <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded font-bold leading-none">FREE</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors"><ChevronDown className="w-3.5 h-3.5 text-gray-400" /></button>
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors"><Minus className="w-3.5 h-3.5 text-gray-400" /></button>
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors"><Square className="w-3 h-3 text-gray-400" /></button>
          <button className="p-1.5 rounded hover:bg-red-600/80 transition-colors"><X className="w-3.5 h-3.5 text-gray-400" /></button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-[180px] shrink-0 flex flex-col py-2" style={{ background: "hsl(220 16% 10%)" }}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors text-left ${
                currentPage === item.id
                  ? "text-white bg-white/10 border-l-2 border-red-500"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-auto" style={{ background: "hsl(220 15% 13%)" }}>
          {children}
        </div>
      </div>

      {/* Bottom promo banner */}
      <div className="h-10 shrink-0 flex items-center justify-between px-4" style={{ background: "linear-gradient(90deg, hsl(220 16% 10%), hsl(0 50% 20%))" }}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-300">🎉 <strong className="text-orange-400">70% OFF</strong> — Upgrade to PRO for faster updates & priority support</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[10px] bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-colors font-semibold">Check It Out</button>
          <button className="text-[10px] border border-gray-500 text-gray-300 hover:bg-white/10 px-3 py-1 rounded transition-colors">Enter Code</button>
        </div>
      </div>

      {/* Hamburger menu */}
      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
