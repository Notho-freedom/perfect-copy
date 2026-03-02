import { useState, useEffect, useCallback } from "react";
import { outdatedDrivers, upToDateDrivers, scanDriverNames, Driver } from "@/data/drivers";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Monitor, Volume2, Wifi, HardDrive, Mouse, Network, Usb, Info, Search, ChevronRight, PanelRightOpen, PanelRightClose } from "lucide-react";

type ScanState = "idle" | "scanning" | "results-list";

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-4 h-4" />,
  Volume2: <Volume2 className="w-4 h-4" />,
  Wifi: <Wifi className="w-4 h-4" />,
  Network: <Network className="w-4 h-4" />,
  Usb: <Usb className="w-4 h-4" />,
  HardDrive: <HardDrive className="w-4 h-4" />,
  Mouse: <Mouse className="w-4 h-4" />,
};

/* Tick marks around the circle */
function TickMarks({ radius, count }: { radius: number; count: number }) {
  const ticks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    const isLong = i % 5 === 0;
    const r1 = radius - (isLong ? 8 : 5);
    const r2 = radius;
    const rad = (angle * Math.PI) / 180;
    ticks.push(
      <line key={i}
        x1={75 + r1 * Math.cos(rad)} y1={75 + r1 * Math.sin(rad)}
        x2={75 + r2 * Math.cos(rad)} y2={75 + r2 * Math.sin(rad)}
        stroke={isLong ? "hsl(0 0% 45%)" : "hsl(0 0% 30%)"} strokeWidth={isLong ? 1.5 : 0.8}
      />
    );
  }
  return <g>{ticks}</g>;
}

/* The 3D concentric circle button */
function ScanButton({ label, onClick, glowing = true }: { label: string; onClick: () => void; glowing?: boolean }) {
  return (
    <div className="relative w-52 h-52 cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95" onClick={onClick}>
      <div className="absolute inset-0 rounded-full metallic-ring shadow-xl" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 150 150">
        <TickMarks radius={72} count={60} />
      </svg>
      <div className="absolute inset-[8px] rounded-full" style={{ background: "hsl(220 15% 10%)" }} />
      <div className="absolute inset-[12px] rounded-full transition-all duration-500" style={{
        background: "radial-gradient(circle at 50% 40%, hsl(0 80% 35%), hsl(0 70% 20%) 60%, hsl(0 60% 12%) 100%)",
        boxShadow: glowing
          ? "0 0 30px 8px hsl(0 72% 51% / 0.5), 0 0 60px 15px hsl(0 72% 51% / 0.3), inset 0 -10px 30px hsl(0 50% 10% / 0.8), inset 0 5px 15px hsl(0 80% 50% / 0.3)"
          : "inset 0 -10px 30px hsl(0 50% 10% / 0.8), inset 0 5px 15px hsl(0 80% 50% / 0.2)",
      }} />
      <div className="absolute inset-[28px] rounded-full flex items-center justify-center" style={{
        background: "radial-gradient(circle at 50% 35%, hsl(0 60% 25%), hsl(0 50% 15%) 50%, hsl(220 20% 8%) 100%)",
        boxShadow: "inset 0 2px 10px hsl(0 80% 40% / 0.4), inset 0 -5px 15px hsl(0 0% 0% / 0.6)"
      }}>
        <span className="text-xl font-bold text-white/95 tracking-widest drop-shadow-lg group-hover:text-white transition-colors">
          {label}
        </span>
      </div>
      {glowing && <div className="absolute inset-[10px] rounded-full scan-glow-pulse pointer-events-none" />}
    </div>
  );
}

/* PC Info Panel — collapsible, anchored right */
function PCInfoPanel() {
  const [expanded, setExpanded] = useState(true);

  if (!expanded) {
    return (
      <div className="w-10 shrink-0 flex flex-col items-center gap-3 py-6 cursor-pointer transition-all duration-300"
        style={{ background: "hsl(220 16% 10%)", borderLeft: "1px solid hsl(220 10% 18%)" }}
        onClick={() => setExpanded(true)}>
        <Monitor className="w-4 h-4 text-blue-400" />
        <svg className="w-4 h-4 text-green-400" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="4" width="12" height="8" rx="1" /></svg>
        <svg className="w-4 h-4 text-green-400" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="3" width="14" height="10" rx="1" /></svg>
        <svg className="w-4 h-4 text-blue-400" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="10" height="12" rx="1" /></svg>
        <PanelRightOpen className="w-3.5 h-3.5 text-muted-foreground mt-2" />
      </div>
    );
  }

  return (
    <div className="w-56 shrink-0 flex flex-col p-4 space-y-2.5 animate-fade-in transition-all duration-300"
      style={{ background: "hsl(220 16% 10%)", borderLeft: "1px solid hsl(220 10% 18%)" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-foreground tracking-wide">PC INFO</span>
        </div>
        <button onClick={() => setExpanded(false)} className="p-1 rounded hover:bg-white/10 transition-colors">
          <PanelRightClose className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Monitor className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>Microsoft Windows 11 Pro</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <svg className="w-3.5 h-3.5 text-green-400 shrink-0" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="4" width="12" height="8" rx="1" /></svg>
        <span>11th Gen Intel(R) Core(TM) i7-...</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <svg className="w-3.5 h-3.5 text-green-400 shrink-0" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="3" width="14" height="10" rx="1" /></svg>
        <span>NVIDIA GeForce RTX 3050 Ti La...</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="10" height="12" rx="1" /></svg>
        <span>39.7 GB</span>
      </div>
      <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-1">
        <span>•••</span>
        <span>Learn More</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

export function ScanPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentDriver, setCurrentDriver] = useState("");
  const [showUpToDate, setShowUpToDate] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set(outdatedDrivers.map(d => d.id)));

  const startScan = useCallback(() => {
    setScanState("scanning");
    setProgress(0);
  }, []);

  const stopScan = useCallback(() => {
    setScanState("idle");
    setProgress(0);
  }, []);

  useEffect(() => {
    if (scanState !== "scanning") return;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 3 + 1;
        if (next >= 100) {
          clearInterval(interval);
          // Directly go to results list after scan
          setTimeout(() => setScanState("results-list"), 500);
          return 100;
        }
        const idx = Math.floor((next / 100) * scanDriverNames.length);
        setCurrentDriver(scanDriverNames[Math.min(idx, scanDriverNames.length - 1)]);
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [scanState]);

  const toggleDriver = (id: string) => {
    setSelectedDrivers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* IDLE — SCAN button */
  if (scanState === "idle") {
    return (
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 animate-fade-in">
          <div className="flex items-center gap-3 rounded-full px-5 py-2.5 transition-all duration-300 hover:bg-white/5" style={{ background: "hsl(220 14% 16%)", border: "1px solid hsl(220 10% 25%)" }}>
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <Info className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm text-foreground/80">Scan to check the status of drivers!</span>
          </div>
          <ScanButton label="SCAN" onClick={startScan} />
          <p className="text-xs text-muted-foreground">Click to scan for outdated drivers</p>
        </div>
        <PCInfoPanel />
      </div>
    );
  }

  /* SCANNING */
  if (scanState === "scanning") {
    return (
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 animate-fade-in">
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-foreground">Scanning...</h2>
            <p className="text-sm text-muted-foreground mt-1 transition-all duration-200">{currentDriver}</p>
          </div>

          <div className="relative w-52 h-52">
            <div className="absolute inset-0 rounded-full metallic-ring shadow-xl" />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 150 150">
              <TickMarks radius={72} count={60} />
            </svg>
            <div className="absolute inset-[8px] rounded-full" style={{ background: "hsl(220 15% 10%)" }} />

            {/* Progress ring */}
            <svg className="absolute inset-[8px] w-[calc(100%-16px)] h-[calc(100%-16px)] -rotate-90" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="68" fill="none" stroke="hsl(0 50% 15%)" strokeWidth="4" />
              <circle cx="75" cy="75" r="68" fill="none" stroke="hsl(0 72% 51%)"
                strokeWidth="4" strokeDasharray={427} strokeDashoffset={427 - (progress / 100) * 427}
                strokeLinecap="round" className="transition-all duration-200"
                style={{ filter: "drop-shadow(0 0 6px hsl(0 72% 51% / 0.8))" }}
              />
            </svg>

            <div className="absolute inset-[20px] rounded-full flex flex-col items-center justify-center cursor-pointer" onClick={stopScan} style={{
              background: "radial-gradient(circle at 50% 35%, hsl(0 60% 25%), hsl(0 50% 15%) 50%, hsl(220 20% 8%) 100%)",
              boxShadow: "inset 0 2px 10px hsl(0 80% 40% / 0.4), inset 0 -5px 15px hsl(0 0% 0% / 0.6)"
            }}>
              <span className="text-xl font-bold text-white/90 tracking-widest">STOP</span>
            </div>
          </div>

          <span className="text-2xl font-bold text-foreground">{Math.round(progress)}%</span>

          <button onClick={stopScan} className="px-6 py-2 rounded text-sm font-semibold border border-muted text-muted-foreground hover:bg-white/10 transition-all duration-200 hover:border-primary/30">
            Cancel
          </button>
        </div>
        <PCInfoPanel />
      </div>
    );
  }

  /* RESULTS LIST — detailed driver list (shown directly after scan) */
  return (
    <div className="flex-1 flex min-h-0 animate-fade-in">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Alert */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: "hsl(220 14% 13%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[15px] text-foreground">
              <span className="text-primary font-bold">{outdatedDrivers.length} device drivers</span> <span className="font-semibold">outdated</span>
            </span>
            <button onClick={() => { setScanState("idle"); setProgress(0); }}
              className="text-xs text-muted-foreground hover:text-foreground underline ml-2 transition-colors">
              Scan again
            </button>
          </div>
          <div className="flex items-center gap-0 rounded overflow-hidden">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-6 py-2.5 transition-colors shadow-lg shadow-primary/30">
              Update Now
            </button>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-2.5 border-l border-white/20 transition-colors">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PRO upsell */}
        <div className="mx-5 mt-3 rounded-lg px-4 py-3 flex items-center justify-between" style={{ background: "linear-gradient(90deg, hsl(30 60% 15%), hsl(0 40% 15%))", border: "1px solid hsl(30 40% 25%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">⬆</span>
            </div>
            <span className="text-xs text-foreground/80">
              Upgrade to <strong className="text-accent">PRO</strong> edition to update <span className="text-primary font-bold">{outdatedDrivers.length}</span> more device drivers & game drivers.
            </span>
          </div>
          <button className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold px-5 py-2 rounded transition-colors">Upgrade</button>
        </div>

        {/* Outdated header */}
        <div className="flex items-center justify-between px-5 mt-4 mb-2">
          <div className="flex items-center gap-3">
            <Checkbox className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            <span className="text-xs text-muted-foreground">Outdated (total: {outdatedDrivers.length}, selected: {selectedDrivers.size})</span>
          </div>
          <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Driver list */}
        <div className="flex-1 overflow-auto px-5 pb-3">
          <div className="space-y-0.5">
            {outdatedDrivers.map((driver, idx) => (
              <div key={driver.id}
                className="flex items-center gap-3 px-3 py-3 rounded hover:bg-white/5 transition-all duration-200"
                style={{
                  background: "hsl(220 14% 13%)",
                  animationDelay: `${idx * 50}ms`,
                  animation: "fade-in 0.3s ease-out both",
                }}>
                <Checkbox checked={selectedDrivers.has(driver.id)} onCheckedChange={() => toggleDriver(driver.id)}
                  className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                  {iconMap[driver.icon] || <Monitor className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground truncate">{driver.name}</span>
                    {driver.isPro && (
                      <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-bold">PRO</span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{driver.category}</div>
                </div>
                <div className="text-right shrink-0 mr-3">
                  <div className="text-[11px] text-muted-foreground">Current: {driver.currentDate}</div>
                  <div className="text-[11px] text-muted-foreground">Available: {driver.newDate}</div>
                </div>
                <div className="flex items-center gap-0 shrink-0 rounded overflow-hidden">
                  <button className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold px-4 py-1.5 transition-colors">Update</button>
                  <button className="bg-accent hover:bg-accent/90 text-accent-foreground py-1.5 px-1.5 border-l border-white/20 transition-colors">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Up to date section */}
          <button
            onClick={() => setShowUpToDate(!showUpToDate)}
            className="flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showUpToDate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>UpToDate ({upToDateDrivers.length})</span>
          </button>
          {showUpToDate && (
            <div className="mt-2 space-y-1 pl-6 animate-fade-in">
              {upToDateDrivers.map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                  <div className="w-2 h-2 rounded-full bg-green-500/60" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-end px-5 py-3 gap-3 shrink-0" style={{ borderTop: "1px solid hsl(220 10% 18%)" }}>
          <button className="p-2 rounded bg-secondary hover:bg-secondary/80 transition-colors">
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" /></svg>
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-8 py-2.5 rounded transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50">
            Activate Now
          </button>
        </div>
      </div>

      {/* PC Info panel — always visible on the right */}
      <PCInfoPanel />
    </div>
  );
}
