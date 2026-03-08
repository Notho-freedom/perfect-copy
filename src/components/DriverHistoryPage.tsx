import { ArrowLeft, Check, X, RotateCcw, Clock, Shield } from "lucide-react";

interface DriverHistoryPageProps {
  onBack: () => void;
}

const historyEntries = [
  { date: "2026-03-07", time: "14:32", driver: "NVIDIA GeForce RTX 3050 Ti", from: "31.0.15.5176", to: "32.0.15.6109", status: "success", category: "Display" },
  { date: "2026-03-07", time: "14:28", driver: "Realtek High Definition Audio", from: "6.0.9285.1", to: "6.0.9539.1", status: "success", category: "Audio" },
  { date: "2026-03-07", time: "14:25", driver: "Intel Wi-Fi 6 AX201", from: "22.230.0.8", to: "22.250.1.2", status: "success", category: "Network" },
  { date: "2026-03-05", time: "09:15", driver: "Intel Management Engine", from: "2245.4.14.0", to: "2306.4.8.0", status: "rolled-back", category: "System" },
  { date: "2026-03-05", time: "09:12", driver: "Synaptics Touchpad", from: "19.5.35.82", to: "19.5.35.95", status: "success", category: "Input" },
  { date: "2026-03-03", time: "16:40", driver: "USB Root Hub (USB 3.0)", from: "10.0.22621.1", to: "10.0.22621.3", status: "failed", category: "USB" },
  { date: "2026-03-03", time: "16:38", driver: "Realtek PCIe GBE Controller", from: "10.57.714.2023", to: "10.62.901.2024", status: "success", category: "Network" },
  { date: "2026-03-01", time: "11:20", driver: "Intel UHD Graphics 630", from: "31.0.101.4502", to: "31.0.101.5186", status: "success", category: "Display" },
  { date: "2026-02-28", time: "08:55", driver: "AMD High Definition Audio", from: "10.0.1.24", to: "10.0.1.30", status: "success", category: "Audio" },
  { date: "2026-02-25", time: "19:10", driver: "Microsoft ISATAP Adapter", from: "10.0.22621.1", to: "10.0.22621.2", status: "success", category: "Network" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
        <Check className="w-3 h-3" /> Success
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
        <X className="w-3 h-3" /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">
      <RotateCcw className="w-3 h-3" /> Rolled Back
    </span>
  );
}

export function DriverHistoryPage({ onBack }: DriverHistoryPageProps) {
  // Group by date
  const grouped = historyEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, typeof historyEntries>);

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded hover:bg-white/10 transition-colors btn-press">
            <ArrowLeft className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
          <h1 className="text-[15px] font-bold text-foreground tracking-wide">Driver Update History</h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{historyEntries.length} updates recorded</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 px-5 py-3 shrink-0" style={{ background: "hsl(220 14% 10%)", borderBottom: "1px solid hsl(220 10% 18%)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[11px] text-foreground/70">{historyEntries.filter(e => e.status === "success").length} Successful</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-[11px] text-foreground/70">{historyEntries.filter(e => e.status === "failed").length} Failed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-[11px] text-foreground/70">{historyEntries.filter(e => e.status === "rolled-back").length} Rolled Back</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-5 space-y-6 custom-scrollbar">
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[12px] font-bold text-foreground/60 uppercase tracking-wider">{formatDate(date)}</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-1.5 ml-3">
              {entries.map((entry, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.03] transition-colors group" style={{ border: "1px solid hsl(220 10% 16%)" }}>
                  <div className="shrink-0">
                    <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-foreground/90 truncate">{entry.driver}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      <span className="text-red-400/70">{entry.from}</span>
                      <span className="mx-1.5">→</span>
                      <span className="text-green-400/70">{entry.to}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0">{entry.time}</span>
                  <StatusBadge status={entry.status} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
