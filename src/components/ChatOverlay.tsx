import { useState } from "react";
import { X, Send, MessageSquare } from "lucide-react";

interface ChatOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function ChatOverlay({ open, onClose }: ChatOverlayProps) {
  const [message, setMessage] = useState("");

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[520px] z-50 flex flex-col rounded-xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ background: "hsl(220 18% 9%)", border: "1px solid hsl(220 10% 20%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ borderBottom: "1px solid hsl(220 10% 16%)" }}>
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4.5 h-4.5 text-primary" />
            <span className="text-sm font-bold text-foreground">Support Chat</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Bot welcome message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="rounded-lg px-4 py-3 max-w-[280px]" style={{ background: "hsl(220 14% 16%)" }}>
              <p className="text-xs text-foreground/90 leading-relaxed">
                Hello! 👋 Welcome to Driver Booster support. How can I help you today?
              </p>
              <span className="text-[10px] text-muted-foreground mt-1.5 block">Just now</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 pl-11">
            {["Update drivers", "License issue", "Technical problem", "Other"].map(q => (
              <button key={q} className="text-[11px] px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid hsl(220 10% 16%)" }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "hsl(220 14% 14%)", border: "1px solid hsl(220 10% 22%)" }}>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
              <Send className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
