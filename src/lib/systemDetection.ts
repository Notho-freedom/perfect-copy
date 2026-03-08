export interface SystemInfo {
  os: {
    name: string;
    version: string;
    architecture: string;
    platform: string;
  };
  cpu: {
    cores: number;
    name: string;
  };
  gpu: {
    vendor: string;
    renderer: string;
  };
  ram: {
    totalGB: number | null;
  };
  display: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  network: {
    type: string | null;
    downlink: number | null;
  };
  browser: {
    name: string;
    language: string;
  };
}

function detectOS(): SystemInfo["os"] {
  const ua = navigator.userAgent;
  let name = "Unknown OS";
  let version = "";
  let architecture = "x64";

  if (ua.includes("Win")) {
    name = "Microsoft Windows";
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const ntVersion = parseFloat(match[1]);
      if (ntVersion >= 10.0) {
        // Check for Windows 11 via platform or client hints
        version = ua.includes("Windows NT 10.0") ? "10/11" : `NT ${match[1]}`;
      } else if (ntVersion >= 6.3) version = "8.1";
      else if (ntVersion >= 6.2) version = "8";
      else if (ntVersion >= 6.1) version = "7";
      else version = `NT ${match[1]}`;
    }
  } else if (ua.includes("Mac OS X")) {
    name = "macOS";
    const match = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    if (match) version = match[1].replace(/_/g, ".");
  } else if (ua.includes("Linux")) {
    name = "Linux";
    if (ua.includes("Ubuntu")) name = "Ubuntu Linux";
    else if (ua.includes("Fedora")) name = "Fedora Linux";
  } else if (ua.includes("CrOS")) {
    name = "Chrome OS";
  }

  if (ua.includes("WOW64") || ua.includes("Win64") || ua.includes("x86_64") || ua.includes("x64")) {
    architecture = "x64";
  } else if (ua.includes("ARM") || ua.includes("aarch64")) {
    architecture = "ARM64";
  } else {
    architecture = "x86";
  }

  return { name, version, architecture, platform: navigator.platform || "Unknown" };
}

function detectCPU(): SystemInfo["cpu"] {
  const cores = navigator.hardwareConcurrency || 0;
  
  // Try to infer CPU from user agent
  const ua = navigator.userAgent;
  let name = `${cores}-Core Processor`;
  
  if (ua.includes("Win")) {
    if (cores >= 16) name = `Intel Core i9 / AMD Ryzen 9 (${cores} cores)`;
    else if (cores >= 12) name = `Intel Core i7 / AMD Ryzen 7 (${cores} cores)`;
    else if (cores >= 8) name = `Intel Core i5 / AMD Ryzen 5 (${cores} cores)`;
    else if (cores >= 4) name = `Intel Core i3 / AMD Ryzen 3 (${cores} cores)`;
    else name = `Dual-Core Processor (${cores} cores)`;
  } else if (ua.includes("Mac")) {
    if (cores >= 10) name = `Apple M1 Pro/Max (${cores} cores)`;
    else if (cores >= 8) name = `Apple M1/M2 (${cores} cores)`;
    else name = `Apple Processor (${cores} cores)`;
  }

  return { cores, name };
}

function detectGPU(): SystemInfo["gpu"] {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        return {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "Unknown",
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "Unknown",
        };
      }
    }
  } catch (e) {
    console.warn("WebGL detection failed:", e);
  }
  return { vendor: "Unknown", renderer: "Unknown GPU" };
}

function detectRAM(): SystemInfo["ram"] {
  // navigator.deviceMemory is available in some browsers (Chrome)
  const nav = navigator as any;
  const totalGB = nav.deviceMemory || null;
  return { totalGB };
}

function detectDisplay(): SystemInfo["display"] {
  return {
    width: screen.width,
    height: screen.height,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
  };
}

function detectNetwork(): SystemInfo["network"] {
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (conn) {
    return {
      type: conn.effectiveType || conn.type || null,
      downlink: conn.downlink || null,
    };
  }
  return { type: null, downlink: null };
}

function detectBrowser(): SystemInfo["browser"] {
  const ua = navigator.userAgent;
  let name = "Unknown";
  if (ua.includes("Firefox")) name = "Firefox";
  else if (ua.includes("Edg/")) name = "Microsoft Edge";
  else if (ua.includes("Chrome")) name = "Google Chrome";
  else if (ua.includes("Safari")) name = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) name = "Opera";

  return { name, language: navigator.language || "en" };
}

export function detectSystemInfo(): SystemInfo {
  return {
    os: detectOS(),
    cpu: detectCPU(),
    gpu: detectGPU(),
    ram: detectRAM(),
    display: detectDisplay(),
    network: detectNetwork(),
    browser: detectBrowser(),
  };
}

/** Returns keywords for matching drivers in the catalog based on detected hardware */
export function getHardwareKeywords(info: SystemInfo): string[] {
  const keywords: string[] = [];
  
  const gpu = info.gpu.renderer.toLowerCase();
  if (gpu.includes("nvidia") || gpu.includes("geforce")) keywords.push("nvidia", "geforce");
  if (gpu.includes("amd") || gpu.includes("radeon")) keywords.push("amd", "radeon");
  if (gpu.includes("intel")) keywords.push("intel");
  
  const os = info.os.name.toLowerCase();
  if (os.includes("windows")) keywords.push("windows");
  if (os.includes("mac")) keywords.push("macos");
  if (os.includes("linux")) keywords.push("linux");
  
  // Always include generic keywords
  keywords.push("realtek", "usb", "bluetooth", "network", "audio", "hid");
  
  return keywords;
}
