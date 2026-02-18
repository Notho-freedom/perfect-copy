import { useState } from "react";
import { Info } from "lucide-react";

const apps = [
  { name: "iTop VPN", desc: "The world's fastest VPN for streaming, gaming, and privacy protection.", hot: true, icon: "🛡️" },
  { name: "iTop Screen Recorder", desc: "Record screen, webcam, and audio with no watermark or time limit.", hot: true, icon: "🎬" },
  { name: "iTop Easy Desktop", desc: "Organize your desktop icons and files with one click for a cleaner workspace.", hot: false, icon: "🖥️" },
  { name: "Advanced SystemCare", desc: "All-in-one PC optimization utility to clean, speed up, and protect your PC.", hot: true, icon: "⚙️" },
];

export function ActionCenterPage() {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Action Center hidden</p>
          <button onClick={() => setHidden(false)} className="text-xs text-blue-400 hover:underline mt-2">Show again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded px-4 py-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">Make PC safer and faster with the following programs recommended by IObit</span>
        </div>
        <button onClick={() => setHidden(true)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Hide</button>
      </div>

      <div className="space-y-3">
        {apps.map(app => (
          <div key={app.name} className="flex items-center gap-4 rounded-lg p-4 border border-border hover:border-gray-600 transition-colors"
            style={{ background: "hsl(220 14% 15%)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "hsl(220 14% 20%)" }}>
              {app.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-200">{app.name}</span>
                {app.hot && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">HOT</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{app.desc}</p>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded transition-colors shrink-0">
              Install now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
