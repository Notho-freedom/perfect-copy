import { useState, useEffect, useCallback } from "react";
import { outdatedDrivers, upToDateDrivers, scanDriverNames, Driver } from "@/data/drivers";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Monitor, Volume2, Wifi, HardDrive, Mouse, Network, Usb, Info } from "lucide-react";

type ScanState = "idle" | "scanning" | "results";

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-4 h-4" />,
  Volume2: <Volume2 className="w-4 h-4" />,
  Wifi: <Wifi className="w-4 h-4" />,
  Network: <Network className="w-4 h-4" />,
  Usb: <Usb className="w-4 h-4" />,
  HardDrive: <HardDrive className="w-4 h-4" />,
  Mouse: <Mouse className="w-4 h-4" />,
};

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
          setTimeout(() => setScanState("results"), 300);
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

  if (scanState === "idle") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded px-4 py-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">Scan to check the status of drivers!</span>
        </div>
        <button
          onClick={startScan}
          className="w-44 h-44 rounded-full flex items-center justify-center text-2xl font-bold text-white scan-glow scan-glow-pulse transition-transform hover:scale-105 cursor-pointer"
          style={{ background: "radial-gradient(circle, hsl(0 72% 51%), hsl(0 72% 35%))" }}
        >
          SCAN
        </button>
        <p className="text-xs text-gray-500">Click to scan for outdated drivers</p>
      </div>
    );
  }

  if (scanState === "scanning") {
    const circumference = 2 * Math.PI * 68;
    const offset = circumference - (progress / 100) * circumference;
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="68" fill="none" stroke="hsl(220 12% 22%)" strokeWidth="6" />
            <circle cx="75" cy="75" r="68" fill="none" stroke="hsl(0 72% 51%)" strokeWidth="6"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round" className="transition-all duration-200" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
            <span className="text-xs text-gray-400">Scanning...</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 h-5 text-center">{currentDriver}</p>
        <button onClick={stopScan} className="px-6 py-2 rounded text-sm font-semibold border border-gray-500 text-gray-300 hover:bg-white/10 transition-colors">
          STOP
        </button>
      </div>
    );
  }

  // Results
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top alert */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 font-bold text-sm">{outdatedDrivers.length}</span>
          </div>
          <div>
            <span className="text-sm text-gray-200 font-semibold">{outdatedDrivers.length} device drivers need updating</span>
            <button onClick={() => { setScanState("idle"); }} className="text-xs text-blue-400 hover:underline ml-3">Scan again</button>
          </div>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded transition-colors">
          Update Now
        </button>
      </div>

      {/* PRO upsell */}
      <div className="mx-4 mt-3 rounded px-4 py-2 flex items-center justify-between" style={{ background: "linear-gradient(90deg, hsl(30 80% 20%), hsl(0 50% 18%))" }}>
        <span className="text-xs text-orange-300">⭐ Upgrade to <strong>PRO</strong> for 3x faster download speed & auto updates</span>
        <button className="text-[10px] bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded font-semibold transition-colors">Upgrade</button>
      </div>

      {/* Driver list */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="space-y-1">
          {outdatedDrivers.map(driver => (
            <div key={driver.id} className="flex items-center gap-3 rounded px-3 py-2.5 hover:bg-white/5 transition-colors" style={{ background: "hsl(220 14% 15%)" }}>
              <Checkbox checked={selectedDrivers.has(driver.id)} onCheckedChange={() => toggleDriver(driver.id)}
                className="border-gray-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" />
              <div className="text-gray-400">{iconMap[driver.icon] || <Monitor className="w-4 h-4" />}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-200 truncate">{driver.name}</span>
                  {driver.isPro && <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">PRO</span>}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {driver.currentVersion} ({driver.currentDate}) → {driver.newVersion} ({driver.newDate})
                </div>
              </div>
              <button className="text-[11px] border border-gray-600 text-gray-300 hover:bg-white/10 px-3 py-1 rounded transition-colors">Update</button>
            </div>
          ))}
        </div>

        {/* Up to date section */}
        <button
          onClick={() => setShowUpToDate(!showUpToDate)}
          className="flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          {showUpToDate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>Up To Date ({upToDateDrivers.length})</span>
        </button>
        {showUpToDate && (
          <div className="mt-2 space-y-1 pl-4">
            {upToDateDrivers.map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-500 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500/60" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PC Info sidebar */}
      <div className="mx-4 mb-4 rounded p-3" style={{ background: "hsl(220 14% 15%)" }}>
        <div className="text-xs font-semibold text-gray-300 mb-2">💻 PC Info</div>
        <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-400">
          <span>OS: Windows 11 Pro 23H2</span>
          <span>CPU: Intel Core i7-10750H</span>
          <span>GPU: NVIDIA RTX 3060</span>
          <span>RAM: 16 GB DDR4</span>
        </div>
      </div>
    </div>
  );
}
