import { ArrowLeft, Settings, History, RefreshCw, BookOpen, Headphones, Languages, Sparkles, Star } from "lucide-react";

type MenuAction = "settings" | "history" | "whats-new" | "check-updates" | null;

const menuItems: { icon: React.ReactNode; label: string; color: string; action?: MenuAction }[] = [
  { icon: <Settings className="w-4 h-4" />, label: "Settings...", color: "text-muted-foreground", action: "settings" },
  { icon: <History className="w-4 h-4" />, label: "Driver Update History", color: "text-blue-400", action: "history" },
  { icon: <RefreshCw className="w-4 h-4" />, label: "Check for Updates", color: "text-green-400", action: "check-updates" },
  { icon: <BookOpen className="w-4 h-4" />, label: "User Manual (F1)", color: "text-blue-400" },
  { icon: <Headphones className="w-4 h-4" />, label: "Technical Support", color: "text-yellow-400" },
  { icon: <Languages className="w-4 h-4" />, label: "Help Us Translate", color: "text-orange-400" },
  { icon: <Sparkles className="w-4 h-4" />, label: "What's New", color: "text-blue-400", action: "whats-new" },
  { icon: <Star className="w-4 h-4" />, label: "About", color: "text-yellow-400" },
];

const skinColors = [
  "hsl(210 80% 50%)", "hsl(200 70% 45%)", "hsl(340 60% 40%)", "hsl(320 50% 35%)",
  "hsl(280 50% 40%)", "hsl(160 60% 40%)", "hsl(100 50% 40%)", "hsl(180 60% 40%)",
];

interface HamburgerMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (action: MenuAction) => void;
}

export function HamburgerMenu({ open, onClose, onNavigate }: HamburgerMenuProps) {
  if (!open) return null;

  const handleClick = (action?: MenuAction) => {
    if (action && onNavigate) {
      onNavigate(action);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-[260px] z-50 flex flex-col shadow-2xl animate-slide-in-left"
        style={{ background: "hsl(220 18% 9%)" }}>
        {/* Header — back arrow */}
        <div className="flex items-center px-4 py-3.5" style={{ borderBottom: "1px solid hsl(220 10% 16%)" }}>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-auto py-2">
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={() => handleClick(item.action)}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-sm text-foreground/80 hover:bg-white/5 hover:text-foreground transition-colors text-left"
            >
              <span className={item.color}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Skin section */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid hsl(220 10% 16%)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-blue-400 tracking-wide">Skin</span>
          </div>

          {/* Theme preview */}
          <div className="mb-3 flex flex-col items-center">
            <div className="w-28 h-20 rounded border-2 border-primary/60 overflow-hidden" style={{
              background: "linear-gradient(135deg, hsl(220 18% 9%), hsl(220 14% 14%))"
            }}>
              <div className="w-full h-3" style={{ background: "hsl(220 16% 7%)" }} />
              <div className="flex h-[calc(100%-12px)]">
                <div className="w-5" style={{ background: "hsl(220 16% 7%)" }} />
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full" style={{ background: "radial-gradient(hsl(0 60% 30%), hsl(0 40% 15%))" }} />
                </div>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1.5">Black</span>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {skinColors.map(color => (
              <button key={color} className="w-5 h-5 rounded border border-white/10 hover:border-white/40 transition-colors" style={{ background: color }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
