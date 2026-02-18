import { X, Settings, History, RefreshCw, BookOpen, Headphones, Languages, Sparkles, Info, Palette } from "lucide-react";

const menuItems = [
  { icon: <Settings className="w-4 h-4" />, label: "Settings" },
  { icon: <History className="w-4 h-4" />, label: "Driver Update History" },
  { icon: <RefreshCw className="w-4 h-4" />, label: "Check for Updates" },
  { icon: <BookOpen className="w-4 h-4" />, label: "User Manual" },
  { icon: <Headphones className="w-4 h-4" />, label: "Technical Support" },
  { icon: <Languages className="w-4 h-4" />, label: "Help Us Translate" },
  { icon: <Sparkles className="w-4 h-4" />, label: "What's New" },
  { icon: <Info className="w-4 h-4" />, label: "About" },
];

const skinColors = ["#e53e3e", "#dd6b20", "#d69e2e", "#38a169", "#3182ce", "#805ad5", "#d53f8c"];

interface HamburgerMenuProps {
  open: boolean;
  onClose: () => void;
}

export function HamburgerMenu({ open, onClose }: HamburgerMenuProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col shadow-2xl animate-slide-in-right"
        style={{ background: "hsl(220 16% 10%)" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-[9px] font-bold text-white">DB</div>
            <span className="text-sm font-semibold text-gray-200">Menu</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-auto py-2">
          {menuItems.map(item => (
            <button key={item.label} className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left">
              <span className="text-gray-500">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Skin section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skin</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-16 h-10 rounded border border-white/10" style={{ background: "linear-gradient(135deg, hsl(220 16% 10%), hsl(220 14% 16%))" }} />
            <span className="text-[11px] text-gray-500">Current Theme</span>
          </div>
          <div className="flex gap-1.5">
            {skinColors.map(color => (
              <button key={color} className="w-5 h-5 rounded-full border-2 border-transparent hover:border-white/40 transition-colors" style={{ background: color }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
