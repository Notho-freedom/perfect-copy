import { ArrowLeft, Sparkles, Zap, Shield, Gauge, Bug, Star } from "lucide-react";

interface WhatsNewPageProps {
  onBack: () => void;
}

const releases = [
  {
    version: "13.1.0",
    date: "March 2026",
    tag: "Latest",
    highlights: [
      { icon: <Zap className="w-4 h-4 text-yellow-400" />, title: "Lightning-Fast Scan Engine", description: "Redesigned scanning algorithm now identifies outdated drivers 40% faster than before." },
      { icon: <Shield className="w-4 h-4 text-green-400" />, title: "Enhanced WHQL Verification", description: "Improved digital signature verification to ensure only certified drivers are recommended." },
      { icon: <Gauge className="w-4 h-4 text-blue-400" />, title: "Game Boost 2.0", description: "New game optimization engine with support for DirectX 13 and Vulkan 1.4 titles." },
      { icon: <Sparkles className="w-4 h-4 text-purple-400" />, title: "Redesigned UI", description: "Modern dark theme with 3D scan button, smooth page transitions, and micro-interaction feedback." },
    ],
  },
  {
    version: "13.0.2",
    date: "February 2026",
    tag: null,
    highlights: [
      { icon: <Bug className="w-4 h-4 text-red-400" />, title: "Bug Fixes", description: "Fixed an issue where some USB 3.0 hub drivers were incorrectly flagged as outdated." },
      { icon: <Shield className="w-4 h-4 text-green-400" />, title: "Security Patch", description: "Updated internal certificate store for improved driver source validation." },
      { icon: <Zap className="w-4 h-4 text-yellow-400" />, title: "Performance", description: "Reduced memory usage during background scans by 25%." },
    ],
  },
  {
    version: "13.0.0",
    date: "January 2026",
    tag: null,
    highlights: [
      { icon: <Star className="w-4 h-4 text-yellow-400" />, title: "Driver Booster 13 Launch", description: "Major version release with expanded driver database covering 8.5 million+ devices." },
      { icon: <Gauge className="w-4 h-4 text-blue-400" />, title: "Super Boost Mode", description: "New one-click system optimization combining driver updates, game boost, and system cleanup." },
      { icon: <Sparkles className="w-4 h-4 text-purple-400" />, title: "Action Center", description: "Centralized hub for recommended IObit products and system health tools." },
    ],
  },
];

export function WhatsNewPage({ onBack }: WhatsNewPageProps) {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
        <button onClick={onBack} className="p-1.5 rounded hover:bg-white/10 transition-colors btn-press">
          <ArrowLeft className="w-4.5 h-4.5 text-muted-foreground" />
        </button>
        <Sparkles className="w-4 h-4 text-primary" />
        <h1 className="text-[15px] font-bold text-foreground tracking-wide">What's New</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 space-y-8 custom-scrollbar">
        {releases.map((release) => (
          <div key={release.version}>
            {/* Version header */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[16px] font-bold text-foreground">v{release.version}</h2>
              {release.tag && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                  {release.tag}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">{release.date}</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Items */}
            <div className="space-y-3 ml-1">
              {release.highlights.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-3.5 p-3.5 rounded-lg hover-lift transition-all duration-200"
                  style={{ background: "hsl(220 14% 11%)", border: "1px solid hsl(220 10% 16%)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(220 14% 15%)" }}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground/90">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
