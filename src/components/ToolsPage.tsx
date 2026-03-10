import { useState, useEffect, useCallback, useRef } from "react";
import { outdatedDrivers, upToDateDrivers } from "@/data/drivers";
import { detectSystemInfoAsync, type SystemInfo } from "@/lib/systemDetection";

type ToolView =
  | "main"
  | "backup"
  | "no-sound"
  | "device-error"
  | "clean-invalid"
  | "network-failure"
  | "bad-resolution"
  | "incompatible"
  | "offline-updater"
  | "system-info"
  | "vpn"
  | "screen-recorder";

/* ───── shared sub-header ───── */
function ToolHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors" style={{ background: "hsl(220 14% 18%)" }}>
        <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <div className="w-1 h-4 bg-primary rounded-full" />
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
    </div>
  );
}

/* ───── progress bar ───── */
function ToolProgress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="space-y-2">
      {label && <div className="text-xs text-muted-foreground">{label}</div>}
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "hsl(220 12% 18%)" }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${value}%`, background: "hsl(var(--primary))" }} />
      </div>
      <div className="text-xs text-primary font-semibold text-right">{value}%</div>
    </div>
  );
}

/* panel card */
const panelBg = "hsl(220 14% 14%)";
const panelBorder = "1px solid hsl(220 10% 20%)";
const circleBg = "hsl(220 12% 18%)";

function StatusIcon({ status }: { status: "ok" | "warn" | "error" | "pending" }) {
  const colors = { ok: "hsl(140 60% 45%)", warn: "hsl(45 90% 55%)", error: "hsl(0 72% 51%)", pending: "hsl(0 0% 40%)" };
  const icons = {
    ok: <path d="M20 6L9 17l-5-5" />,
    warn: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
    error: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>,
    pending: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  };
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={colors[status]} strokeWidth="2">{icons[status]}</svg>
  );
}

/* ═════════════════════ 1. BACKUP & RESTORE ═════════════════════ */
function BackupRestoreTool({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"backup" | "restore">("backup");
  const [backing, setBacking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const allDrivers = [...outdatedDrivers.map(d => d.name), ...upToDateDrivers];
  const [selected, setSelected] = useState<Set<string>>(new Set(allDrivers));

  const startBackup = useCallback(() => {
    setBacking(true); setProgress(0); setDone(false);
    let p = 0;
    const iv = setInterval(() => { p += Math.random() * 8 + 2; if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => { setBacking(false); setDone(true); }, 400); } setProgress(Math.min(100, Math.round(p))); }, 200);
  }, []);

  const fakeBackups = [
    { date: "2024-03-15 14:32", drivers: 18, size: "124 MB" },
    { date: "2024-02-28 09:15", drivers: 16, size: "112 MB" },
    { date: "2024-01-10 16:45", drivers: 15, size: "108 MB" },
  ];
  const [restoring, setRestoring] = useState<number | null>(null);
  const [restored, setRestored] = useState<Set<number>>(new Set());

  const startRestore = (idx: number) => {
    setRestoring(idx);
    setTimeout(() => { setRestoring(null); setRestored(prev => new Set(prev).add(idx)); }, 2500);
  };

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Backup & Restore" onBack={onBack} />
      {/* tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: circleBg }}>
        {(["backup", "restore"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t === "backup" ? "Backup Drivers" : "Restore Drivers"}</button>
        ))}
      </div>

      {tab === "backup" ? (
        <div className="space-y-3">
          {done && (
            <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: "hsl(140 60% 45% / 0.1)", border: "1px solid hsl(140 60% 45% / 0.3)" }}>
              <StatusIcon status="ok" />
              <div>
                <div className="text-sm font-semibold text-foreground">Backup Complete!</div>
                <div className="text-xs text-muted-foreground">Saved to C:\DriverBooster\Backup\{new Date().toISOString().slice(0, 10)}\</div>
              </div>
            </div>
          )}
          {backing ? (
            <div className="rounded-lg p-5 space-y-4" style={{ background: panelBg, border: panelBorder }}>
              <div className="text-sm text-foreground font-medium">Backing up {selected.size} drivers...</div>
              <ToolProgress value={progress} label={allDrivers[Math.min(Math.floor(progress / 100 * allDrivers.length), allDrivers.length - 1)]} />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={selected.size === allDrivers.length} onChange={e => setSelected(e.target.checked ? new Set(allDrivers) : new Set())} className="accent-primary" />
                  Select All ({allDrivers.length})
                </label>
                <button onClick={startBackup} disabled={selected.size === 0} className="px-4 py-2 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors btn-press">
                  Backup Selected ({selected.size})
                </button>
              </div>
              <div className="space-y-1 max-h-[350px] overflow-auto custom-scrollbar">
                {allDrivers.map(name => (
                  <label key={name} className="flex items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-secondary/40 transition-colors" style={{ background: panelBg, border: panelBorder }}>
                    <input type="checkbox" checked={selected.has(name)} onChange={() => { const s = new Set(selected); s.has(name) ? s.delete(name) : s.add(name); setSelected(s); }} className="accent-primary" />
                    <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /></svg>
                    <span className="text-xs text-foreground truncate">{name}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {fakeBackups.map((b, i) => (
            <div key={i} className="rounded-lg p-4 flex items-center justify-between hover-lift hover-glow" style={{ background: panelBg, border: panelBorder }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: circleBg }}>
                  <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                </div>
                <div>
                  <div className="text-xs text-foreground font-medium">{b.date}</div>
                  <div className="text-[11px] text-muted-foreground">{b.drivers} drivers • {b.size}</div>
                </div>
              </div>
              {restored.has(i) ? (
                <span className="text-xs text-[hsl(140_60%_45%)] font-semibold flex items-center gap-1"><StatusIcon status="ok" /> Restored</span>
              ) : restoring === i ? (
                <span className="text-xs text-primary animate-pulse">Restoring...</span>
              ) : (
                <button onClick={() => startRestore(i)} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 btn-press">Restore</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ 2. FIX NO SOUND ═════════════════════ */
function FixNoSoundTool({ onBack }: { onBack: () => void }) {
  type Step = { name: string; status: "pending" | "ok" | "warn" | "error"; detail: string };
  const [steps, setSteps] = useState<Step[]>([
    { name: "Windows Audio Service", status: "pending", detail: "" },
    { name: "Audio Driver Status", status: "pending", detail: "" },
    { name: "Audio Output Device", status: "pending", detail: "" },
    { name: "Audio Endpoint Builder", status: "pending", detail: "" },
    { name: "Volume Mixer Settings", status: "pending", detail: "" },
  ]);
  const [scanning, setScanning] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);
  const stepIdx = useRef(0);

  useEffect(() => {
    if (!scanning) return;
    const results: Array<Pick<Step, "status" | "detail">> = [
      { status: "ok", detail: "Service running (Automatic)" },
      { status: "warn", detail: "Realtek HD Audio — driver outdated (v6.0.9235.1)" },
      { status: "ok", detail: "Speakers (Realtek High Definition Audio) — Default" },
      { status: "error", detail: "Service stopped — needs restart" },
      { status: "ok", detail: "Master volume at 78%" },
    ];
    const iv = setInterval(() => {
      if (stepIdx.current >= steps.length) { clearInterval(iv); setScanning(false); return; }
      setSteps(prev => prev.map((s, i) => i === stepIdx.current ? { ...s, ...results[i] } : s));
      stepIdx.current++;
    }, 900);
    return () => clearInterval(iv);
  }, [scanning]);

  const doFix = () => {
    setFixing(true);
    setTimeout(() => {
      setSteps(prev => prev.map(s => s.status !== "ok" ? { ...s, status: "ok", detail: s.detail + " — Fixed ✓" } : s));
      setFixing(false); setFixed(true);
    }, 3000);
  };

  const hasIssues = steps.some(s => s.status === "warn" || s.status === "error");

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Fix No Sound" onBack={onBack} />
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="rounded-lg p-4 flex items-center gap-4 transition-all" style={{ background: panelBg, border: panelBorder, opacity: s.status === "pending" && scanning ? 0.5 : 1 }}>
            {s.status === "pending" && scanning && stepIdx.current === i ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <StatusIcon status={s.status} />
            )}
            <div className="flex-1">
              <div className="text-xs text-foreground font-medium">{s.name}</div>
              {s.detail && <div className="text-[11px] text-muted-foreground mt-0.5">{s.detail}</div>}
            </div>
          </div>
        ))}
      </div>
      {!scanning && (
        <div className="mt-5 flex justify-center">
          {fixed ? (
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(140 60% 45%)" }}>
              <StatusIcon status="ok" /> All audio issues fixed!
            </div>
          ) : fixing ? (
            <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Fixing issues...
            </div>
          ) : hasIssues ? (
            <button onClick={doFix} className="px-6 py-2.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 btn-press">Fix {steps.filter(s => s.status !== "ok").length} Issues</button>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(140 60% 45%)" }}>
              <StatusIcon status="ok" /> No audio issues detected!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ 3. FIX DEVICE ERROR (PRO) ═════════════════════ */
function FixDeviceErrorTool({ onBack }: { onBack: () => void }) {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);

  const errors = [
    { device: "PCI Data Acquisition and Signal Processing Controller", code: 28, desc: "The drivers for this device are not installed" },
    { device: "Unknown Device (ACPI\\INT3403)", code: 10, desc: "This device cannot start" },
    { device: "USB2.0 Hub", code: 43, desc: "Windows has stopped this device because it has reported problems" },
  ];

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => { p += Math.random() * 6 + 3; if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setScanning(false), 500); } setProgress(Math.min(100, Math.round(p))); }, 180);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Fix Device Error" onBack={onBack} />
      <div className="rounded-lg px-3 py-1.5 text-[10px] font-bold text-white inline-block mb-4" style={{ background: "hsl(var(--accent))" }}>PRO FEATURE</div>

      {scanning ? (
        <div className="rounded-lg p-6 space-y-4" style={{ background: panelBg, border: panelBorder }}>
          <div className="text-sm text-foreground">Scanning for device errors...</div>
          <ToolProgress value={progress} label="Checking Device Manager entries..." />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg p-3 flex items-center gap-2 mb-4" style={{ background: "hsl(0 72% 51% / 0.1)", border: "1px solid hsl(0 72% 51% / 0.3)" }}>
            <StatusIcon status="error" />
            <span className="text-xs text-foreground">{errors.length} device errors detected</span>
          </div>
          {errors.map((e, i) => (
            <div key={i} className="rounded-lg p-4" style={{ background: panelBg, border: panelBorder }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: circleBg }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="hsl(0 72% 51%)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground font-medium truncate">{e.device}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Error Code {e.code}: {e.desc}</div>
                </div>
              </div>
            </div>
          ))}
          {/* PRO overlay */}
          <div className="relative mt-4">
            <button disabled className="w-full px-6 py-3 rounded-md text-sm font-semibold bg-primary/30 text-primary-foreground/50 cursor-not-allowed">Fix All Errors</button>
            <div className="absolute inset-0 flex items-center justify-center rounded-md" style={{ background: "hsl(220 14% 14% / 0.7)", backdropFilter: "blur(2px)" }}>
              <div className="text-center">
                <div className="text-xs font-bold" style={{ color: "hsl(var(--accent))" }}>🔒 PRO Required</div>
                <div className="text-[10px] text-muted-foreground mt-1">Upgrade to fix device errors automatically</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ 4. CLEAN INVALID DEVICE DATA ═════════════════════ */
function CleanInvalidDataTool({ onBack }: { onBack: () => void }) {
  const categories = [
    { cat: "Display Adapters", items: ["NVIDIA GeForce GTX 960 (removed)", "AMD Radeon HD 7700 (removed)", "Intel HD Graphics 4000 (removed)", "ATI Radeon X1300 (removed)"] },
    { cat: "Network Adapters", items: ["Broadcom 802.11n (removed)", "Realtek RTL8168 (old)", "Qualcomm Atheros AR9285 (removed)", "Intel PRO/100 (removed)", "TP-Link TL-WN722N (removed)"] },
    { cat: "Sound Controllers", items: ["Realtek AC'97 Audio (removed)", "Creative Sound Blaster X-Fi (removed)", "VIA High Definition Audio (removed)"] },
    { cat: "USB Controllers", items: Array.from({ length: 12 }, (_, i) => `USB Root Hub #${i + 1} (orphaned)`) },
    { cat: "Storage Controllers", items: ["JMicron JMB36X (removed)", "Marvell 91xx SATA (removed)", "Silicon Image SiI 3132 (removed)", "VIA VT6420 SATA (removed)", "Promise SATA300 TX4 (removed)"] },
    { cat: "System Devices", items: Array.from({ length: 15 }, (_, i) => `Unknown Device ACPI\\${String.fromCharCode(65 + (i % 26))}${1000 + i} (orphaned)`) },
    { cat: "Printers", items: ["Canon iP2700 (removed)", "HP LaserJet 1020 (removed)", "Epson Stylus CX3900 (removed)", "Samsung ML-2010 (removed)", "Brother HL-2030 (removed)"] },
    { cat: "Bluetooth", items: ["Broadcom BCM2045A (removed)", "CSR Bluetooth (removed)", "Intel Bluetooth 4.0 (removed)"] },
  ];
  const allItems = categories.flatMap(c => c.items.map(item => `${c.cat}|${item}`));

  const [scanning, setScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cleaning, setCleaning] = useState(false);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [cleaned, setCleaned] = useState(false);

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => { p += Math.random() * 5 + 2; if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => { setScanning(false); setSelected(new Set(allItems)); }, 500); } setScanProgress(Math.min(100, Math.round(p))); }, 150);
    return () => clearInterval(iv);
  }, []);

  const doClean = () => {
    setCleaning(true); setCleanProgress(0);
    let p = 0;
    const iv = setInterval(() => { p += Math.random() * 6 + 3; if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => { setCleaning(false); setCleaned(true); }, 400); } setCleanProgress(Math.min(100, Math.round(p))); }, 150);
  };

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Clean Invalid Device Data" onBack={onBack} />

      {scanning ? (
        <div className="rounded-lg p-6 space-y-4" style={{ background: panelBg, border: panelBorder }}>
          <div className="text-sm text-foreground">Scanning registry for orphaned device entries...</div>
          <ToolProgress value={scanProgress} label="HKLM\SYSTEM\CurrentControlSet\Enum\..." />
        </div>
      ) : cleaning ? (
        <div className="rounded-lg p-6 space-y-4" style={{ background: panelBg, border: panelBorder }}>
          <div className="text-sm text-foreground">Cleaning {selected.size} invalid entries...</div>
          <ToolProgress value={cleanProgress} />
        </div>
      ) : cleaned ? (
        <div className="rounded-lg p-5 flex flex-col items-center gap-3" style={{ background: "hsl(140 60% 45% / 0.08)", border: "1px solid hsl(140 60% 45% / 0.3)" }}>
          <StatusIcon status="ok" />
          <div className="text-sm font-semibold text-foreground">{selected.size} invalid entries cleaned!</div>
          <div className="text-xs text-muted-foreground">Registry has been optimized.</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-primary font-semibold">{allItems.length} invalid devices found</span>
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={selected.size === allItems.length} onChange={e => setSelected(e.target.checked ? new Set(allItems) : new Set())} className="accent-primary" />
                All
              </label>
              <button onClick={doClean} disabled={selected.size === 0} className="px-4 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 btn-press">Clean Selected ({selected.size})</button>
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-auto custom-scrollbar">
            {categories.map(cat => (
              <div key={cat.cat}>
                <div className="text-[11px] text-muted-foreground font-semibold mb-1 uppercase tracking-wide">{cat.cat} ({cat.items.length})</div>
                <div className="space-y-1">
                  {cat.items.map(item => {
                    const key = `${cat.cat}|${item}`;
                    return (
                      <label key={key} className="flex items-center gap-2 rounded-md p-2 cursor-pointer hover:bg-secondary/30 text-xs text-foreground" style={{ background: panelBg }}>
                        <input type="checkbox" checked={selected.has(key)} onChange={() => { const s = new Set(selected); s.has(key) ? s.delete(key) : s.add(key); setSelected(s); }} className="accent-primary" />
                        {item}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═════════════════════ 5. FIX NETWORK FAILURE ═════════════════════ */
function FixNetworkTool({ onBack }: { onBack: () => void }) {
  type Step = { name: string; status: "pending" | "ok" | "warn" | "error"; detail: string };
  const [steps, setSteps] = useState<Step[]>([
    { name: "DNS Configuration", status: "pending", detail: "" },
    { name: "Default Gateway", status: "pending", detail: "" },
    { name: "Network Adapter", status: "pending", detail: "" },
    { name: "TCP/IP Stack", status: "pending", detail: "" },
    { name: "Winsock Catalog", status: "pending", detail: "" },
  ]);
  const [scanning, setScanning] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    if (!scanning) return;
    const results: Array<Pick<Step, "status" | "detail">> = [
      { status: "ok", detail: "Primary DNS: 8.8.8.8 — Responding" },
      { status: "ok", detail: "Gateway 192.168.1.1 — Reachable (12ms)" },
      { status: "warn", detail: "Intel Wi-Fi 6 AX201 — Driver outdated" },
      { status: "error", detail: "TCP/IP stack corruption detected" },
      { status: "ok", detail: "Winsock catalog intact (42 entries)" },
    ];
    const iv = setInterval(() => {
      if (idx.current >= steps.length) { clearInterval(iv); setScanning(false); return; }
      setSteps(prev => prev.map((s, i) => i === idx.current ? { ...s, ...results[i] } : s));
      idx.current++;
    }, 1000);
    return () => clearInterval(iv);
  }, [scanning]);

  const doFix = () => {
    setFixing(true);
    setTimeout(() => {
      setSteps(prev => prev.map(s => s.status !== "ok" ? { ...s, status: "ok", detail: s.detail + " — Repaired ✓" } : s));
      setFixing(false); setFixed(true);
    }, 3000);
  };

  const hasIssues = steps.some(s => s.status !== "ok" && s.status !== "pending");

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Fix Network Failure" onBack={onBack} />
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="rounded-lg p-4 flex items-center gap-4" style={{ background: panelBg, border: panelBorder, opacity: s.status === "pending" ? 0.5 : 1 }}>
            {s.status === "pending" && scanning && idx.current === i ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : <StatusIcon status={s.status} />}
            <div className="flex-1">
              <div className="text-xs text-foreground font-medium">{s.name}</div>
              {s.detail && <div className="text-[11px] text-muted-foreground mt-0.5">{s.detail}</div>}
            </div>
          </div>
        ))}
      </div>
      {!scanning && (
        <div className="mt-5 flex justify-center">
          {fixed ? (
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(140 60% 45%)" }}><StatusIcon status="ok" /> Network issues repaired!</div>
          ) : fixing ? (
            <div className="flex items-center gap-2 text-sm text-primary animate-pulse"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />Repairing...</div>
          ) : hasIssues ? (
            <button onClick={doFix} className="px-6 py-2.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 btn-press">Repair {steps.filter(s => s.status !== "ok").length} Issues</button>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(140 60% 45%)" }}><StatusIcon status="ok" /> Network is healthy!</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ 6. FIX BAD RESOLUTION ═════════════════════ */
function FixResolutionTool({ onBack }: { onBack: () => void }) {
  const currentW = screen.width, currentH = screen.height;
  const recommended = `${currentW}x${currentH}`;
  const resolutions = [
    { w: 3840, h: 2160, label: "4K Ultra HD" },
    { w: 2560, h: 1440, label: "QHD" },
    { w: 1920, h: 1080, label: "Full HD" },
    { w: 1680, h: 1050, label: "WSXGA+" },
    { w: 1440, h: 900, label: "WXGA+" },
    { w: 1366, h: 768, label: "HD" },
    { w: 1280, h: 720, label: "HD 720p" },
    { w: 1024, h: 768, label: "XGA" },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Fix Bad Resolution" onBack={onBack} />
      <div className="rounded-lg p-4 mb-5 flex items-center gap-4" style={{ background: panelBg, border: panelBorder }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: circleBg }}>
          <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Current Resolution</div>
          <div className="text-sm text-foreground font-bold">{currentW} × {currentH}</div>
          <div className="text-[11px] text-muted-foreground">DPI Scale: {Math.round(window.devicePixelRatio * 100)}% • Color: {screen.colorDepth}-bit</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[11px] text-muted-foreground">Recommended</div>
          <div className="text-xs font-semibold" style={{ color: "hsl(140 60% 45%)" }}>{recommended}</div>
        </div>
      </div>

      {applied && (
        <div className="rounded-lg p-3 mb-4 flex items-center gap-2" style={{ background: "hsl(140 60% 45% / 0.1)", border: "1px solid hsl(140 60% 45% / 0.3)" }}>
          <StatusIcon status="ok" /><span className="text-xs text-foreground">Resolution change applied (simulated)</span>
        </div>
      )}

      <div className="space-y-1">
        {resolutions.map(r => {
          const key = `${r.w}x${r.h}`;
          const isCurrent = r.w === currentW && r.h === currentH;
          return (
            <div key={key} onClick={() => setSelected(key)} className={`rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors ${selected === key ? "ring-1 ring-primary" : ""}`} style={{ background: panelBg, border: panelBorder }}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full border-2 ${selected === key ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                <span className="text-xs text-foreground font-medium">{r.w} × {r.h}</span>
                <span className="text-[11px] text-muted-foreground">{r.label}</span>
              </div>
              {isCurrent && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "hsl(140 60% 45% / 0.15)", color: "hsl(140 60% 45%)" }}>Current</span>}
            </div>
          );
        })}
      </div>
      {selected && (
        <div className="mt-4 flex justify-center">
          <button onClick={() => setApplied(true)} className="px-6 py-2.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 btn-press">Apply {selected}</button>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ 7. FIX INCOMPATIBLE DRIVERS ═════════════════════ */
function FixIncompatibleTool({ onBack }: { onBack: () => void }) {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const incompatible = [
    { name: "Realtek PCIe GBE Family Controller", version: "10.52.828.2021", issue: "Not compatible with Windows 11 23H2", severity: "warn" as const },
    { name: "Intel(R) USB 3.1 eXtensible Host Controller", version: "5.0.4.43", issue: "Known BSOD trigger on build 22631+", severity: "error" as const },
    { name: "Synaptics SMBus TouchPad", version: "19.5.35.75", issue: "Gesture support disabled on current OS", severity: "warn" as const },
  ];
  const [fixedSet, setFixedSet] = useState<Set<number>>(new Set());
  const [fixingIdx, setFixingIdx] = useState<number | null>(null);

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => { p += Math.random() * 7 + 3; if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setScanning(false), 400); } setProgress(Math.min(100, Math.round(p))); }, 160);
    return () => clearInterval(iv);
  }, []);

  const fixOne = (i: number) => {
    setFixingIdx(i);
    setTimeout(() => { setFixingIdx(null); setFixedSet(prev => new Set(prev).add(i)); }, 2000);
  };

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Fix Incompatible Drivers" onBack={onBack} />
      {scanning ? (
        <div className="rounded-lg p-6 space-y-4" style={{ background: panelBg, border: panelBorder }}>
          <div className="text-sm text-foreground">Cross-referencing drivers with OS compatibility...</div>
          <ToolProgress value={progress} label="Checking driver manifests..." />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-primary font-semibold mb-3">{incompatible.length} incompatible drivers found</div>
          {incompatible.map((d, i) => (
            <div key={i} className="rounded-lg p-4 flex items-center gap-4" style={{ background: panelBg, border: panelBorder }}>
              <StatusIcon status={fixedSet.has(i) ? "ok" : d.severity} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground font-medium truncate">{d.name}</div>
                <div className="text-[11px] text-muted-foreground">v{d.version} — {fixedSet.has(i) ? "Compatible driver installed ✓" : d.issue}</div>
              </div>
              {fixedSet.has(i) ? (
                <span className="text-[11px] font-semibold shrink-0" style={{ color: "hsl(140 60% 45%)" }}>Fixed</span>
              ) : fixingIdx === i ? (
                <span className="text-[11px] text-primary animate-pulse shrink-0">Fixing...</span>
              ) : (
                <button onClick={() => fixOne(i)} className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 btn-press shrink-0">Fix</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ 8. OFFLINE DRIVER UPDATER ═════════════════════ */
function OfflineUpdaterTool({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"export" | "import">("export");
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exported, setExported] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [imported, setImported] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set(outdatedDrivers.map(d => d.id)));

  const doExport = () => {
    setExporting(true); setExportProgress(0);
    let p = 0;
    const iv = setInterval(() => { p += Math.random() * 5 + 2; if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => { setExporting(false); setExported(true); }, 400); } setExportProgress(Math.min(100, Math.round(p))); }, 200);
  };

  const doImport = () => {
    setImporting(true); setImportProgress(0);
    let p = 0;
    const iv = setInterval(() => { p += Math.random() * 4 + 2; if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => { setImporting(false); setImported(true); }, 400); } setImportProgress(Math.min(100, Math.round(p))); }, 200);
  };

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Offline Driver Updater" onBack={onBack} />
      <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: circleBg }}>
        {(["export", "import"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t === "export" ? "Export Pack" : "Import Pack"}</button>
        ))}
      </div>

      {tab === "export" ? (
        <div className="space-y-3">
          {exported && (
            <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: "hsl(140 60% 45% / 0.1)", border: "1px solid hsl(140 60% 45% / 0.3)" }}>
              <StatusIcon status="ok" />
              <div>
                <div className="text-sm font-semibold text-foreground">Driver Pack Exported!</div>
                <div className="text-xs text-muted-foreground">C:\DriverBooster\OfflinePack\DriverPack_{new Date().toISOString().slice(0, 10)}.dbp</div>
              </div>
            </div>
          )}
          {exporting ? (
            <div className="rounded-lg p-5 space-y-4" style={{ background: panelBg, border: panelBorder }}>
              <div className="text-sm text-foreground">Packaging {selectedDrivers.size} drivers...</div>
              <ToolProgress value={exportProgress} />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">{selectedDrivers.size} drivers selected</span>
                <button onClick={doExport} disabled={selectedDrivers.size === 0} className="px-4 py-2 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 btn-press">Export Pack</button>
              </div>
              {outdatedDrivers.map(d => (
                <label key={d.id} className="flex items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-secondary/30" style={{ background: panelBg, border: panelBorder }}>
                  <input type="checkbox" checked={selectedDrivers.has(d.id)} onChange={() => { const s = new Set(selectedDrivers); s.has(d.id) ? s.delete(d.id) : s.add(d.id); setSelectedDrivers(s); }} className="accent-primary" />
                  <span className="text-xs text-foreground truncate">{d.name}</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">{d.newVersion}</span>
                </label>
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {imported ? (
            <div className="rounded-lg p-5 flex flex-col items-center gap-3" style={{ background: "hsl(140 60% 45% / 0.08)", border: "1px solid hsl(140 60% 45% / 0.3)" }}>
              <StatusIcon status="ok" />
              <div className="text-sm font-semibold text-foreground">Drivers installed from pack!</div>
              <div className="text-xs text-muted-foreground">8 drivers updated successfully</div>
            </div>
          ) : importing ? (
            <div className="rounded-lg p-5 space-y-4" style={{ background: panelBg, border: panelBorder }}>
              <div className="text-sm text-foreground">Installing drivers from pack...</div>
              <ToolProgress value={importProgress} />
            </div>
          ) : (
            <div onClick={doImport} className="rounded-lg p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover-glow transition-colors" style={{ background: panelBg, border: "2px dashed hsl(220 10% 25%)" }}>
              <svg className="w-12 h-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <div className="text-sm text-foreground font-medium">Click to load Driver Pack (.dbp)</div>
              <div className="text-[11px] text-muted-foreground">Or drag and drop a pack file here</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════ 9. SYSTEM INFORMATION ═════════════════════ */
function SystemInfoTool({ onBack }: { onBack: () => void }) {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("os");

  useEffect(() => {
    detectSystemInfoAsync().then(data => { setInfo(data); setLoading(false); });
  }, []);

  const badge = (source: string) => {
    if (source === "electron") return <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(140 60% 45% / 0.15)", color: "hsl(140 60% 45%)" }}>Native</span>;
    if (source === "electron-limited") return <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(45 90% 55% / 0.15)", color: "hsl(45 90% 55%)" }}>Partial</span>;
    return <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(210 70% 50% / 0.15)", color: "hsl(210 70% 50%)" }}>Estimated</span>;
  };

  const Row = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="flex justify-between py-2 border-b" style={{ borderColor: "hsl(220 10% 20%)" }}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground font-medium text-right max-w-[60%] truncate">{value ?? "N/A"}</span>
    </div>
  );

  const tabs = [
    { id: "os", label: "OS" },
    { id: "cpu", label: "CPU" },
    { id: "gpu", label: "GPU" },
    { id: "ram", label: "RAM" },
    { id: "storage", label: "Storage" },
    { id: "network", label: "Network" },
    { id: "display", label: "Display" },
  ];

  const exportTxt = () => {
    if (!info) return;
    const text = JSON.stringify(info, null, 2);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "system-info.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors" style={{ background: "hsl(220 14% 18%)" }}>
            <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h2 className="text-sm font-bold text-foreground">System Information</h2>
          {info && badge(info.source)}
        </div>
        <button onClick={exportTxt} disabled={!info} className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-40 btn-press">Export</button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground">Detecting hardware...</span>
        </div>
      ) : info && (
        <>
          <div className="flex gap-1 mb-4 p-1 rounded-lg overflow-x-auto" style={{ background: circleBg }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${activeTab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
            ))}
          </div>
          <div className="rounded-lg p-4" style={{ background: panelBg, border: panelBorder }}>
            {activeTab === "os" && <>
              <Row label="Operating System" value={info.os.name} />
              <Row label="Version" value={info.os.version} />
              <Row label="Architecture" value={info.os.architecture} />
              <Row label="Platform" value={info.os.platform} />
              {info.os.hostname && <Row label="Hostname" value={info.os.hostname} />}
              {info.os.uptime != null && <Row label="Uptime" value={`${Math.floor(info.os.uptime / 3600)}h ${Math.floor((info.os.uptime % 3600) / 60)}m`} />}
            </>}
            {activeTab === "cpu" && <>
              <Row label="Processor" value={info.cpu.name} />
              <Row label="Logical Cores" value={info.cpu.cores} />
              {info.cpu.physicalCores && <Row label="Physical Cores" value={info.cpu.physicalCores} />}
              {info.cpu.speed && <Row label="Base Speed" value={`${info.cpu.speed} GHz`} />}
            </>}
            {activeTab === "gpu" && <>
              <Row label="GPU" value={info.gpu.renderer} />
              <Row label="Vendor" value={info.gpu.vendor} />
              {info.gpu.vramMB && <Row label="VRAM" value={`${info.gpu.vramMB} MB`} />}
              {info.gpu.driverVersion && <Row label="Driver Version" value={info.gpu.driverVersion} />}
              {info.gpu.additionalGPUs?.map((g, i) => <Row key={i} label={`GPU ${i + 2}`} value={`${g.name} (${g.vramMB} MB)`} />)}
            </>}
            {activeTab === "ram" && <>
              <Row label="Total RAM" value={info.ram.totalGB ? `${info.ram.totalGB} GB` : "N/A"} />
              {info.ram.freeGB != null && <Row label="Free" value={`${info.ram.freeGB.toFixed(1)} GB`} />}
              {info.ram.usedGB != null && <Row label="Used" value={`${info.ram.usedGB.toFixed(1)} GB`} />}
              {info.ram.modules?.map((m, i) => <Row key={i} label={`DIMM ${i + 1}`} value={`${m.capacityGB} GB ${m.manufacturer} @ ${m.speedMHz || "?"} MHz`} />)}
            </>}
            {activeTab === "storage" && <>
              {info.disks?.length ? info.disks.map((d, i) => (
                <Row key={i} label={d.model} value={`${d.sizeGB} GB — ${d.mediaType} (${d.interface})`} />
              )) : <Row label="Storage" value="Detection limited in browser mode" />}
            </>}
            {activeTab === "network" && <>
              {info.network.type && <Row label="Connection Type" value={info.network.type} />}
              {info.network.downlink && <Row label="Downlink" value={`${info.network.downlink} Mbps`} />}
              {info.network.adapters?.map((a, i) => <Row key={i} label={a.manufacturer || "Adapter"} value={a.name} />)}
              {!info.network.adapters?.length && !info.network.type && <Row label="Network" value="Detection limited" />}
            </>}
            {activeTab === "display" && <>
              <Row label="Resolution" value={`${info.display.width} × ${info.display.height}`} />
              <Row label="Color Depth" value={`${info.display.colorDepth}-bit`} />
              <Row label="Pixel Ratio" value={`${info.display.pixelRatio}x`} />
            </>}
          </div>
        </>
      )}
    </div>
  );
}

/* ═════════════════════ 10. FREE & FAST VPN ═════════════════════ */
function VPNPromoTool({ onBack }: { onBack: () => void }) {
  const features = [
    { icon: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>, title: "1800+ Servers", desc: "Worldwide coverage in 100+ locations" },
    { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, title: "Military Encryption", desc: "AES-256 encryption for maximum security" },
    { icon: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>, title: "Ultra Fast", desc: "No speed limit, no bandwidth caps" },
    { icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>, title: "No-Log Policy", desc: "Your browsing stays completely private" },
  ];

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Free & Fast VPN" onBack={onBack} />
      <div className="rounded-lg p-6 text-center mb-6" style={{ background: `linear-gradient(135deg, hsl(210 70% 20%), hsl(220 14% 14%))`, border: panelBorder }}>
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "hsl(210 70% 50% / 0.2)" }}>
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="hsl(210 70% 60%)" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">iTop VPN</h3>
        <p className="text-xs text-muted-foreground mb-4">Browse securely and privately with military-grade encryption</p>
        <button className="px-8 py-3 rounded-md text-sm font-bold text-white btn-press hover:opacity-90 transition-opacity" style={{ background: "hsl(210 70% 50%)" }}>
          Install iTop VPN — Free
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {features.map((f, i) => (
          <div key={i} className="rounded-lg p-4 flex items-start gap-3" style={{ background: panelBg, border: panelBorder }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: circleBg }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="hsl(210 70% 60%)" strokeWidth="1.5">{f.icon}</svg>
            </div>
            <div>
              <div className="text-xs text-foreground font-semibold">{f.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════════════════════ 11. SCREEN RECORDER ═════════════════════ */
function ScreenRecorderPromoTool({ onBack }: { onBack: () => void }) {
  const features = [
    { icon: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" /></>, title: "HD Recording", desc: "Record screen in 1080p/4K quality" },
    { icon: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>, title: "Webcam Overlay", desc: "Add webcam to your recordings" },
    { icon: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>, title: "Game Capture", desc: "Low-latency game recording mode" },
    { icon: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>, title: "Built-in Editor", desc: "Trim, cut, and annotate instantly" },
  ];

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in custom-scrollbar">
      <ToolHeader title="Screen Recorder" onBack={onBack} />
      <div className="rounded-lg p-6 text-center mb-6" style={{ background: `linear-gradient(135deg, hsl(0 72% 25%), hsl(220 14% 14%))`, border: panelBorder }}>
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "hsl(0 72% 51% / 0.2)" }}>
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="hsl(0 72% 60%)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="hsl(0 72% 60%)" /></svg>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">iTop Screen Recorder</h3>
        <p className="text-xs text-muted-foreground mb-4">Capture everything on your screen with ease</p>
        <button className="px-8 py-3 rounded-md text-sm font-bold text-primary-foreground btn-press hover:opacity-90 transition-opacity bg-primary">
          Install iTop Screen Recorder — Free
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {features.map((f, i) => (
          <div key={i} className="rounded-lg p-4 flex items-start gap-3" style={{ background: panelBg, border: panelBorder }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: circleBg }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="hsl(0 72% 60%)" strokeWidth="1.5">{f.icon}</svg>
            </div>
            <div>
              <div className="text-xs text-foreground font-semibold">{f.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* ═════════════════════ MAIN TOOLS PAGE ═════════════════════ */
/* ═══════════════════════════════════════════════════════════════ */

export function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolView>("main");

  const back = () => setActiveTool("main");

  if (activeTool === "backup") return <BackupRestoreTool onBack={back} />;
  if (activeTool === "no-sound") return <FixNoSoundTool onBack={back} />;
  if (activeTool === "device-error") return <FixDeviceErrorTool onBack={back} />;
  if (activeTool === "clean-invalid") return <CleanInvalidDataTool onBack={back} />;
  if (activeTool === "network-failure") return <FixNetworkTool onBack={back} />;
  if (activeTool === "bad-resolution") return <FixResolutionTool onBack={back} />;
  if (activeTool === "incompatible") return <FixIncompatibleTool onBack={back} />;
  if (activeTool === "offline-updater") return <OfflineUpdaterTool onBack={back} />;
  if (activeTool === "system-info") return <SystemInfoTool onBack={back} />;
  if (activeTool === "vpn") return <VPNPromoTool onBack={back} />;
  if (activeTool === "screen-recorder") return <ScreenRecorderPromoTool onBack={back} />;

  return (
    <div className="flex-1 p-6 overflow-auto animate-fade-in">
      {/* Hot Fix Tools */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-primary rounded-full" />
        <h2 className="text-sm font-bold text-foreground">Hot Fix Tools:</h2>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex gap-3 flex-1">
          {/* Backup & Restore */}
          <div onClick={() => setActiveTool("backup")} className="flex-1 rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover-lift hover-glow min-h-[140px]" style={{ background: panelBg, border: panelBorder }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: circleBg }}>
              <svg className="w-7 h-7 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
            </div>
            <span className="text-xs text-foreground font-medium text-center">Backup & Restore</span>
          </div>

          {/* Fix No Sound */}
          <div onClick={() => setActiveTool("no-sound")} className="flex-1 rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover-lift hover-glow min-h-[140px]" style={{ background: panelBg, border: panelBorder }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: circleBg }}>
              <svg className="w-7 h-7 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            </div>
            <span className="text-xs text-foreground font-medium text-center">Fix No Sound</span>
          </div>

          {/* Fix Device Error */}
          <div onClick={() => setActiveTool("device-error")} className="flex-1 rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover-lift hover-glow relative min-h-[140px]" style={{ background: panelBg, border: panelBorder }}>
            <div className="diagonal-badge diagonal-badge-pro" />
            <span className="diagonal-badge-text" style={{ top: '4px', left: '2px', fontSize: '7px' }}>PRO</span>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: circleBg }}>
              <svg className="w-7 h-7 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <span className="text-xs text-foreground font-medium text-center">Fix Device Error</span>
            <span className="text-[11px] text-primary font-semibold">1 issue</span>
          </div>
        </div>

        {/* Side actions */}
        <div className="w-56 shrink-0 space-y-2">
          {[
            { label: "Clean Invalid Device Da...", count: "59 devices", tool: "clean-invalid" as ToolView, icon: <><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></> },
            { label: "Fix Network Failure", tool: "network-failure" as ToolView, icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></> },
            { label: "Fix Bad Resolution", tool: "bad-resolution" as ToolView, icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></> },
          ].map(item => (
            <div key={item.label} onClick={() => setActiveTool(item.tool)} className="rounded-lg p-3 flex items-center gap-3 cursor-pointer hover-lift hover-glow" style={{ background: panelBg, border: panelBorder }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: circleBg }}>
                <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {item.icon}
                </svg>
              </div>
              <div>
                <div className="text-xs text-foreground font-medium">{item.label}</div>
                {item.count && <div className="text-[11px] text-primary font-semibold">{item.count}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Useful Tools */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-primary rounded-full" />
        <h2 className="text-sm font-bold text-foreground">Other Useful Tools:</h2>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Fix Incompatible Drivers", isNew: false, tool: "incompatible" as ToolView, icon: "wrench" },
          { label: "Offline Driver Updater", isNew: false, tool: "offline-updater" as ToolView, icon: "download" },
          { label: "System Information", isNew: false, tool: "system-info" as ToolView, icon: "cpu" },
          { label: "Free & Fast VPN", isNew: true, tool: "vpn" as ToolView, icon: "shield" },
          { label: "Screen Recorder", isNew: true, tool: "screen-recorder" as ToolView, icon: "rec" },
        ].map(tool => (
          <div key={tool.label} onClick={() => setActiveTool(tool.tool)} className="rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover-lift hover-glow relative overflow-hidden min-h-[130px]" style={{ background: panelBg, border: panelBorder }}>
            {tool.isNew && (
              <>
                <div className="absolute top-0 right-0 w-0 h-0" style={{
                  borderStyle: "solid",
                  borderWidth: "0 40px 40px 0",
                  borderColor: "transparent hsl(140 60% 40%) transparent transparent",
                }} />
                <span className="absolute top-[8px] right-[2px] text-[8px] font-bold text-white transform rotate-45">NEW</span>
              </>
            )}
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: circleBg }}>
              <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {tool.icon === "wrench" && <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />}
                {tool.icon === "download" && <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>}
                {tool.icon === "cpu" && <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>}
                {tool.icon === "shield" && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                {tool.icon === "rec" && <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" /></>}
              </svg>
            </div>
            <span className="text-xs text-foreground font-medium text-center leading-tight">{tool.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
