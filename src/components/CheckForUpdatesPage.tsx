import { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Check, Download, Shield, Sparkles } from "lucide-react";

interface CheckForUpdatesPageProps {
  onBack: () => void;
}

type CheckState = "checking" | "up-to-date" | "update-available";

const steps = [
  "Connecting to update server...",
  "Verifying current version...",
  "Checking for new releases...",
  "Validating digital signatures...",
  "Finalizing...",
];

export function CheckForUpdatesPage({ onBack }: CheckForUpdatesPageProps) {
  const [state, setState] = useState<CheckState>("checking");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  // Animated dots
  useEffect(() => {
    if (state !== "checking") return;
    const iv = setInterval(() => setDotCount((d) => (d + 1) % 4), 400);
    return () => clearInterval(iv);
  }, [state]);

  // Progress simulation
  useEffect(() => {
    if (state !== "checking") return;
    const iv = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 8 + 2;
        if (next >= 100) {
          clearInterval(iv);
          setTimeout(() => {
            // 70% chance up-to-date, 30% update available
            setState(Math.random() > 0.3 ? "up-to-date" : "update-available");
          }, 500);
          return 100;
        }
        setCurrentStep(Math.min(Math.floor((next / 100) * steps.length), steps.length - 1));
        return next;
      });
    }, 200);
    return () => clearInterval(iv);
  }, [state]);

  const handleRetry = () => {
    setState("checking");
    setProgress(0);
    setCurrentStep(0);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid hsl(220 10% 18%)" }}>
        <button onClick={onBack} className="p-1.5 rounded hover:bg-white/10 transition-colors btn-press">
          <ArrowLeft className="w-4.5 h-4.5 text-muted-foreground" />
        </button>
        <RefreshCw className="w-4 h-4 text-green-400" />
        <h1 className="text-[15px] font-bold text-foreground tracking-wide">Check for Updates</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {state === "checking" && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            {/* Spinning icon */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full" style={{
                border: "3px solid hsl(220 10% 20%)",
              }} />
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(142 60% 45%)" strokeWidth="3"
                  strokeDasharray={289} strokeDashoffset={289 - (progress / 100) * 289}
                  strokeLinecap="round" className="transition-all duration-200"
                  style={{ filter: "drop-shadow(0 0 6px hsl(142 60% 45% / 0.5))" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-green-400 animate-spin-slow" />
              </div>
            </div>

            {/* Progress text */}
            <div className="text-center space-y-2">
              <div className="text-[14px] font-semibold text-foreground/90">
                Checking for updates{".".repeat(dotCount)}
              </div>
              <div className="text-[12px] text-muted-foreground transition-all duration-300">
                {steps[currentStep]}
              </div>
              <div className="text-[11px] text-muted-foreground/60 font-mono">
                {Math.round(progress)}%
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(220 10% 18%)" }}>
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, hsl(142 60% 40%), hsl(142 70% 50%))",
                  boxShadow: "0 0 10px hsl(142 60% 45% / 0.5)",
                }}
              />
            </div>
          </div>
        )}

        {state === "up-to-date" && (
          <div className="flex flex-col items-center gap-5 animate-scale-in">
            {/* Success icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
              background: "radial-gradient(circle, hsl(142 50% 20%), hsl(142 40% 12%))",
              boxShadow: "0 0 30px hsl(142 60% 45% / 0.3), inset 0 2px 10px hsl(142 60% 45% / 0.2)",
            }}>
              <Check className="w-10 h-10 text-green-400" strokeWidth={3} />
            </div>

            <div className="text-center space-y-2">
              <div className="text-[16px] font-bold text-foreground">You're up to date!</div>
              <div className="text-[12px] text-muted-foreground">Driver Booster 13.1 is the latest version.</div>
              <div className="text-[11px] text-muted-foreground/60 mt-1">Last checked: just now</div>
            </div>

            <div className="flex items-center gap-3 mt-4 px-5 py-3 rounded-lg" style={{ background: "hsl(220 14% 11%)", border: "1px solid hsl(220 10% 18%)" }}>
              <Shield className="w-4 h-4 text-green-400 shrink-0" />
              <div>
                <div className="text-[12px] text-foreground/80 font-medium">Current Version: 13.1.0</div>
                <div className="text-[10px] text-muted-foreground">Released March 2026 • Fully up-to-date</div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleRetry} className="text-[12px] px-4 py-2 rounded border border-white/10 text-muted-foreground hover:bg-white/5 transition-colors btn-press">
                Check Again
              </button>
              <button onClick={onBack} className="text-[12px] px-5 py-2 rounded bg-primary hover:bg-primary/90 text-white font-bold transition-colors btn-press shadow-lg shadow-primary/30">
                Done
              </button>
            </div>
          </div>
        )}

        {state === "update-available" && (
          <div className="flex flex-col items-center gap-5 animate-scale-in">
            {/* Update icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
              background: "radial-gradient(circle, hsl(200 50% 20%), hsl(200 40% 12%))",
              boxShadow: "0 0 30px hsl(200 60% 50% / 0.3), inset 0 2px 10px hsl(200 60% 50% / 0.2)",
            }}>
              <Download className="w-10 h-10 text-blue-400" strokeWidth={2} />
            </div>

            <div className="text-center space-y-2">
              <div className="text-[16px] font-bold text-foreground">Update Available!</div>
              <div className="text-[12px] text-muted-foreground">A new version of Driver Booster is ready to install.</div>
            </div>

            <div className="w-full max-w-sm p-4 rounded-lg space-y-3" style={{ background: "hsl(220 14% 11%)", border: "1px solid hsl(220 10% 18%)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-foreground/80 font-medium">Current Version</span>
                <span className="text-[12px] text-muted-foreground font-mono">13.1.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-foreground/80 font-medium">New Version</span>
                <span className="text-[12px] text-blue-400 font-mono font-bold">13.2.0</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  Includes new scan optimizations, expanded driver database, and critical security fixes.
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={onBack} className="text-[12px] px-4 py-2 rounded border border-white/10 text-muted-foreground hover:bg-white/5 transition-colors btn-press">
                Later
              </button>
              <button className="text-[12px] px-5 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors btn-press shadow-lg shadow-blue-500/30 flex items-center gap-2">
                <Download className="w-3.5 h-3.5" />
                Update Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
