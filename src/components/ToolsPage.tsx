import { Shield, Volume2, AlertTriangle, Trash2, Wifi, Monitor, Wrench, Download, Cpu, Globe, Video } from "lucide-react";

const hotFixTools = [
  { icon: <Shield className="w-5 h-5" />, title: "Backup & Restore", desc: "Backup drivers before updating for safe rollback", color: "text-blue-400" },
  { icon: <Volume2 className="w-5 h-5" />, title: "Fix No Sound", desc: "Automatically detect and fix audio issues", color: "text-green-400" },
  { icon: <AlertTriangle className="w-5 h-5" />, title: "Fix Device Error", desc: "3 issues found", color: "text-yellow-400", count: 3 },
];

const sideActions = [
  { icon: <Trash2 className="w-4 h-4" />, title: "Clean Invalid Device Data", detail: "12 items", color: "text-orange-400" },
  { icon: <Wifi className="w-4 h-4" />, title: "Fix Network Failure", detail: "", color: "text-blue-400" },
  { icon: <Monitor className="w-4 h-4" />, title: "Fix Bad Resolution", detail: "", color: "text-purple-400" },
];

const otherTools = [
  { icon: <Wrench className="w-5 h-5" />, title: "Fix Incompatible Drivers", isNew: false },
  { icon: <Download className="w-5 h-5" />, title: "Offline Driver Updater", isNew: false },
  { icon: <Cpu className="w-5 h-5" />, title: "System Information", isNew: false },
  { icon: <Globe className="w-5 h-5" />, title: "Free & Fast VPN", isNew: true },
  { icon: <Video className="w-5 h-5" />, title: "Screen Recorder", isNew: true },
];

export function ToolsPage() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">Tools</h2>

      <div className="flex gap-4 mb-6">
        {/* Hot Fix Tools */}
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Hot Fix Tools</h3>
          <div className="space-y-2">
            {hotFixTools.map(tool => (
              <div key={tool.title} className="flex items-center gap-3 rounded-lg p-3 border border-border hover:border-gray-600 transition-colors cursor-pointer"
                style={{ background: "hsl(220 14% 15%)" }}>
                <div className={tool.color}>{tool.icon}</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-200 font-medium">{tool.title}</div>
                  <div className="text-[11px] text-gray-500">{tool.desc}</div>
                </div>
                {tool.count && (
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">{tool.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Side actions */}
        <div className="w-56 shrink-0">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {sideActions.map(action => (
              <button key={action.title} className="w-full flex items-center gap-2 rounded-lg p-3 border border-border hover:border-gray-600 transition-colors text-left"
                style={{ background: "hsl(220 14% 15%)" }}>
                <div className={action.color}>{action.icon}</div>
                <div>
                  <div className="text-xs text-gray-200">{action.title}</div>
                  {action.detail && <div className="text-[10px] text-gray-500">{action.detail}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Other Useful Tools */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Other Useful Tools</h3>
      <div className="grid grid-cols-3 gap-2">
        {otherTools.map(tool => (
          <div key={tool.title} className="flex items-center gap-3 rounded-lg p-3 border border-border hover:border-gray-600 transition-colors cursor-pointer relative"
            style={{ background: "hsl(220 14% 15%)" }}>
            <div className="text-gray-400">{tool.icon}</div>
            <span className="text-sm text-gray-300">{tool.title}</span>
            {tool.isNew && (
              <span className="absolute top-1.5 right-1.5 text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">NEW</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
