import { useState } from "react";
import { Info, X, ArrowLeft } from "lucide-react";

const apps = [
  {
    name: "iTop VPN",
    desc: "Try free, fast, secure VPN service for online security.",
    hot: true,
    color: "from-cyan-500 to-blue-600",
    letter: "🛡️",
    details: "iTop VPN provides military-grade encryption to protect your online privacy. Features include: unlimited bandwidth, 1800+ servers worldwide, ad-blocking, and split tunneling. Compatible with Windows, Mac, iOS, and Android.",
  },
  {
    name: "iTop Screen Recorder",
    desc: "Free record your PC screen in high quality. No recording limit.",
    hot: true,
    color: "from-red-500 to-pink-600",
    letter: "🎬",
    details: "iTop Screen Recorder captures your screen in HD quality with no time limits. Record gameplay, tutorials, webinars, and more. Features include: webcam overlay, audio recording, scheduled recording, and multiple output formats.",
  },
  {
    name: "iTop Easy Desktop",
    desc: "Say goodbye to a cluttered desktop, enjoy a more efficient working space.",
    hot: true,
    color: "from-blue-400 to-indigo-600",
    letter: "🖥️",
    details: "iTop Easy Desktop organizes your desktop automatically. Features include: smart folders, one-click hide, desktop wallpaper management, quick search, and customizable layouts for maximum productivity.",
  },
  {
    name: "Advanced SystemCare",
    desc: "Registry issues, privacy issues, and junk files are found on your system. Install Advanced SystemCare to optimize your PC and free up disk space.",
    hot: true,
    color: "from-orange-400 to-red-500",
    letter: "⚙️",
    details: "Advanced SystemCare is a comprehensive PC optimization tool. It cleans junk files, fixes registry errors, optimizes startup items, and boosts internet speed. Features real-time protection, privacy shield, and one-click optimization.",
  },
];

export function ActionCenterPage() {
  const [hidden, setHidden] = useState(false);
  const [selectedApp, setSelectedApp] = useState<typeof apps[0] | null>(null);

  if (selectedApp) {
    return (
      <div className="flex-1 p-6 overflow-auto animate-fade-in">
        <button onClick={() => setSelectedApp(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Action Center</span>
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl p-8 space-y-6" style={{ background: "hsl(220 14% 14%)", border: "1px solid hsl(220 10% 20%)" }}>
            {/* App header */}
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedApp.color} flex items-center justify-center text-4xl shadow-xl shrink-0`}>
                {selectedApp.letter}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedApp.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedApp.desc}</p>
                {selectedApp.hot && (
                  <span className="inline-block mt-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">HOT</span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">About this application</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedApp.details}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {["Easy to use", "Free version available", "Regular updates", "24/7 Support"].map(f => (
                <div key={f} className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "hsl(220 14% 18%)" }}>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-foreground/80">{f}</span>
                </div>
              ))}
            </div>

            {/* Install button */}
            <button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40">
              Install {selectedApp.name}
            </button>
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
    <div className="flex-1 p-6 overflow-auto animate-fade-in">
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
            {/* HOT badge */}
            {app.hot && (
              <>
                <div className="diagonal-badge diagonal-badge-hot" />
                <span className="diagonal-badge-text">HOT</span>
              </>
            )}

            {/* App icon */}
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
