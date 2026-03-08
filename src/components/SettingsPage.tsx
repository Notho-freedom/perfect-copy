import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Shield, Download, Bell, Monitor, RotateCcw, Cloud, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SettingsPageProps {
  onBack: () => void;
}

const SESSION_ID = (() => {
  let id = localStorage.getItem("db_session_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("db_session_id", id); }
  return id;
})();

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

function SettingRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 px-1 group">
      <div className="flex-1 min-w-0 mr-4">
        <div className="text-[13px] text-foreground/90">{label}</div>
        {description && <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SelectRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <span className="text-[13px] text-foreground/90">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[12px] px-3 py-1.5 rounded border border-white/10 bg-white/5 text-foreground/80 outline-none cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o} className="bg-[hsl(220,18%,12%)]">{o}</option>)}
      </select>
    </div>
  );
}

type SettingDef = { label: string; description?: string; defaultChecked: boolean; key: string };
type SelectDef = { label: string; options: string[]; defaultValue: string; key: string };

const generalToggles: SettingDef[] = [
  { key: "run_at_startup", label: "Run at Windows Startup", description: "Automatically start Driver Booster when Windows boots", defaultChecked: true },
  { key: "auto_scan", label: "Auto Scan on Launch", description: "Automatically scan for outdated drivers on startup", defaultChecked: true },
  { key: "auto_update", label: "Auto Update Drivers", description: "Download and install driver updates automatically (PRO)", defaultChecked: false },
  { key: "show_tray", label: "Show Tray Icon", description: "Display Driver Booster icon in the system tray", defaultChecked: true },
  { key: "check_updates", label: "Check for Program Updates", description: "Automatically check for new versions of Driver Booster", defaultChecked: true },
];

const scanToggles: SettingDef[] = [
  { key: "include_unplugged", label: "Include Unplugged Devices", description: "Scan drivers for devices that are not currently connected", defaultChecked: false },
  { key: "scan_game", label: "Scan Game Components", description: "Include DirectX, OpenGL, and game-ready drivers", defaultChecked: true },
  { key: "whql_only", label: "WHQL Driver Only", description: "Only recommend Microsoft-certified drivers", defaultChecked: true },
  { key: "exclude_recent", label: "Exclude Recently Updated", description: "Skip drivers updated in the last 30 days", defaultChecked: false },
];

const downloadToggles: SettingDef[] = [
  { key: "multi_thread", label: "Use Multi-Thread Download", description: "Faster downloads using multiple connections", defaultChecked: true },
  { key: "prioritize_speed", label: "Prioritize Download Speed", description: "Allocate more bandwidth to driver downloads", defaultChecked: false },
];

const notificationToggles: SettingDef[] = [
  { key: "outdated_alerts", label: "Outdated Driver Alerts", description: "Notify when outdated drivers are detected", defaultChecked: true },
  { key: "update_complete", label: "Update Complete Notification", description: "Show notification when updates finish", defaultChecked: true },
  { key: "sound_effects", label: "Sound Effects", description: "Play sounds for scan and update events", defaultChecked: false },
];

const backupToggles: SettingDef[] = [
  { key: "auto_backup", label: "Auto Backup Before Update", description: "Create a restore point before installing drivers", defaultChecked: true },
  { key: "compress_backup", label: "Compress Backup Files", description: "Save disk space by compressing driver backups", defaultChecked: true },
];

const togglesMap: Record<string, SettingDef[]> = {
  general: generalToggles, scan: scanToggles, download: downloadToggles, notification: notificationToggles, backup: backupToggles,
};

const generalSelects: SelectDef[] = [
  { key: "language", label: "Language", options: ["English", "Français", "Deutsch", "Español", "中文"], defaultValue: "English" },
  { key: "download_location", label: "Download Location", options: ["C:\\DriverBooster\\Downloads", "D:\\Drivers"], defaultValue: "C:\\DriverBooster\\Downloads" },
];
const downloadSelects: SelectDef[] = [
  { key: "max_concurrent", label: "Max Concurrent Downloads", options: ["1", "2", "3", "5"], defaultValue: "3" },
  { key: "bandwidth_limit", label: "Network Bandwidth Limit", options: ["No Limit", "1 MB/s", "5 MB/s", "10 MB/s"], defaultValue: "No Limit" },
];
const backupSelects: SelectDef[] = [
  { key: "backup_location", label: "Backup Location", options: ["C:\\DriverBackups", "D:\\DriverBackups"], defaultValue: "C:\\DriverBackups" },
  { key: "max_backups", label: "Max Backups to Keep", options: ["3", "5", "10", "Unlimited"], defaultValue: "5" },
];

const selectsMap: Record<string, SelectDef[]> = { general: generalSelects, download: downloadSelects, backup: backupSelects };

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [activeCategory, setActiveCategory] = useState("general");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Build default settings map
  const defaults = useCallback(() => {
    const d: Record<string, string> = {};
    Object.entries(togglesMap).forEach(([cat, defs]) => {
      defs.forEach(s => { d[`${cat}.${s.key}`] = String(s.defaultChecked); });
    });
    Object.entries(selectsMap).forEach(([cat, defs]) => {
      defs.forEach(s => { d[`${cat}.${s.key}`] = s.defaultValue; });
    });
    return d;
  }, []);

  // Load settings from DB
  useEffect(() => {
    (async () => {
      const d = defaults();
      try {
        const { data } = await supabase
          .from("user_settings")
          .select("category, setting_key, setting_value")
          .eq("session_id", SESSION_ID);
        if (data) {
          data.forEach(r => { d[`${r.category}.${r.setting_key}`] = r.setting_value; });
        }
      } catch (e) { console.error("Failed to load settings", e); }
      setSettings(d);
      setLoading(false);
    })();
  }, [defaults]);

  const updateSetting = (category: string, key: string, value: string) => {
    setSettings(prev => ({ ...prev, [`${category}.${key}`]: value }));
  };

  const getVal = (category: string, key: string) => settings[`${category}.${key}`] ?? "";

  // Save all settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(settings).map(([k, v]) => {
        const [category, ...rest] = k.split(".");
        return { session_id: SESSION_ID, category, setting_key: rest.join("."), setting_value: v, updated_at: new Date().toISOString() };
      });
      // Upsert all
      await supabase.from("user_settings").upsert(rows, { onConflict: "session_id,category,setting_key" });
    } catch (e) { console.error("Failed to save settings", e); }
    setSaving(false);
    onBack();
  };

  const handleReset = () => { setSettings(defaults()); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
        <button onClick={onBack} className="p-1.5 rounded hover:bg-white/10 transition-colors btn-press">
          <ArrowLeft className="w-4.5 h-4.5 text-muted-foreground" />
        </button>
        <h1 className="text-[15px] font-bold text-foreground tracking-wide">Settings</h1>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-primary/80">
          <Cloud className="w-3.5 h-3.5" />
          <span>SYNCED</span>
        </div>
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
              {togglesMap[activeCategory]?.map((s) => (
                <SettingRow
                  key={s.key}
                  label={s.label}
                  description={s.description}
                  checked={getVal(activeCategory, s.key) === "true"}
                  onChange={(v) => updateSetting(activeCategory, s.key, String(v))}
                />
              ))}
            </div>

            {selectsMap[activeCategory] && (
              <div className="mt-6">
                {selectsMap[activeCategory].map((s) => (
                  <SelectRow
                    key={s.key}
                    label={s.label}
                    options={s.options}
                    value={getVal(activeCategory, s.key) || s.defaultValue}
                    onChange={(v) => updateSetting(activeCategory, s.key, v)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-5 py-3 shrink-0" style={{ borderTop: "1px solid hsl(220 10% 18%)" }}>
        <button onClick={handleReset} className="text-[12px] px-5 py-2 rounded border border-white/10 text-muted-foreground hover:bg-white/5 transition-colors btn-press">
          Reset Defaults
        </button>
        <button onClick={handleSave} disabled={saving} className="text-[12px] px-5 py-2 rounded bg-primary hover:bg-primary/90 text-white font-bold transition-colors btn-press shadow-lg shadow-primary/30 disabled:opacity-50">
          {saving ? "Saving…" : "Apply & Close"}
        </button>
      </div>
    </div>
  );
}
