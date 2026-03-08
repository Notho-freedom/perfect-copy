import { useState } from "react";
import { ArrowLeft, Shield, Download, Bell, Folder, Monitor, Globe, RotateCcw, HardDrive, Clock, Trash2, Crown } from "lucide-react";

interface SettingsPageProps {
  onBack: () => void;
}

const categories = [
  { id: "general", label: "General", icon: <Monitor className="w-4 h-4" /> },
  { id: "scan", label: "Scan", icon: <Shield className="w-4 h-4" /> },
  { id: "download", label: "Download", icon: <Download className="w-4 h-4" /> },
  { id: "notification", label: "Notification", icon: <Bell className="w-4 h-4" /> },
  { id: "backup", label: "Backup & Restore", icon: <RotateCcw className="w-4 h-4" /> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${checked ? "bg-primary" : "bg-white/15"}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingRow({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 px-1 group">
      <div className="flex-1 min-w-0 mr-4">
        <div className="text-[13px] text-foreground/90">{label}</div>
        {description && <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <Toggle checked={checked} onChange={setChecked} />
    </div>
  );
}

function SelectRow({ label, options, defaultValue }: { label: string; options: string[]; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <span className="text-[13px] text-foreground/90">{label}</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="text-[12px] px-3 py-1.5 rounded border border-white/10 bg-white/5 text-foreground/80 outline-none cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o} className="bg-[hsl(220,18%,12%)]">{o}</option>)}
      </select>
    </div>
  );
}

const generalSettings = [
  { label: "Run at Windows Startup", description: "Automatically start Driver Booster when Windows boots", defaultChecked: true },
  { label: "Auto Scan on Launch", description: "Automatically scan for outdated drivers on startup", defaultChecked: true },
  { label: "Auto Update Drivers", description: "Download and install driver updates automatically (PRO)", defaultChecked: false },
  { label: "Show Tray Icon", description: "Display Driver Booster icon in the system tray", defaultChecked: true },
  { label: "Check for Program Updates", description: "Automatically check for new versions of Driver Booster", defaultChecked: true },
];

const scanSettings = [
  { label: "Include Unplugged Devices", description: "Scan drivers for devices that are not currently connected", defaultChecked: false },
  { label: "Scan Game Components", description: "Include DirectX, OpenGL, and game-ready drivers", defaultChecked: true },
  { label: "WHQL Driver Only", description: "Only recommend Microsoft-certified drivers", defaultChecked: true },
  { label: "Exclude Recently Updated", description: "Skip drivers updated in the last 30 days", defaultChecked: false },
];

const downloadSettings = [
  { label: "Use Multi-Thread Download", description: "Faster downloads using multiple connections", defaultChecked: true },
  { label: "Prioritize Download Speed", description: "Allocate more bandwidth to driver downloads", defaultChecked: false },
];

const notificationSettings = [
  { label: "Outdated Driver Alerts", description: "Notify when outdated drivers are detected", defaultChecked: true },
  { label: "Update Complete Notification", description: "Show notification when updates finish", defaultChecked: true },
  { label: "Sound Effects", description: "Play sounds for scan and update events", defaultChecked: false },
];

const backupSettings = [
  { label: "Auto Backup Before Update", description: "Create a restore point before installing drivers", defaultChecked: true },
  { label: "Compress Backup Files", description: "Save disk space by compressing driver backups", defaultChecked: true },
];

const settingsMap: Record<string, { label: string; description?: string; defaultChecked: boolean }[]> = {
  general: generalSettings,
  scan: scanSettings,
  download: downloadSettings,
  notification: notificationSettings,
  backup: backupSettings,
};

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [activeCategory, setActiveCategory] = useState("general");

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
        <button onClick={onBack} className="p-1.5 rounded hover:bg-white/10 transition-colors btn-press">
          <ArrowLeft className="w-4.5 h-4.5 text-muted-foreground" />
        </button>
        <h1 className="text-[15px] font-bold text-foreground tracking-wide">Settings</h1>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Category sidebar */}
        <div className="w-[180px] shrink-0 py-3 overflow-auto" style={{ borderRight: "1px solid hsl(220 10% 18%)" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] transition-all duration-200 ${
                activeCategory === cat.id
                  ? "text-primary bg-primary/10 border-r-2 border-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <span className={activeCategory === cat.id ? "text-primary" : ""}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="flex-1 overflow-auto p-5">
          <div className="max-w-lg">
            <h2 className="text-[13px] font-bold text-foreground/70 uppercase tracking-wider mb-3">
              {categories.find(c => c.id === activeCategory)?.label}
            </h2>
            <div className="divide-y divide-white/5">
              {settingsMap[activeCategory]?.map((s) => (
                <SettingRow key={s.label} {...s} />
              ))}
            </div>

            {activeCategory === "general" && (
              <div className="mt-6">
                <SelectRow label="Language" options={["English", "Français", "Deutsch", "Español", "中文"]} defaultValue="English" />
                <SelectRow label="Download Location" options={["C:\\DriverBooster\\Downloads", "D:\\Drivers"]} defaultValue="C:\\DriverBooster\\Downloads" />
              </div>
            )}

            {activeCategory === "download" && (
              <div className="mt-6">
                <SelectRow label="Max Concurrent Downloads" options={["1", "2", "3", "5"]} defaultValue="3" />
                <SelectRow label="Network Bandwidth Limit" options={["No Limit", "1 MB/s", "5 MB/s", "10 MB/s"]} defaultValue="No Limit" />
              </div>
            )}

            {activeCategory === "backup" && (
              <div className="mt-6">
                <SelectRow label="Backup Location" options={["C:\\DriverBackups", "D:\\DriverBackups"]} defaultValue="C:\\DriverBackups" />
                <SelectRow label="Max Backups to Keep" options={["3", "5", "10", "Unlimited"]} defaultValue="5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-5 py-3 shrink-0" style={{ borderTop: "1px solid hsl(220 10% 18%)" }}>
        <button className="text-[12px] px-5 py-2 rounded border border-white/10 text-muted-foreground hover:bg-white/5 transition-colors btn-press">
          Reset Defaults
        </button>
        <button onClick={onBack} className="text-[12px] px-5 py-2 rounded bg-primary hover:bg-primary/90 text-white font-bold transition-colors btn-press shadow-lg shadow-primary/30">
          Apply & Close
        </button>
      </div>
    </div>
  );
}
