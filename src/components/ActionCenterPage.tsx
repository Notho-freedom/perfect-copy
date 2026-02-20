import { useState } from "react";
import { Info } from "lucide-react";

const apps = [
  {
    name: "iTop VPN",
    desc: "Try free, fast, secure VPN service for online security.",
    hot: true,
    color: "from-cyan-500 to-blue-600",
    letter: "🛡️",
  },
  {
    name: "iTop Screen Recorder",
    desc: "Free record your PC screen in high quality. No recording limit.",
    hot: true,
    color: "from-red-500 to-pink-600",
    letter: "🎬",
  },
  {
    name: "iTop Easy Desktop",
    desc: "Say goodbye to a cluttered desktop, enjoy a more efficient working space.",
    hot: true,
    color: "from-blue-400 to-indigo-600",
    letter: "🖥️",
  },
  {
    name: "Advanced SystemCare",
    desc: "Registry issues, privacy issues, and junk files are found on your system. Install Advanced SystemCare to optimize your PC and free up disk space.",
    hot: true,
    color: "from-orange-400 to-red-500",
    letter: "⚙️",
  },
];

export function ActionCenterPage() {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Action Center hidden</p>
          <button onClick={() => setHidden(false)} className="text-xs text-blue-400 hover:underline mt-2">Show again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
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
        {apps.map(app => (
          <div key={app.name} className="flex items-center gap-4 rounded-lg p-4 relative overflow-hidden transition-colors hover:bg-white/5" style={{
            background: "hsl(220 14% 14%)", border: "1px solid hsl(220 10% 20%)"
          }}>
            {/* HOT badge — diagonal */}
            {app.hot && (
              <>
                <div className="diagonal-badge diagonal-badge-hot" />
                <span className="diagonal-badge-text">HOT</span>
              </>
            )}

            {/* App icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
              {app.letter}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">{app.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{app.desc}</p>
            </div>

            <button className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold px-6 py-2.5 rounded transition-colors shrink-0 shadow-lg shadow-accent/20">
              Install now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
