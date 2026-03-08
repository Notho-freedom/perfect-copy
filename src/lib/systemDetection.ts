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

export interface HardwareKeyword {
  keyword: string;
  category: string;
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

/** Extract the GPU vendor string for exclusion filtering */
export function getGPUVendorHint(info: SystemInfo): string {
  const renderer = info.gpu.renderer.toLowerCase();
  const vendor = info.gpu.vendor.toLowerCase();
  if (renderer.includes("nvidia") || renderer.includes("geforce") || vendor.includes("nvidia")) return "nvidia";
  if (renderer.includes("radeon") || renderer.includes("amd") || vendor.includes("amd")) return "amd";
  if (renderer.includes("intel") || vendor.includes("intel")) return "intel";
  return "unknown";
}

/** Returns contextual keywords with category hints for matching drivers in the catalog */
export function getHardwareKeywords(info: SystemInfo): HardwareKeyword[] {
  const keywords: HardwareKeyword[] = [];

  // GPU-specific keywords with display/graphics category
  const gpu = info.gpu.renderer.toLowerCase();
  const gpuVendor = info.gpu.vendor.toLowerCase();

  if (gpu.includes("nvidia") || gpu.includes("geforce") || gpuVendor.includes("nvidia")) {
    keywords.push({ keyword: "nvidia", category: "display" });
    keywords.push({ keyword: "geforce", category: "display" });
    // Extract specific GPU model if possible (e.g. "RTX 3060", "GTX 1080")
    const rtxMatch = gpu.match(/(rtx\s*\d{4}\s*\w*|gtx\s*\d{4}\s*\w*)/i);
    if (rtxMatch) keywords.push({ keyword: rtxMatch[1].trim().toLowerCase(), category: "display" });
  }
  if (gpu.includes("amd") || gpu.includes("radeon") || gpuVendor.includes("amd")) {
    keywords.push({ keyword: "amd", category: "display" });
    keywords.push({ keyword: "radeon", category: "display" });
    const rxMatch = gpu.match(/(rx\s*\d{4}\s*\w*|vega\s*\d*)/i);
    if (rxMatch) keywords.push({ keyword: rxMatch[1].trim().toLowerCase(), category: "display" });
  }
  if (gpu.includes("intel") || gpuVendor.includes("intel")) {
    keywords.push({ keyword: "intel", category: "display" });
    const irisMatch = gpu.match(/(iris\s*\w*|uhd\s*\d*|hd\s*graphics\s*\d*)/i);
    if (irisMatch) keywords.push({ keyword: irisMatch[1].trim().toLowerCase(), category: "display" });
  }

  // OS keywords
  const os = info.os.name.toLowerCase();
  if (os.includes("windows")) keywords.push({ keyword: "windows", category: "system" });
  if (os.includes("mac")) keywords.push({ keyword: "macos", category: "system" });
  if (os.includes("linux")) keywords.push({ keyword: "linux", category: "system" });

  // CPU vendor keywords with processor category
  const cpu = info.cpu.name.toLowerCase();
  if (cpu.includes("intel")) keywords.push({ keyword: "intel", category: "chipset" });
  if (cpu.includes("amd") || cpu.includes("ryzen")) keywords.push({ keyword: "amd", category: "chipset" });
  if (cpu.includes("apple")) keywords.push({ keyword: "apple", category: "chipset" });

  return keywords;
}
