import type { ElectronSystemInfo } from "@/types/electron";

export interface SystemInfo {
  os: {
    name: string;
    version: string;
    architecture: string;
    platform: string;
    hostname?: string;
    uptime?: number;
  };
  cpu: {
    cores: number;
    physicalCores?: number;
    name: string;
    speed?: number;
  };
  gpu: {
    vendor: string;
    renderer: string;
    vramMB?: number;
    driverVersion?: string;
    additionalGPUs?: { name: string; vendor: string; vramMB: number }[];
  };
  ram: {
    totalGB: number | null;
    freeGB?: number | null;
    usedGB?: number | null;
    modules?: { capacityGB: number; manufacturer: string; speedMHz: number | null }[];
  };
  motherboard?: {
    manufacturer: string;
    product: string;
  };
  disks?: { model: string; sizeGB: number; interface: string; mediaType: string }[];
  audio?: { manufacturer: string; name: string }[];
  network: {
    type: string | null;
    downlink: number | null;
    adapters?: { name: string; manufacturer?: string }[];
  };
  display: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  browser: {
    name: string;
    language: string;
  };
  source: "electron" | "browser" | "electron-limited";
}

export interface HardwareKeyword {
  keyword: string;
  category: string;
}

// ── Electron-native detection (accurate) ──

function fromElectron(e: ElectronSystemInfo): SystemInfo {
  const primaryGPU = e.gpu[0] || { name: "Unknown GPU", vendor: "Unknown", vramMB: 0, driverVersion: "N/A" };
  const additionalGPUs = e.gpu.slice(1).map(g => ({ name: g.name, vendor: g.vendor, vramMB: g.vramMB }));

  return {
    os: {
      name: e.os.name,
      version: e.os.version,
      architecture: e.os.architecture,
      platform: e.os.platform,
      hostname: e.os.hostname,
      uptime: e.os.uptime,
    },
    cpu: {
      cores: e.cpu.cores,
      physicalCores: e.cpu.physicalCores,
      name: e.cpu.name,
      speed: e.cpu.speed,
    },
    gpu: {
      vendor: primaryGPU.vendor,
      renderer: primaryGPU.name,
      vramMB: primaryGPU.vramMB,
      driverVersion: primaryGPU.driverVersion,
      additionalGPUs: additionalGPUs.length > 0 ? additionalGPUs : undefined,
    },
    ram: {
      totalGB: e.ram.totalGB,
      freeGB: e.ram.freeGB,
      usedGB: e.ram.usedGB,
      modules: e.ram.modules?.map(m => ({
        capacityGB: m.capacityGB,
        manufacturer: m.manufacturer,
        speedMHz: m.speedMHz,
      })),
    },
    motherboard: e.motherboard ? {
      manufacturer: e.motherboard.manufacturer,
      product: e.motherboard.product,
    } : undefined,
    disks: e.disks,
    audio: e.audio,
    network: {
      type: null,
      downlink: null,
      adapters: [
        ...e.network.adapters.map(a => ({ name: a.name, manufacturer: undefined })),
        ...e.network.detailedAdapters.map(a => ({ name: a.name, manufacturer: a.manufacturer })),
      ],
    },
    display: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
    },
    browser: { name: "Electron", language: navigator.language || "en" },
    source: "electron",
  };
}

// ── Browser fallback detection ──

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
      if (ntVersion >= 10.0) version = "10/11";
      else if (ntVersion >= 6.3) version = "8.1";
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
  const name = cores > 0
    ? `Processeur ${cores} cœurs (détection limitée)`
    : "Processeur inconnu (détection limitée)";
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

// ── Public API ──

/** Check if running inside Electron */
export function isRunningInElectron(): boolean {
  // 1. Check preload bridge flag
  if (window.electronAPI?.isElectron) return true;
  // 2. Check userAgent
  if (navigator.userAgent.toLowerCase().includes("electron")) return true;
  // 3. Check for node process
  if (typeof process !== "undefined" && process.versions && (process.versions as any).electron) return true;
  return false;
}

/** Detect system info — uses Electron native APIs if available, otherwise browser fallback */
export async function detectSystemInfoAsync(): Promise<SystemInfo> {
  const inElectron = isRunningInElectron();
  console.log("[SystemDetection] Environment:", inElectron ? "Electron" : "Browser", "| electronAPI:", !!window.electronAPI, "| getSystemInfo:", !!window.electronAPI?.getSystemInfo);
  
  if (inElectron && window.electronAPI?.getSystemInfo) {
    try {
      const electronInfo = await window.electronAPI.getSystemInfo();
      console.log("[SystemDetection] Electron data received:", !!electronInfo);
      if (electronInfo) {
        return fromElectron(electronInfo);
      }
    } catch (e) {
      console.warn("Electron system detection failed, falling back to browser:", e);
    }
  }
  
  // If we're in Electron but getSystemInfo failed, still mark source appropriately
  const browserInfo = detectSystemInfoBrowser();
  if (inElectron) {
    browserInfo.source = "electron-limited";
  }
  return browserInfo;
}

/** Synchronous browser-only detection (legacy compat) */
export function detectSystemInfo(): SystemInfo {
  return detectSystemInfoBrowser();
}

function detectSystemInfoBrowser(): SystemInfo {
  return {
    os: detectOS(),
    cpu: detectCPU(),
    gpu: detectGPU(),
    ram: detectRAM(),
    display: detectDisplay(),
    network: detectNetwork(),
    browser: detectBrowser(),
    source: "browser",
  };
}

/** Extract detected vendors from hardware for pre-filtering drivers */
export function getDetectedVendors(info: SystemInfo): string[] {
  const vendors = new Set<string>();

  // Always include Microsoft for generic system drivers
  vendors.add("microsoft");

  // GPU vendor
  const gpu = (info.gpu.renderer + " " + info.gpu.vendor).toLowerCase();
  if (gpu.includes("nvidia") || gpu.includes("geforce")) vendors.add("nvidia");
  if (gpu.includes("amd") || gpu.includes("radeon")) vendors.add("amd");
  if (gpu.includes("intel")) vendors.add("intel");
  if (gpu.includes("apple")) vendors.add("apple");

  // Additional GPUs
  if (info.gpu.additionalGPUs) {
    for (const g of info.gpu.additionalGPUs) {
      const n = (g.name + " " + g.vendor).toLowerCase();
      if (n.includes("nvidia") || n.includes("geforce")) vendors.add("nvidia");
      if (n.includes("amd") || n.includes("radeon")) vendors.add("amd");
      if (n.includes("intel")) vendors.add("intel");
    }
  }

  // CPU vendor
  const cpu = info.cpu.name.toLowerCase();
  if (cpu.includes("intel")) vendors.add("intel");
  if (cpu.includes("amd") || cpu.includes("ryzen")) vendors.add("amd");
  if (cpu.includes("apple")) vendors.add("apple");

  // Motherboard vendor
  if (info.motherboard) {
    const mb = info.motherboard.manufacturer.toLowerCase();
    if (mb.includes("asus")) vendors.add("asus");
    if (mb.includes("msi")) vendors.add("msi");
    if (mb.includes("gigabyte")) vendors.add("gigabyte");
    if (mb.includes("asrock")) vendors.add("asrock");
    if (mb.includes("dell")) vendors.add("dell");
    if (mb.includes("hp") || mb.includes("hewlett")) vendors.add("hp");
    if (mb.includes("lenovo")) vendors.add("lenovo");
  }

  // Audio devices
  if (info.audio) {
    for (const dev of info.audio) {
      const n = dev.name.toLowerCase();
      if (n.includes("realtek")) vendors.add("realtek");
      if (n.includes("creative")) vendors.add("creative");
      if (n.includes("nvidia")) vendors.add("nvidia");
      if (n.includes("amd")) vendors.add("amd");
    }
  }

  // Network adapters
  if (info.network?.adapters) {
    for (const a of info.network.adapters) {
      const n = (a.name + " " + (a.manufacturer || "")).toLowerCase();
      if (n.includes("realtek")) vendors.add("realtek");
      if (n.includes("intel")) vendors.add("intel");
      if (n.includes("qualcomm") || n.includes("atheros")) vendors.add("qualcomm");
      if (n.includes("broadcom")) vendors.add("broadcom");
      if (n.includes("mediatek")) vendors.add("mediatek");
      if (n.includes("tp-link")) vendors.add("tp-link");
    }
  }

  // Storage devices
  if (info.disks) {
    for (const d of info.disks) {
      const m = d.model.toLowerCase();
      if (m.includes("samsung")) vendors.add("samsung");
      if (m.includes("western digital") || m.includes("wd")) vendors.add("western digital");
      if (m.includes("seagate")) vendors.add("seagate");
      if (m.includes("crucial") || m.includes("micron")) vendors.add("crucial");
      if (m.includes("kingston")) vendors.add("kingston");
      if (m.includes("sandisk")) vendors.add("sandisk");
    }
  }

  return Array.from(vendors);
}

/** Extract the GPU vendor string for exclusion filtering */
export function getGPUVendorHint(info: SystemInfo): string {
  const renderer = info.gpu.renderer.toLowerCase();
  const vendor = info.gpu.vendor.toLowerCase();
  if (renderer.includes("nvidia") || renderer.includes("geforce") || vendor.includes("nvidia")) return "nvidia";
  if (renderer.includes("radeon") || renderer.includes("amd") || vendor.includes("amd")) return "amd";
  if (renderer.includes("intel") || vendor.includes("intel")) return "intel";
  if (renderer.includes("apple") || vendor.includes("apple")) return "apple";
  return "unknown";
}

/** Returns contextual keywords with category hints for matching drivers */
export function getHardwareKeywords(info: SystemInfo): HardwareKeyword[] {
  const keywords: HardwareKeyword[] = [];

  // GPU keywords
  const gpu = info.gpu.renderer.toLowerCase();
  const gpuVendor = info.gpu.vendor.toLowerCase();

  if (gpu.includes("nvidia") || gpu.includes("geforce") || gpuVendor.includes("nvidia")) {
    keywords.push({ keyword: "nvidia", category: "display" });
    keywords.push({ keyword: "geforce", category: "display" });
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
    const irisMatch = gpu.match(/(iris\s*\w*|uhd\s*\d*|hd\s*graphics\s*\d*|arc\s*\w*)/i);
    if (irisMatch) keywords.push({ keyword: irisMatch[1].trim().toLowerCase(), category: "display" });
  }

  // OS keywords
  const os = info.os.name.toLowerCase();
  if (os.includes("windows")) keywords.push({ keyword: "windows", category: "system" });
  if (os.includes("mac")) keywords.push({ keyword: "macos", category: "system" });
  if (os.includes("linux")) keywords.push({ keyword: "linux", category: "system" });

  // CPU vendor
  const cpu = info.cpu.name.toLowerCase();
  if (cpu.includes("intel")) keywords.push({ keyword: "intel", category: "chipset" });
  if (cpu.includes("amd") || cpu.includes("ryzen")) keywords.push({ keyword: "amd", category: "chipset" });
  if (cpu.includes("apple")) keywords.push({ keyword: "apple", category: "chipset" });

  // Electron-specific: motherboard, audio, network adapters, disks
  if (info.motherboard) {
    const mb = info.motherboard.manufacturer.toLowerCase();
    if (mb.includes("asus")) keywords.push({ keyword: "asus", category: "chipset" });
    if (mb.includes("msi")) keywords.push({ keyword: "msi", category: "chipset" });
    if (mb.includes("gigabyte")) keywords.push({ keyword: "gigabyte", category: "chipset" });
    if (mb.includes("asrock")) keywords.push({ keyword: "asrock", category: "chipset" });
  }

  if (info.audio) {
    for (const dev of info.audio) {
      const name = dev.name.toLowerCase();
      if (name.includes("realtek")) keywords.push({ keyword: "realtek", category: "audio" });
      if (name.includes("creative")) keywords.push({ keyword: "creative", category: "audio" });
      if (name.includes("nvidia")) keywords.push({ keyword: "nvidia", category: "audio" });
      if (name.includes("amd")) keywords.push({ keyword: "amd", category: "audio" });
    }
  }

  if (info.network?.adapters) {
    for (const adapter of info.network.adapters) {
      const name = (adapter.name + " " + (adapter.manufacturer || "")).toLowerCase();
      if (name.includes("realtek")) keywords.push({ keyword: "realtek", category: "network" });
      if (name.includes("intel")) keywords.push({ keyword: "intel", category: "network" });
      if (name.includes("qualcomm") || name.includes("atheros")) keywords.push({ keyword: "qualcomm", category: "network" });
      if (name.includes("broadcom")) keywords.push({ keyword: "broadcom", category: "network" });
      if (name.includes("mediatek")) keywords.push({ keyword: "mediatek", category: "network" });
    }
  }

  if (info.disks) {
    for (const disk of info.disks) {
      const model = disk.model.toLowerCase();
      if (model.includes("samsung")) keywords.push({ keyword: "samsung", category: "storage" });
      if (model.includes("western digital") || model.includes("wd")) keywords.push({ keyword: "western digital", category: "storage" });
      if (model.includes("seagate")) keywords.push({ keyword: "seagate", category: "storage" });
      if (model.includes("crucial") || model.includes("micron")) keywords.push({ keyword: "crucial", category: "storage" });
      if (model.includes("kingston")) keywords.push({ keyword: "kingston", category: "storage" });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return keywords.filter(k => {
    const key = `${k.keyword}:${k.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
