import { useState, useEffect, useCallback, useMemo } from "react";
import { outdatedDrivers, upToDateDrivers, scanDriverNames, Driver } from "@/data/drivers";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Monitor, Volume2, Wifi, HardDrive, Mouse, Network, Usb, Info, Search, ChevronRight, PanelRightOpen, PanelRightClose, X, Check, Crown, Shield, Zap, Star, ArrowLeft } from "lucide-react";

type ScanState = "idle" | "scanning" | "results-list" | "updating" | "update-complete";

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

/* PC Info Panel — mini, centered vertically on the right edge */
function PCInfoPanel() {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2.5 py-4 px-1.5 cursor-pointer transition-all duration-300 rounded-l-lg"
        style={{ background: "hsl(220 16% 10% / 0.95)", border: "1px solid hsl(220 10% 18%)", borderRight: "none" }}
        onClick={() => setExpanded(true)}>
        <Monitor className="w-3.5 h-3.5 text-blue-400" />
        <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="4" width="12" height="8" rx="1" /></svg>
        <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="3" width="14" height="10" rx="1" /></svg>
        <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="10" height="12" rx="1" /></svg>
        <PanelRightOpen className="w-3 h-3 text-muted-foreground mt-1" />
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-52 flex flex-col p-3.5 space-y-2 animate-fade-in rounded-l-lg transition-all duration-300"
      style={{ background: "hsl(220 16% 10% / 0.95)", border: "1px solid hsl(220 10% 18%)", borderRight: "none" }}>
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-bold text-foreground tracking-wide">PC INFO</span>
        </div>
        <button onClick={() => setExpanded(false)} className="p-0.5 rounded hover:bg-white/10 transition-colors">
          <PanelRightClose className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Monitor className="w-3 h-3 text-blue-400 shrink-0" />
        <span>Microsoft Windows 11 Pro</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <svg className="w-3 h-3 text-green-400 shrink-0" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="4" width="12" height="8" rx="1" /></svg>
        <span>11th Gen Intel(R) Core(TM) i7-...</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <svg className="w-3 h-3 text-green-400 shrink-0" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="3" width="14" height="10" rx="1" /></svg>
        <span>NVIDIA GeForce RTX 3050 Ti La...</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <svg className="w-3 h-3 text-blue-400 shrink-0" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="10" height="12" rx="1" /></svg>
        <span>39.7 GB</span>
      </div>
      <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-0.5">
        <span>•••</span>
        <span>Learn More</span>
        <ChevronRight className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

/* PRO Upgrade Modal */
function ProUpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="w-[460px] rounded-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}
        style={{ background: "hsl(220 16% 12%)", border: "1px solid hsl(220 10% 22%)" }}>
        <div className="p-6 text-center" style={{ background: "linear-gradient(135deg, hsl(30 80% 20%), hsl(0 60% 18%))" }}>
          <Crown className="w-12 h-12 text-accent mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground">Upgrade to PRO</h2>
          <p className="text-sm text-muted-foreground mt-1">Unlock all drivers & premium features</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {[
              { icon: <Zap className="w-4 h-4 text-accent" />, text: "Update ALL outdated drivers including game drivers" },
              { icon: <Shield className="w-4 h-4 text-green-400" />, text: "Auto backup & restore for safe updates" },
              { icon: <Star className="w-4 h-4 text-yellow-400" />, text: "Priority download speed — 3x faster" },
              { icon: <Check className="w-4 h-4 text-blue-400" />, text: "Automatic driver updates in background" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                {f.icon}
                <span>{f.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <div className="flex-1 rounded-lg p-4 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "hsl(220 14% 16%)", border: "1px solid hsl(220 10% 25%)" }}>
              <div className="text-xs text-muted-foreground">1 Year</div>
              <div className="text-xl font-bold text-accent mt-1">$16.77</div>
              <div className="text-[10px] text-muted-foreground line-through">$59.95</div>
            </div>
            <div className="flex-1 rounded-lg p-4 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] relative overflow-hidden"
              style={{ background: "hsl(220 14% 16%)", border: "2px solid hsl(var(--accent))" }}>
              <div className="absolute top-0 right-0 bg-accent text-[8px] text-white font-bold px-2 py-0.5 rounded-bl">BEST</div>
              <div className="text-xs text-muted-foreground">3 PCs / 1 Year</div>
              <div className="text-xl font-bold text-accent mt-1">$22.77</div>
              <div className="text-[10px] text-muted-foreground line-through">$89.95</div>
            </div>
          </div>
          <button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-accent/30 hover:shadow-accent/50 mt-2">
            Upgrade Now — Save 72%
          </button>
          <button onClick={onClose} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

/* Activate Now Modal */
function ActivateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="w-[400px] rounded-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}
        style={{ background: "hsl(220 16% 12%)", border: "1px solid hsl(220 10% 22%)" }}>
        <div className="p-6 text-center" style={{ background: "linear-gradient(135deg, hsl(0 60% 20%), hsl(220 20% 15%))" }}>
          <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
          <h2 className="text-lg font-bold text-foreground">Activate PRO License</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">License Key</label>
            <input type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              style={{ background: "hsl(220 14% 16%)", border: "1px solid hsl(220 10% 25%)" }} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Email Address</label>
            <input type="email" placeholder="your@email.com"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              style={{ background: "hsl(220 14% 16%)", border: "1px solid hsl(220 10% 25%)" }} />
          </div>
          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-primary/30">
            Activate
          </button>
          <div className="flex items-center justify-center gap-4">
            <button className="text-xs text-accent hover:underline transition-colors">Buy License</button>
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Driver Detail Panel */
function DriverDetailPanel({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="w-[440px] rounded-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}
        style={{ background: "hsl(220 16% 12%)", border: "1px solid hsl(220 10% 22%)" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ background: "hsl(220 14% 14%)", borderBottom: "1px solid hsl(220 10% 20%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-muted-foreground">
              {iconMap[driver.icon] || <Monitor className="w-4 h-4" />}
            </div>
            <h3 className="text-sm font-bold text-foreground">{driver.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Category", value: driver.category },
              { label: "Current Version", value: driver.currentVersion },
              { label: "Current Date", value: driver.currentDate },
              { label: "New Version", value: driver.newVersion },
              { label: "New Date", value: driver.newDate },
              { label: "Type", value: driver.isPro ? "PRO" : "Free" },
            ].map((item, i) => (
              <div key={i} className="rounded-lg px-3 py-2.5" style={{ background: "hsl(220 14% 16%)" }}>
                <div className="text-[10px] text-muted-foreground">{item.label}</div>
                <div className="text-xs text-foreground mt-0.5 font-medium">{item.value}</div>
              </div>
            ))}
          </div>
          {driver.isPro ? (
            <button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold py-2.5 rounded-lg transition-all duration-200">
              Upgrade to Update
            </button>
          ) : (
            <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold py-2.5 rounded-lg transition-all duration-200">
              Update Driver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScanPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentDriver, setCurrentDriver] = useState("");
  const [showUpToDate, setShowUpToDate] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set(outdatedDrivers.map(d => d.id)));
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProModal, setShowProModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Driver | null>(null);
  const [showProBanner, setShowProBanner] = useState(true);

  // Update simulation state
  const [updatingDrivers, setUpdatingDrivers] = useState<Map<string, number>>(new Map());
  const [updatedDrivers, setUpdatedDrivers] = useState<Set<string>>(new Set());
  const [currentUpdatingId, setCurrentUpdatingId] = useState<string | null>(null);

  const filteredOutdated = useMemo(() => {
    if (!searchQuery.trim()) return outdatedDrivers;
    const q = searchQuery.toLowerCase();
    return outdatedDrivers.filter(d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
  }, [searchQuery]);

  const startScan = useCallback(() => {
    setScanState("scanning");
    setProgress(0);
    setUpdatingDrivers(new Map());
    setUpdatedDrivers(new Set());
    setCurrentUpdatingId(null);
  }, []);

  const stopScan = useCallback(() => {
    setScanState("idle");
    setProgress(0);
  }, []);

  // Scan progress
  useEffect(() => {
    if (scanState !== "scanning") return;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 3 + 1;
        if (next >= 100) {
          clearInterval(interval);
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

  // Update simulation
  const startUpdateAll = useCallback(() => {
    const freeSelected = outdatedDrivers.filter(d => !d.isPro && selectedDrivers.has(d.id) && !updatedDrivers.has(d.id));
    if (freeSelected.length === 0) return;
    setScanState("updating");
    setCurrentUpdatingId(freeSelected[0].id);
  }, [selectedDrivers, updatedDrivers]);

  useEffect(() => {
    if (scanState !== "updating" || !currentUpdatingId) return;
    const interval = setInterval(() => {
      setUpdatingDrivers(prev => {
        const next = new Map(prev);
        const current = next.get(currentUpdatingId) || 0;
        const newVal = current + Math.random() * 8 + 4;
        if (newVal >= 100) {
          next.set(currentUpdatingId, 100);
          // Mark as done, move to next
          setTimeout(() => {
            setUpdatedDrivers(prev2 => {
              const n = new Set(prev2);
              n.add(currentUpdatingId);
              return n;
            });
            // Find next free driver to update
            const freeSelected = outdatedDrivers.filter(d => !d.isPro && selectedDrivers.has(d.id));
            const currentIdx = freeSelected.findIndex(d => d.id === currentUpdatingId);
            const nextDriver = freeSelected[currentIdx + 1];
            if (nextDriver && !updatedDrivers.has(nextDriver.id)) {
              setCurrentUpdatingId(nextDriver.id);
            } else {
              setCurrentUpdatingId(null);
              setScanState("update-complete");
            }
          }, 300);
          return next;
        }
        next.set(currentUpdatingId, newVal);
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [scanState, currentUpdatingId, selectedDrivers, updatedDrivers]);

  const toggleDriver = (id: string) => {
    setSelectedDrivers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDriverUpdate = (driver: Driver) => {
    if (driver.isPro) {
      setShowProModal(true);
    } else {
      // Single driver update simulation
      setScanState("updating");
      setCurrentUpdatingId(driver.id);
    }
  };

  /* UPDATE COMPLETE */
  if (scanState === "update-complete") {
    return (
      <div className="flex-1 flex relative">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center animate-scale-in">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">All Updates Complete!</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {updatedDrivers.size} driver(s) have been successfully updated to the latest version. Your system is now up to date.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => { setScanState("results-list"); }} className="px-6 py-2.5 rounded-lg text-sm font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-200">
              View Details
            </button>
            <button onClick={() => { setScanState("idle"); setProgress(0); setUpdatedDrivers(new Set()); setUpdatingDrivers(new Map()); }}
              className="px-6 py-2.5 rounded-lg text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-lg shadow-primary/30">
              Scan Again
            </button>
          </div>
        </div>
        <PCInfoPanel />
      </div>
    );
  }

  /* IDLE — SCAN button */
  if (scanState === "idle") {
    return (
      <div className="flex-1 flex relative">
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

  /* SCANNING — keep red glow + progress ring */
  if (scanState === "scanning") {
    return (
      <div className="flex-1 flex relative">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 animate-fade-in">
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-foreground">Scanning...</h2>
            <p className="text-sm text-muted-foreground mt-1 transition-all duration-200">{currentDriver}</p>
          </div>

          <div className="relative w-52 h-52 cursor-pointer group" onClick={stopScan}>
            <div className="absolute inset-0 rounded-full metallic-ring shadow-xl" />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 150 150">
              <TickMarks radius={72} count={60} />
            </svg>
            <div className="absolute inset-[8px] rounded-full" style={{ background: "hsl(220 15% 10%)" }} />

            {/* Keep the red glow ring during scan */}
            <div className="absolute inset-[12px] rounded-full transition-all duration-500" style={{
              background: "radial-gradient(circle at 50% 40%, hsl(0 80% 35%), hsl(0 70% 20%) 60%, hsl(0 60% 12%) 100%)",
              boxShadow: "0 0 30px 8px hsl(0 72% 51% / 0.5), 0 0 60px 15px hsl(0 72% 51% / 0.3), inset 0 -10px 30px hsl(0 50% 10% / 0.8), inset 0 5px 15px hsl(0 80% 50% / 0.3)",
            }} />

            {/* Progress ring on top */}
            <svg className="absolute inset-[8px] w-[calc(100%-16px)] h-[calc(100%-16px)] -rotate-90" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="68" fill="none" stroke="hsl(0 50% 15% / 0.5)" strokeWidth="4" />
              <circle cx="75" cy="75" r="68" fill="none" stroke="hsl(0 72% 51%)"
                strokeWidth="4" strokeDasharray={427} strokeDashoffset={427 - (progress / 100) * 427}
                strokeLinecap="round" className="transition-all duration-200"
                style={{ filter: "drop-shadow(0 0 6px hsl(0 72% 51% / 0.8))" }}
              />
            </svg>

            <div className="absolute inset-[28px] rounded-full flex flex-col items-center justify-center" style={{
              background: "radial-gradient(circle at 50% 35%, hsl(0 60% 25%), hsl(0 50% 15%) 50%, hsl(220 20% 8%) 100%)",
              boxShadow: "inset 0 2px 10px hsl(0 80% 40% / 0.4), inset 0 -5px 15px hsl(0 0% 0% / 0.6)"
            }}>
              <span className="text-xl font-bold text-white/90 tracking-widest">STOP</span>
            </div>
            <div className="absolute inset-[10px] rounded-full scan-glow-pulse pointer-events-none" />
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

  /* RESULTS LIST (also used during "updating") */
  return (
    <div className="flex-1 flex min-h-0 animate-fade-in relative">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Alert */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: "hsl(220 14% 13%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[13px] text-foreground">
              <span className="text-primary font-bold">{outdatedDrivers.length} device drivers</span> <span className="font-semibold">outdated</span>
            </span>
            <button onClick={() => { setScanState("idle"); setProgress(0); }}
              className="text-[11px] text-muted-foreground hover:text-foreground underline ml-2 transition-colors">
              Scan again
            </button>
          </div>
          <div className="flex items-stretch rounded overflow-hidden">
            <button onClick={startUpdateAll}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-5 py-2 transition-colors shadow-lg shadow-primary/30">
              Update Now
            </button>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 border-l border-white/20 transition-colors flex items-center">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* PRO upsell — with X close */}
        {showProBanner && (
          <div className="mx-5 mt-3 rounded-lg px-4 py-2.5 flex items-center justify-between animate-fade-in" style={{ background: "linear-gradient(90deg, hsl(30 60% 15%), hsl(0 40% 15%))", border: "1px solid hsl(30 40% 25%)" }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-bold">⬆</span>
              </div>
              <span className="text-[11px] text-foreground/80">
                Upgrade to <strong className="text-accent">PRO</strong> to update <span className="text-primary font-bold">{outdatedDrivers.filter(d => d.isPro).length}</span> more drivers.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setShowProModal(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground text-[11px] font-bold px-4 py-1.5 rounded transition-colors">Upgrade</button>
              <button onClick={() => setShowProBanner(false)} className="p-0.5 rounded hover:bg-white/10 transition-colors">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Outdated header + search */}
        <div className="flex items-center justify-between px-5 mt-3 mb-2">
          <div className="flex items-center gap-3">
            <Checkbox className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            <span className="text-[11px] text-muted-foreground">Outdated (total: {outdatedDrivers.length}, selected: {selectedDrivers.size})</span>
          </div>
          <div className="flex items-center gap-1">
            {searchOpen && (
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search drivers..."
                autoFocus
                className="text-xs px-2.5 py-1 rounded outline-none transition-all duration-300 w-40 animate-fade-in"
                style={{ background: "hsl(220 14% 16%)", border: "1px solid hsl(220 10% 25%)", color: "hsl(0 0% 90%)" }}
              />
            )}
            <button onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(""); }} className="p-1 hover:bg-white/10 rounded transition-colors">
              {searchOpen ? <X className="w-3.5 h-3.5 text-muted-foreground" /> : <Search className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Driver list */}
        <div className="flex-1 overflow-auto px-5 pb-3 custom-scrollbar">
          <div className="space-y-0.5">
            {filteredOutdated.map((driver, idx) => {
              const isUpdating = currentUpdatingId === driver.id;
              const isUpdated = updatedDrivers.has(driver.id);
              const updateProgress = updatingDrivers.get(driver.id) || 0;

              return (
                <div key={driver.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-white/5 transition-all duration-200 cursor-pointer group/row"
                  style={{
                    background: isUpdated ? "hsl(140 20% 12%)" : "hsl(220 14% 13%)",
                    animationDelay: `${idx * 50}ms`,
                    animation: "fade-in 0.3s ease-out both",
                  }}
                  onClick={() => !isUpdating && setSelectedDetail(driver)}>
                  <Checkbox checked={selectedDrivers.has(driver.id)} onCheckedChange={(e) => { e && toggleDriver(driver.id); }}
                    onClick={e => e.stopPropagation()}
                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                    {iconMap[driver.icon] || <Monitor className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-foreground truncate group-hover/row:text-primary transition-colors">{driver.name}</span>
                      {driver.isPro && (
                        <span className="text-[7px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-bold">PRO</span>
                      )}
                      {isUpdated && <Check className="w-3.5 h-3.5 text-green-400" />}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{driver.category}</div>
                    {isUpdating && (
                      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(220 14% 20%)" }}>
                        <div className="h-full rounded-full bg-primary transition-all duration-150" style={{ width: `${updateProgress}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0 mr-2">
                    <div className="text-[10px] text-muted-foreground">Current: {driver.currentDate}</div>
                    <div className="text-[10px] text-muted-foreground">Available: {driver.newDate}</div>
                  </div>
                  {!isUpdated && !isUpdating && (
                    <div className="flex items-stretch shrink-0 rounded overflow-hidden" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleDriverUpdate(driver)}
                        className={`text-[11px] font-bold px-3.5 py-1.5 transition-colors ${driver.isPro ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground"}`}>
                        Update
                      </button>
                      <button className={`px-1.5 border-l border-white/20 transition-colors flex items-center ${driver.isPro ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground"}`}>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  {isUpdated && (
                    <span className="text-[11px] text-green-400 font-bold shrink-0">Updated ✓</span>
                  )}
                  {isUpdating && (
                    <span className="text-[11px] text-primary font-bold shrink-0 animate-pulse">{Math.round(updateProgress)}%</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Up to date section */}
          <button
            onClick={() => setShowUpToDate(!showUpToDate)}
            className="flex items-center gap-2 mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showUpToDate ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>UpToDate ({upToDateDrivers.length})</span>
          </button>
          {showUpToDate && (
            <div className="mt-2 space-y-0.5 pl-6 animate-fade-in">
              {upToDateDrivers.map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground py-1" style={{ animationDelay: `${i * 30}ms`, animation: "fade-in 0.2s ease-out both" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-end px-5 py-2.5 gap-3 shrink-0" style={{ borderTop: "1px solid hsl(220 10% 18%)" }}>
          <button className="p-2 rounded bg-secondary hover:bg-secondary/80 transition-colors">
            <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" /></svg>
          </button>
          <button onClick={() => setShowActivateModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-7 py-2.5 rounded transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50">
            Activate Now
          </button>
        </div>
      </div>

      {/* PC Info panel */}
      <PCInfoPanel />

      {/* Modals */}
      <ProUpgradeModal open={showProModal} onClose={() => setShowProModal(false)} />
      <ActivateModal open={showActivateModal} onClose={() => setShowActivateModal(false)} />
      {selectedDetail && <DriverDetailPanel driver={selectedDetail} onClose={() => setSelectedDetail(null)} />}
    </div>
  );
}
