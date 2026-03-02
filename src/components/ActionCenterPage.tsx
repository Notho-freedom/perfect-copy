import { useState } from "react";
import { Info, X, ArrowLeft, Check, ExternalLink, Star, Shield, Zap, Download } from "lucide-react";

const apps = [
  {
    name: "iTop VPN",
    desc: "Try free, fast, secure VPN service for online security.",
    hot: true,
    color: "from-cyan-500 to-blue-600",
    letter: "🛡️",
    details: "iTop VPN provides military-grade encryption to protect your online privacy. Features include: unlimited bandwidth, 1800+ servers worldwide, ad-blocking, and split tunneling. Compatible with Windows, Mac, iOS, and Android.",
    version: "4.6.0.3683",
    size: "52.3 MB",
    rating: 4.6,
  },
  {
    name: "iTop Screen Recorder",
    desc: "Free record your PC screen in high quality. No recording limit.",
    hot: true,
    color: "from-red-500 to-pink-600",
    letter: "🎬",
    details: "iTop Screen Recorder captures your screen in HD quality with no time limits. Record gameplay, tutorials, webinars, and more. Features include: webcam overlay, audio recording, scheduled recording, and multiple output formats.",
    version: "4.3.0.1173",
    size: "78.1 MB",
    rating: 4.5,
  },
  {
    name: "iTop Easy Desktop",
    desc: "Say goodbye to a cluttered desktop, enjoy a more efficient working space.",
    hot: true,
    color: "from-blue-400 to-indigo-600",
    letter: "🖥️",
    details: "iTop Easy Desktop organizes your desktop automatically. Features include: smart folders, one-click hide, desktop wallpaper management, quick search, and customizable layouts for maximum productivity.",
    version: "2.1.0.42",
    size: "18.7 MB",
    rating: 4.3,
  },
  {
    name: "Advanced SystemCare",
    desc: "Registry issues, privacy issues, and junk files are found on your system.",
    hot: true,
    color: "from-orange-400 to-red-500",
    letter: "⚙️",
    details: "Advanced SystemCare is a comprehensive PC optimization tool. It cleans junk files, fixes registry errors, optimizes startup items, and boosts internet speed. Features real-time protection, privacy shield, and one-click optimization.",
    version: "17.2.0.191",
    size: "45.9 MB",
    rating: 4.7,
  },
];

export function ActionCenterPage() {
  const [hidden, setHidden] = useState(false);
  const [selectedApp, setSelectedApp] = useState<typeof apps[0] | null>(null);

  /* Full-page product details */
  if (selectedApp) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-auto custom-scrollbar animate-fade-in">
        {/* Header bar */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0" style={{ background: "hsl(220 14% 13%)", borderBottom: "1px solid hsl(220 10% 18%)" }}>
          <button onClick={() => setSelectedApp(null)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm text-muted-foreground">Back to Action Center</span>
        </div>

        {/* Hero section */}
        <div className="px-8 pt-8 pb-6" style={{ background: "linear-gradient(180deg, hsl(220 14% 14%), hsl(220 14% 12%))" }}>
          <div className="flex items-start gap-6">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${selectedApp.color} flex items-center justify-center text-5xl shadow-2xl shrink-0`}
              style={{ animation: "scale-in 0.3s ease-out" }}>
              {selectedApp.letter}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{selectedApp.name}</h1>
              <p className="text-sm text-muted-foreground mt-1.5">{selectedApp.desc}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(selectedApp.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{selectedApp.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">v{selectedApp.version}</span>
                <span className="text-xs text-muted-foreground">{selectedApp.size}</span>
              </div>
            </div>
            <button className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold px-8 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02] shrink-0 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Install Now
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6 flex-1">
          {/* About */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{selectedApp.details}</p>
          </div>

          {/* Features grid */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Key Features</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: <Shield className="w-4 h-4 text-blue-400" />, text: "Secure & Private" },
                { icon: <Zap className="w-4 h-4 text-yellow-400" />, text: "Lightning Fast" },
                { icon: <Star className="w-4 h-4 text-accent" />, text: "Highly Rated" },
                { icon: <Check className="w-4 h-4 text-green-400" />, text: "Regular Updates" },
                { icon: <ExternalLink className="w-4 h-4 text-purple-400" />, text: "Cross-Platform" },
                { icon: <Download className="w-4 h-4 text-cyan-400" />, text: "Free Version Available" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/5"
                  style={{ background: "hsl(220 14% 14%)", border: "1px solid hsl(220 10% 20%)", animationDelay: `${i * 50}ms`, animation: "fade-in 0.3s ease-out both" }}>
                  {f.icon}
                  <span className="text-xs text-foreground/80">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System requirements */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">System Requirements</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
              {[
                ["OS", "Windows 7/8/10/11"],
                ["CPU", "1 GHz or faster"],
                ["RAM", "512 MB minimum"],
                ["Disk", `${selectedApp.size} free space`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-xs py-1.5" style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground/80">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hidden) {
    return (
      <div className="flex-1 flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Action Center hidden</p>
          <button onClick={() => setHidden(false)} className="text-xs text-blue-400 hover:underline mt-2">Show again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto custom-scrollbar animate-fade-in">
      {/* Info banner */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-foreground/80">
            Make PC safer and faster with the following programs recommended by IObit.
          </span>
        </div>
        <button onClick={() => setHidden(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline ml-4 shrink-0">
          Hide
        </button>
      </div>

      {/* App list */}
      <div className="space-y-3">
        {apps.map((app, idx) => (
          <div key={app.name}
            className="flex items-center gap-4 rounded-lg p-4 relative overflow-hidden transition-all duration-200 hover:bg-white/5 cursor-pointer group"
            style={{
              background: "hsl(220 14% 14%)",
              border: "1px solid hsl(220 10% 20%)",
              animationDelay: `${idx * 80}ms`,
              animation: "fade-in 0.3s ease-out both",
            }}
            onClick={() => setSelectedApp(app)}
          >
            {app.hot && (
              <>
                <div className="diagonal-badge diagonal-badge-hot" />
                <span className="diagonal-badge-text">HOT</span>
              </>
            )}

            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-2xl shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-200`}>
              {app.letter}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">{app.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{app.desc}</p>
            </div>

            <button onClick={(e) => { e.stopPropagation(); }}
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold px-6 py-2.5 rounded transition-all duration-200 shrink-0 shadow-lg shadow-accent/20 hover:shadow-accent/40">
              Install now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
