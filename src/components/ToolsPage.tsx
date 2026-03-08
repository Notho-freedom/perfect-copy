export function ToolsPage() {
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
          <div className="flex-1 rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover-lift hover-glow min-h-[140px]" style={{
            background: "hsl(220 14% 14%)", border: "1px solid hsl(220 10% 20%)"
          }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "hsl(220 12% 18%)" }}>
              <svg className="w-7 h-7 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
            </div>
            <span className="text-xs text-foreground font-medium text-center">Backup & Restore</span>
          </div>

          {/* Fix No Sound */}
          <div className="flex-1 rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover-lift hover-glow min-h-[140px]" style={{
            background: "hsl(220 14% 14%)", border: "1px solid hsl(220 10% 20%)"
          }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "hsl(220 12% 18%)" }}>
              <svg className="w-7 h-7 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            </div>
            <span className="text-xs text-foreground font-medium text-center">Fix No Sound</span>
          </div>

          {/* Fix Device Error */}
          <div className="flex-1 rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover-lift hover-glow relative min-h-[140px]" style={{
            background: "hsl(220 14% 14%)", border: "1px solid hsl(220 10% 20%)"
          }}>
            <div className="diagonal-badge diagonal-badge-pro" />
            <span className="diagonal-badge-text" style={{ top: '4px', left: '2px', fontSize: '7px' }}>PRO</span>

            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "hsl(220 12% 18%)" }}>
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
            { label: "Clean Invalid Device Da...", count: "59 devices", icon: <><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></> },
            { label: "Fix Network Failure", icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></> },
            { label: "Fix Bad Resolution", icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></> },
          ].map(item => (
            <div key={item.label} className="rounded-lg p-3 flex items-center gap-3 cursor-pointer hover-lift hover-glow" style={{
              background: "hsl(220 14% 14%)", border: "1px solid hsl(220 10% 20%)"
            }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "hsl(220 12% 18%)" }}>
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
          { label: "Fix Incompatible Drivers", isNew: false, icon: "wrench" },
          { label: "Offline Driver Updater", isNew: false, icon: "download" },
          { label: "System Information", isNew: false, icon: "cpu" },
          { label: "Free & Fast VPN", isNew: true, icon: "shield" },
          { label: "Screen Recorder", isNew: true, icon: "rec" },
        ].map(tool => (
          <div key={tool.label} className="rounded-lg p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover-lift hover-glow relative overflow-hidden min-h-[130px]" style={{
            background: "hsl(220 14% 14%)", border: "1px solid hsl(220 10% 20%)"
          }}>
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
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "hsl(220 12% 18%)" }}>
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
