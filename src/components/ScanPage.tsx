import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { outdatedDrivers as fallbackOutdated, upToDateDrivers as fallbackUpToDate, scanDriverNames, Driver } from "@/data/drivers";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Monitor, Volume2, Wifi, HardDrive, Mouse, Network, Usb, Info, Search, ChevronRight, X, Check, Crown, Shield, Zap, Star, ArrowLeft, RotateCcw, Trash2, EyeOff, Cpu, MemoryStick } from "lucide-react";
import { detectSystemInfo, detectSystemInfoAsync, getHardwareKeywords, getGPUVendorHint, getDetectedVendors, type SystemInfo } from "@/lib/systemDetection";
import { supabase } from "@/integrations/supabase/client";

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

/* Tick marks around the circle — lights up based on progress */
function TickMarks({ radius, count, progress = 0 }: { radius: number; count: number; progress?: number }) {
  const ticks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    const isLong = i % 5 === 0;
    const r1 = radius - (isLong ? 8 : 5);
    const r2 = radius;
    const rad = (angle * Math.PI) / 180;
    const progressAngle = (progress / 100) * 360;
    const isLit = progress > 0 && angle <= progressAngle;
    ticks.push(
      <line key={i}
        x1={75 + r1 * Math.cos(rad)} y1={75 + r1 * Math.sin(rad)}
        x2={75 + r2 * Math.cos(rad)} y2={75 + r2 * Math.sin(rad)}
        stroke={isLit ? "hsl(0 0% 90%)" : isLong ? "hsl(0 0% 45%)" : "hsl(0 0% 30%)"}
        strokeWidth={isLong ? 1.5 : 0.8}
        className="transition-all duration-150"
      />
    );
  }
  return <g>{ticks}</g>;
}

/* The 3D concentric circle button */
function ScanButton({ label, onClick, glowing = true, progress = 0 }: { label: string; onClick: () => void; glowing?: boolean; progress?: number }) {
  return (
    <div className="relative w-52 h-52 cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95" onClick={onClick}>
      {/* Orbiting particles */}
      {glowing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="scan-particle-1 absolute w-2 h-2 rounded-full" style={{ background: "hsl(0 80% 55%)", boxShadow: "0 0 8px 3px hsl(0 72% 51% / 0.7), 0 0 16px 6px hsl(0 72% 51% / 0.3)" }} />
          <div className="scan-particle-2 absolute w-1.5 h-1.5 rounded-full" style={{ background: "hsl(20 90% 60%)", boxShadow: "0 0 6px 2px hsl(20 80% 55% / 0.7), 0 0 12px 5px hsl(20 80% 55% / 0.3)" }} />
          <div className="scan-particle-3 absolute w-1 h-1 rounded-full" style={{ background: "hsl(0 70% 70%)", boxShadow: "0 0 6px 2px hsl(0 60% 60% / 0.6)" }} />
        </div>
      )}
      {/* Rotating outer glow ring */}
      {glowing && (
        <div className="absolute -inset-3 rounded-full scan-glow-ring pointer-events-none" style={{
          background: "conic-gradient(from 0deg, transparent 0deg, hsl(0 72% 51% / 0.3) 60deg, transparent 120deg, hsl(0 72% 51% / 0.15) 200deg, transparent 260deg, hsl(0 72% 51% / 0.25) 320deg, transparent 360deg)",
          filter: "blur(6px)",
        }} />
      )}
      <div className="absolute inset-0 rounded-full metallic-ring shadow-xl" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 150 150">
        <TickMarks radius={72} count={60} progress={progress} />
      </svg>
      <div className="absolute inset-[8px] rounded-full" style={{ background: "hsl(220 15% 10%)" }} />
      <div className="absolute inset-[12px] rounded-full transition-all duration-500" style={{
        background: "radial-gradient(circle at 50% 40%, hsl(0 80% 35%), hsl(0 70% 20%) 60%, hsl(0 60% 12%) 100%)",
        boxShadow: glowing
          ? "0 0 30px 8px hsl(0 72% 51% / 0.5), 0 0 60px 15px hsl(0 72% 51% / 0.3), inset 0 -10px 30px hsl(0 50% 10% / 0.8), inset 0 5px 15px hsl(0 80% 50% / 0.3)"
          : "inset 0 -10px 30px hsl(0 50% 10% / 0.8), inset 0 5px 15px hsl(0 80% 50% / 0.2)",
      }} />
      {progress > 0 && (
        <svg className="absolute inset-[8px] w-[calc(100%-16px)] h-[calc(100%-16px)] -rotate-90" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="68" fill="none" stroke="hsl(0 50% 15% / 0.5)" strokeWidth="4" />
          <circle cx="75" cy="75" r="68" fill="none" stroke="hsl(0 72% 51%)"
            strokeWidth="4" strokeDasharray={427} strokeDashoffset={427 - (progress / 100) * 427}
            strokeLinecap="round" className="transition-all duration-200"
            style={{ filter: "drop-shadow(0 0 6px hsl(0 72% 51% / 0.8))" }}
          />
        </svg>
      )}
      <div className="absolute inset-[28px] rounded-full flex flex-col items-center justify-center" style={{
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

/* PC Info Panel — uses real system detection */
function PCInfoPanel() {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Global");
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    detectSystemInfoAsync().then(info => setSysInfo(info));
  }, []);

  const categories = [
    { id: "Global", icon: <Monitor className="w-3.5 h-3.5 text-blue-400" /> },
    { id: "Système d'Exploitation", icon: <Monitor className="w-3.5 h-3.5 text-blue-400" /> },
    { id: "Processeur et Carte Mère", icon: <Cpu className="w-3.5 h-3.5 text-green-400" /> },
    { id: "Dispositif de Mémoire", icon: <MemoryStick className="w-3.5 h-3.5 text-green-400" /> },
    { id: "Affichage", icon: <Monitor className="w-3.5 h-3.5 text-blue-400" /> },
    { id: "Stockage", icon: <HardDrive className="w-3.5 h-3.5 text-blue-400" /> },
    { id: "Réseau", icon: <Wifi className="w-3.5 h-3.5 text-green-400" /> },
    { id: "Audio", icon: <Volume2 className="w-3.5 h-3.5 text-green-400" /> },
  ];

  const isElectron = sysInfo?.source === "electron";
  const osLabel = sysInfo ? `${sysInfo.os.name} ${sysInfo.os.version}` : "Detecting...";
  const cpuLabel = sysInfo ? sysInfo.cpu.name : "Detecting...";
  const gpuLabel = sysInfo ? sysInfo.gpu.renderer : "Detecting...";
  const ramLabel = sysInfo?.ram.totalGB ? `${sysInfo.ram.totalGB} GB` : "N/A";
  const displayLabel = sysInfo ? `${sysInfo.display.width} x ${sysInfo.display.height} (${sysInfo.display.pixelRatio}x)` : "Detecting...";
  const networkLabel = sysInfo?.network.type ? `${sysInfo.network.type}${sysInfo.network.downlink ? ` (${sysInfo.network.downlink} Mbps)` : ""}` : (sysInfo?.network.adapters?.length ? `${sysInfo.network.adapters.length} adapter(s)` : "N/A");
  const browserLabel = sysInfo ? `${sysInfo.browser.name} (${sysInfo.browser.language})` : "Detecting...";
  const mbLabel = sysInfo?.motherboard ? `${sysInfo.motherboard.manufacturer} ${sysInfo.motherboard.product}` : "N/A";
  const vramLabel = sysInfo?.gpu.vramMB ? `${sysInfo.gpu.vramMB} MB` : "N/A";
  const gpuDriverLabel = sysInfo?.gpu.driverVersion || "N/A";

  const systemInfo: Record<string, { icon: React.ReactNode; label: string; value: string }[]> = {
    Global: [
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Système d'exploitation", value: osLabel },
      { icon: <Cpu className="w-3.5 h-3.5 text-green-400" />, label: "Processeur", value: cpuLabel },
      { icon: <Monitor className="w-3.5 h-3.5 text-green-400" />, label: "Carte graphique", value: gpuLabel },
      { icon: <MemoryStick className="w-3.5 h-3.5 text-green-400" />, label: "Mémoire", value: ramLabel },
      ...(isElectron ? [{ icon: <HardDrive className="w-3.5 h-3.5 text-blue-400" />, label: "Carte mère", value: mbLabel }] : []),
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Moniteur", value: displayLabel },
      { icon: <Wifi className="w-3.5 h-3.5 text-green-400" />, label: "Réseau", value: networkLabel },
    ],
    "Système d'Exploitation": [
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "OS", value: osLabel },
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Architecture", value: sysInfo?.os.architecture || "N/A" },
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Platform", value: sysInfo?.os.platform || "N/A" },
      ...(sysInfo?.os.hostname ? [{ icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Nom d'hôte", value: sysInfo.os.hostname }] : []),
      ...(sysInfo?.os.uptime ? [{ icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Uptime", value: `${Math.floor(sysInfo.os.uptime / 3600)}h ${Math.floor((sysInfo.os.uptime % 3600) / 60)}m` }] : []),
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Navigateur/Runtime", value: browserLabel },
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Source détection", value: isElectron ? "Electron (natif)" : "Browser (estimé)" },
    ],
    "Processeur et Carte Mère": [
      { icon: <Cpu className="w-3.5 h-3.5 text-green-400" />, label: "Processeur", value: cpuLabel },
      { icon: <Cpu className="w-3.5 h-3.5 text-green-400" />, label: "Cœurs logiques", value: sysInfo ? `${sysInfo.cpu.cores}` : "N/A" },
      ...(sysInfo?.cpu.physicalCores ? [{ icon: <Cpu className="w-3.5 h-3.5 text-green-400" />, label: "Cœurs physiques", value: `${sysInfo.cpu.physicalCores}` }] : []),
      ...(sysInfo?.cpu.speed ? [{ icon: <Cpu className="w-3.5 h-3.5 text-green-400" />, label: "Fréquence", value: `${sysInfo.cpu.speed} MHz` }] : []),
      { icon: <HardDrive className="w-3.5 h-3.5 text-blue-400" />, label: "Carte mère", value: mbLabel },
    ],
    "Dispositif de Mémoire": [
      { icon: <MemoryStick className="w-3.5 h-3.5 text-green-400" />, label: "RAM totale", value: ramLabel },
      ...(sysInfo?.ram.freeGB != null ? [{ icon: <MemoryStick className="w-3.5 h-3.5 text-green-400" />, label: "RAM libre", value: `${sysInfo.ram.freeGB} GB` }] : []),
      ...(sysInfo?.ram.usedGB != null ? [{ icon: <MemoryStick className="w-3.5 h-3.5 text-green-400" />, label: "RAM utilisée", value: `${sysInfo.ram.usedGB} GB` }] : []),
      ...(sysInfo?.ram.modules?.map((m, i) => ({
        icon: <MemoryStick className="w-3.5 h-3.5 text-green-400" />,
        label: `Module ${i + 1}`,
        value: `${m.capacityGB} GB ${m.manufacturer}${m.speedMHz ? ` @ ${m.speedMHz} MHz` : ""}`,
      })) || []),
    ],
    "Affichage": [
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "GPU", value: gpuLabel },
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Vendor", value: sysInfo?.gpu.vendor || "N/A" },
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "VRAM", value: vramLabel },
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Version pilote", value: gpuDriverLabel },
      ...(sysInfo?.gpu.additionalGPUs?.map((g, i) => ({
        icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />,
        label: `GPU ${i + 2}`,
        value: `${g.name} (${g.vramMB} MB)`,
      })) || []),
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Résolution", value: displayLabel },
      { icon: <Monitor className="w-3.5 h-3.5 text-blue-400" />, label: "Profondeur couleur", value: sysInfo ? `${sysInfo.display.colorDepth} bits` : "N/A" },
    ],
    "Stockage": [
      ...(sysInfo?.disks?.map((d, i) => ({
        icon: <HardDrive className="w-3.5 h-3.5 text-blue-400" />,
        label: `Disque ${i + 1}`,
        value: `${d.model} (${d.sizeGB} GB, ${d.interface || d.mediaType || "N/A"})`,
      })) || [{ icon: <HardDrive className="w-3.5 h-3.5 text-blue-400" />, label: "Stockage", value: isElectron ? "Aucun disque détecté" : "Nécessite Electron" }]),
    ],
    "Réseau": [
      ...(sysInfo?.network.adapters?.map((a, i) => ({
        icon: <Wifi className="w-3.5 h-3.5 text-green-400" />,
        label: a.manufacturer || `Adaptateur ${i + 1}`,
        value: a.name,
      })) || []),
      { icon: <Wifi className="w-3.5 h-3.5 text-green-400" />, label: "Type connexion", value: sysInfo?.network.type || "N/A" },
      { icon: <Wifi className="w-3.5 h-3.5 text-green-400" />, label: "Débit", value: sysInfo?.network.downlink ? `${sysInfo.network.downlink} Mbps` : "N/A" },
    ],
    "Audio": [
      ...(sysInfo?.audio?.map((a, i) => ({
        icon: <Volume2 className="w-3.5 h-3.5 text-green-400" />,
        label: a.manufacturer || `Périphérique ${i + 1}`,
        value: a.name,
      })) || [{ icon: <Volume2 className="w-3.5 h-3.5 text-green-400" />, label: "Audio", value: isElectron ? "Aucun périphérique" : "Nécessite Electron" }]),
    ],
  };

  // Mini panel on right edge — expands on hover
  if (!expanded) {
    return (
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Collapsed tab */}
        <div
          className={`transition-all duration-300 rounded-l-lg overflow-hidden ${hovered ? "w-[200px]" : "w-[36px]"}`}
          style={{ background: "hsl(220 16% 13% / 0.97)", border: "1px solid hsl(220 10% 20%)", borderRight: "none" }}
        >
          {!hovered ? (
            <div className="flex flex-col items-center py-3 gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[8px] text-green-400 font-bold">LIVE</span>
            </div>
          ) : (
            <>
              <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-bold text-foreground tracking-wide uppercase">Infos sur le PC</span>
                <span className="ml-auto text-[8px] text-green-400 font-bold">LIVE</span>
              </div>
              <div className="px-3 py-2 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Monitor className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">{osLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Cpu className="w-3 h-3 text-green-400 shrink-0" />
                  <span className="truncate">{cpuLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Monitor className="w-3 h-3 text-green-400 shrink-0" />
                  <span className="truncate">{gpuLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <MemoryStick className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>{ramLabel}</span>
                </div>
              </div>
              <button onClick={() => setExpanded(true)} className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors py-2 hover:bg-white/5" style={{ borderTop: "1px solid hsl(220 10% 18%)" }}>
                <span>•••</span>
                <span>En apprendre plus</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Full system info dialog
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={() => setExpanded(false)}>
      <div className="w-[680px] max-h-[480px] rounded-lg overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}
        style={{ background: "hsl(220 16% 12%)", border: "1px solid hsl(220 10% 22%)" }}>
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{ background: "hsl(220 14% 10%)", borderBottom: "1px solid hsl(220 10% 18%)" }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm2 8H6v-1c0-1 .5-1.5 2-1.5s2 .5 2 1.5v1z"/></svg>
            </div>
            <span className="text-xs font-bold text-foreground">Informations système (détection réelle)</span>
            <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">LIVE</span>
          </div>
          <button onClick={() => setExpanded(false)} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-[180px] shrink-0 py-2 overflow-auto custom-scrollbar" style={{ background: "hsl(220 16% 11%)", borderRight: "1px solid hsl(220 10% 18%)" }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[11px] transition-all duration-200 ${selectedCategory === cat.id ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
                {cat.icon}
                <span className="truncate">{cat.id}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-auto custom-scrollbar">
            <div className="space-y-1">
              {(systemInfo[selectedCategory] || systemInfo.Global).map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 text-[11px]" style={{ borderBottom: "1px solid hsl(220 10% 16%)" }}>
                  {item.icon}
                  <span className="w-[120px] shrink-0 text-muted-foreground">{item.label}</span>
                  <span className="text-foreground/80 truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-4 py-3 shrink-0" style={{ borderTop: "1px solid hsl(220 10% 18%)" }}>
          <button onClick={() => setExpanded(false)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold px-6 py-2 rounded transition-all duration-200">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* PRO Upgrade Modal — matches screenshot with guarantee badge and status bar */
function ProUpgradeModal({ open, onClose, drivers }: { open: boolean; onClose: () => void; drivers: Driver[] }) {
  if (!open) return null;
  const proDrivers = drivers.filter(d => d.isPro);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="w-[600px] rounded-lg overflow-hidden flex animate-scale-in" onClick={e => e.stopPropagation()}
        style={{ background: "hsl(220 16% 12%)", border: "1px solid hsl(220 10% 22%)" }}>
        {/* Left — Guarantee */}
        <div className="w-[200px] shrink-0 flex flex-col items-center justify-center p-6 text-center" style={{ background: "hsl(220 16% 10%)", borderRight: "1px solid hsl(220 10% 18%)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ border: "3px solid hsl(30 60% 40%)", background: "hsl(30 40% 15%)" }}>
            <div className="text-center">
              <div className="text-[8px] text-accent font-bold uppercase">Satisfaction</div>
              <div className="text-lg font-black text-accent">60</div>
              <div className="text-[7px] text-accent font-bold uppercase">Days</div>
              <div className="text-[7px] text-accent">Money Back</div>
            </div>
          </div>
          <p className="text-xs font-bold text-foreground mb-3">Guaranteed to keep your drivers up-to-date</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">You're fully protected by our 100% money back guarantee within 60 days. No question asked.</p>
        </div>

        {/* Right — Content */}
        <div className="flex-1 p-6 relative">
          <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <h2 className="text-xl font-bold text-foreground mb-4">More Updates Found!</h2>
          
          {/* Device status bar */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-muted-foreground">Your current device status:</span>
            <div className="flex-1 h-4 rounded overflow-hidden flex">
              <div className="w-[20%] bg-green-500" />
              <div className="w-[15%] bg-green-400" />
              <div className="w-[15%] bg-yellow-400" />
              <div className="w-[15%] bg-orange-400" />
              <div className="w-[15%] bg-orange-500" />
              <div className="w-[20%] bg-red-500" />
            </div>
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-foreground -ml-[45%]" />
          </div>

          <p className="text-sm text-accent font-bold mb-3">
            {proDrivers.length} device drivers & game drivers can be updated with the PRO edition:
          </p>

          <div className="space-y-2 mb-3 max-h-[120px] overflow-auto custom-scrollbar">
            {proDrivers.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                <div className="w-4 h-4 rounded bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                  {iconMap[d.icon] || <Monitor className="w-2.5 h-2.5" />}
                </div>
                <span>{d.name}</span>
              </div>
            ))}
          </div>

          <button className="text-xs text-blue-400 hover:underline mb-4">More...</button>

          <p className="text-xs text-muted-foreground mb-4">Upgrade to PRO now at the best price.</p>

          <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-8 py-3 rounded transition-all duration-200 shadow-lg shadow-primary/30 float-right">
            Upgrade Now
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

/* Driver Detail Panel — matches screenshot with WHQL badge, table, action buttons */
function DriverDetailPanel({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="w-[520px] rounded-lg overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}
        style={{ background: "hsl(220 16% 12%)", border: "1px solid hsl(220 10% 22%)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "hsl(220 14% 10%)", borderBottom: "1px solid hsl(220 10% 18%)" }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7"/></svg>
            </div>
            <span className="text-xs font-bold text-foreground">Driver Details</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="text-[11px] text-muted-foreground mb-1">{driver.category}</div>
          <h3 className="text-base font-bold text-foreground mb-2">{driver.name}</h3>
          
          {/* WHQL badge */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-[11px] text-green-400">This driver has passed WHQL Test and strict IObit Review Rules.</span>
          </div>

          <div className="flex gap-5">
            {/* Details table */}
            <div className="flex-1">
              <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(220 10% 20%)" }}>
                    <th className="text-left py-2 px-3 text-muted-foreground font-bold">Details</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-bold">Current</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-bold">Available</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
                    <td className="py-2 px-3 text-muted-foreground">Version:</td>
                    <td className="py-2 px-3 text-foreground/80">{driver.currentVersion}</td>
                    <td className="py-2 px-3 text-foreground/80">{driver.newVersion} (1.52 MB)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
                    <td className="py-2 px-3 text-muted-foreground">Date:</td>
                    <td className="py-2 px-3 text-foreground/80">{driver.currentDate}</td>
                    <td className="py-2 px-3 text-foreground/80">{driver.newDate}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
                    <td className="py-2 px-3 text-muted-foreground">Publisher:</td>
                    <td className="py-2 px-3 text-foreground/80">Intel Corporation</td>
                    <td className="py-2 px-3 text-foreground/80">INTEL</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="w-[110px] shrink-0 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center mb-1">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <button className={`w-full text-xs font-bold py-2 rounded transition-all duration-200 ${driver.isPro ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>
                Update
              </button>
              <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors hover:underline">Roll Back</button>
              <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors hover:underline">Uninstall</button>
              <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors hover:underline">Ignore</button>
            </div>
          </div>

          {/* Devices using this driver */}
          <div className="mt-4 rounded-lg overflow-hidden" style={{ border: "1px solid hsl(220 10% 20%)" }}>
            <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground" style={{ background: "hsl(220 14% 14%)" }}>
              Devices using this driver (1)
            </div>
            <div className="px-3 py-2 text-[11px] text-foreground/80" style={{ background: "hsl(220 16% 11%)" }}>
              {driver.name}
            </div>
          </div>
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showProModal, setShowProModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Driver | null>(null);
  const [showProBanner, setShowProBanner] = useState(true);

  // Dynamic driver data from Supabase
  const [outdatedDrivers, setOutdatedDrivers] = useState<Driver[]>(fallbackOutdated);
  const [upToDateDrivers, setUpToDateDrivers] = useState<string[]>(fallbackUpToDate);
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set(fallbackOutdated.map(d => d.id)));
  const [dataSource, setDataSource] = useState<"local" | "cloud">("local");

  // Update simulation state
  const [updatingDrivers, setUpdatingDrivers] = useState<Map<string, number>>(new Map());
  const [updatedDrivers, setUpdatedDrivers] = useState<Set<string>>(new Set());
  const [currentUpdatingId, setCurrentUpdatingId] = useState<string | null>(null);

  // Session ID and update timing
  const sessionIdRef = useRef(crypto.randomUUID());
  const updateStartTimeRef = useRef<number>(0);

  // Category map for grouping
  const categoryGroups: Record<string, { label: string; icon: React.ReactNode; match: string[] }> = {
    all: { label: "Tous", icon: <Monitor className="w-3 h-3" />, match: [] },
    gpu: { label: "GPU", icon: <Monitor className="w-3 h-3" />, match: ["display adapters"] },
    audio: { label: "Audio", icon: <Volume2 className="w-3 h-3" />, match: ["sound, video and game controllers"] },
    network: { label: "Réseau", icon: <Wifi className="w-3 h-3" />, match: ["network adapters", "bluetooth"] },
    storage: { label: "Stockage", icon: <HardDrive className="w-3 h-3" />, match: ["storage controllers", "ide ata/atapi controllers"] },
    usb: { label: "USB", icon: <Usb className="w-3 h-3" />, match: ["universal serial bus controllers"] },
    input: { label: "Périph.", icon: <Mouse className="w-3 h-3" />, match: ["human interface devices", "mice and other pointing devices", "biometric devices", "imaging devices"] },
    system: { label: "Système", icon: <HardDrive className="w-3 h-3" />, match: ["system devices", "print queues"] },
  };

  const filteredOutdated = useMemo(() => {
    let drivers = outdatedDrivers;
    if (categoryFilter !== "all") {
      const group = categoryGroups[categoryFilter];
      if (group) {
        drivers = drivers.filter(d => group.match.some(m => d.category.toLowerCase().includes(m)));
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      drivers = drivers.filter(d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    return drivers;
  }, [searchQuery, outdatedDrivers, categoryFilter]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: outdatedDrivers.length };
    for (const [key, group] of Object.entries(categoryGroups)) {
      if (key === "all") continue;
      counts[key] = outdatedDrivers.filter(d => group.match.some(m => d.category.toLowerCase().includes(m))).length;
    }
    return counts;
  }, [outdatedDrivers]);

  const startScan = useCallback(() => {
    setScanState("scanning");
    setProgress(0);
    setUpdatingDrivers(new Map());
    setUpdatedDrivers(new Set());
    setCurrentUpdatingId(null);

    // Fetch real driver data from Supabase with vendor-targeted filtering
    detectSystemInfoAsync().then(asyncSysInfo => {
      const keywords = getHardwareKeywords(asyncSysInfo);
      const gpuVendor = getGPUVendorHint(asyncSysInfo);
      const detectedVendors = getDetectedVendors(asyncSysInfo);
      
      return supabase.functions.invoke('get-driver-info', {
        body: { hardware_keywords: keywords, os: asyncSysInfo.os.name.toLowerCase(), gpu_vendor: gpuVendor, detected_vendors: detectedVendors },
      }).then(({ data, error }) => {
        const sysInfo = asyncSysInfo;
      if (!error && data?.outdated) {
        const drivers: Driver[] = data.outdated.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          currentVersion: d.currentVersion,
          currentDate: d.currentDate,
          newVersion: d.newVersion,
          newDate: d.newDate,
          isPro: d.isPro,
          icon: d.icon,
          matchConfidence: d.matchConfidence || 'generic',
        }));
        setOutdatedDrivers(drivers);
        setSelectedDrivers(new Set(drivers.map(d => d.id)));
        setUpToDateDrivers(data.upToDate || fallbackUpToDate);
        setDataSource("cloud");

        // Log scan to history
        supabase.from('scan_history').insert({
          session_id: sessionIdRef.current,
          os_detected: `${sysInfo.os.name} ${sysInfo.os.version}`,
          cpu_detected: sysInfo.cpu.name,
          gpu_detected: sysInfo.gpu.renderer,
          ram_gb: sysInfo.ram.totalGB,
          drivers_found: drivers.length + (data.upToDate?.length || 0),
          outdated_count: drivers.length,
          up_to_date_count: data.upToDate?.length || 0,
        }).then(() => {});
      }
      });
    }).catch(() => {
      // Fallback to local data
      setDataSource("local");
    });
  }, []);

  const stopScan = useCallback(() => {
    setScanState("idle");
    setProgress(0);
  }, []);

  // Scan progress animation
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
          setTimeout(() => {
            setUpdatedDrivers(prev2 => {
              const n = new Set(prev2);
              n.add(currentUpdatingId);
              return n;
            });
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

  /* SCANNING — keep red glow + progress ring + lit tick marks */
  if (scanState === "scanning") {
    return (
      <div className="flex-1 flex relative">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 animate-fade-in">
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-foreground">Scanning...</h2>
            <p className="text-sm text-muted-foreground mt-1 transition-all duration-200">{currentDriver}</p>
          </div>

          <ScanButton label="STOP" onClick={stopScan} glowing={true} progress={progress} />

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
        {/* Alert bar */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: "hsl(220 14% 13%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[13px] text-foreground">
              <span className="text-primary font-bold">{outdatedDrivers.length} device drivers</span> <span className="font-semibold">outdated</span>
            </span>
            {dataSource === "cloud" && (
              <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold ml-2">CLOUD</span>
            )}
            <button onClick={() => { setScanState("idle"); setProgress(0); }}
              className="text-[11px] text-muted-foreground hover:text-foreground underline ml-2 transition-colors">
              Scan again
            </button>
          </div>
          {/* Update Now — same height button + dropdown */}
          <div className="flex items-stretch rounded overflow-hidden h-8">
            <button onClick={startUpdateAll}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-5 transition-colors shadow-lg shadow-primary/30">
              Update Now
            </button>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 border-l border-white/20 transition-colors flex items-center">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Global update progress bar */}
        {scanState === "updating" && (() => {
          const freeSelected = outdatedDrivers.filter(d => !d.isPro && selectedDrivers.has(d.id));
          const totalDrivers = freeSelected.length;
          if (totalDrivers === 0) return null;
          const completedCount = freeSelected.filter(d => updatedDrivers.has(d.id)).length;
          const currentProgress = currentUpdatingId ? (updatingDrivers.get(currentUpdatingId) || 0) : 0;
          const globalProgress = ((completedCount + currentProgress / 100) / totalDrivers) * 100;
          const currentName = freeSelected.find(d => d.id === currentUpdatingId)?.name || "";
          return (
            <div className="mx-5 mt-3 rounded-lg p-3 animate-fade-in" style={{ background: "hsl(220 14% 13%)", border: "1px solid hsl(220 10% 20%)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[11px] font-bold text-foreground">
                    Mise à jour en cours... {completedCount}/{totalDrivers}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-primary">{Math.round(globalProgress)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(220 14% 20%)" }}>
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-150" style={{ width: `${globalProgress}%` }} />
              </div>
              {currentName && (
                <div className="text-[10px] text-muted-foreground mt-1.5 truncate">
                  ▸ {currentName}
                </div>
              )}
            </div>
          );
        })()}

        {/* PRO upsell banner */}
        {showProBanner && (
          <div className="mx-5 mt-3 rounded-lg px-4 py-2.5 flex items-center justify-between animate-fade-in" style={{ background: "linear-gradient(90deg, hsl(30 60% 15%), hsl(0 40% 15%))", border: "1px solid hsl(30 40% 25%)" }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-bold">🛒</span>
              </div>
              <span className="text-[11px] text-foreground/80">
                Upgrade to <strong className="text-accent">PRO edition</strong> to update <span className="text-primary font-bold">{outdatedDrivers.filter(d => d.isPro).length} more</span> device drivers & game drivers.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setShowProModal(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground text-[11px] font-bold px-5 py-1.5 rounded transition-colors">Upgrade</button>
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

        {/* Category filter bar */}
        <div className="flex items-center gap-1.5 px-5 mb-2 overflow-x-auto custom-scrollbar">
          {Object.entries(categoryGroups).map(([key, group]) => {
            const count = categoryCounts[key] || 0;
            if (key !== "all" && count === 0) return null;
            const isActive = categoryFilter === key;
            return (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                }`}
              >
                {group.icon}
                <span>{group.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary/30 text-primary" : "bg-white/10 text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>


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
                  <Checkbox checked={selectedDrivers.has(driver.id)} onCheckedChange={() => toggleDriver(driver.id)}
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
                      {driver.matchConfidence === 'exact' && (
                        <span className="text-[7px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" /> Vérifié
                        </span>
                      )}
                      {driver.matchConfidence === 'partial' && (
                        <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">Compatible</span>
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
                    <div className="flex items-stretch shrink-0 rounded overflow-hidden h-7" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleDriverUpdate(driver)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground text-[11px] font-bold px-3.5 transition-colors">
                        Update
                      </button>
                      <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-1.5 border-l border-white/20 transition-colors flex items-center">
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  {isUpdated && (
                    <span className="text-[11px] text-green-400 font-bold shrink-0 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Up-to-date
                    </span>
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
            <div className="mt-2 space-y-0.5 animate-fade-in">
              {upToDateDrivers.map((name, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded text-[11px] text-muted-foreground" 
                  style={{ background: "hsl(220 14% 13%)", animationDelay: `${i * 30}ms`, animation: "fade-in 0.2s ease-out both" }}>
                  <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center shrink-0">
                    <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground/70">{name}</div>
                    <div className="text-[10px] text-muted-foreground">Périphériques système</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Current: 11/15/2024</span>
                  <span className="text-[11px] text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Up-to-date
                  </span>
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
      <ProUpgradeModal open={showProModal} onClose={() => setShowProModal(false)} drivers={outdatedDrivers} />
      <ActivateModal open={showActivateModal} onClose={() => setShowActivateModal(false)} />
      {selectedDetail && <DriverDetailPanel driver={selectedDetail} onClose={() => setSelectedDetail(null)} />}
    </div>
  );
}
