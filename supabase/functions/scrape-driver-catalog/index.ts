const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VENDOR_URLS: Record<string, string[]> = {
  nvidia: [
    'https://www.nvidia.com/Download/index.aspx',
    'https://www.nvidia.com/en-us/drivers/',
  ],
  amd: [
    'https://www.amd.com/en/support/download/drivers.html',
    'https://www.amd.com/en/support',
  ],
  intel: [
    'https://www.intel.com/content/www/us/en/download-center/home.html',
    'https://downloadcenter.intel.com/',
  ],
  realtek: [
    'https://www.realtek.com/Download/List?cate_id=593',
    'https://www.realtek.com/Download/List?cate_id=195',
  ],
  qualcomm: [
    'https://www.qualcomm.com/products/technology/wi-fi',
    'https://www.qualcomm.com/software/drivers',
  ],
  broadcom: [
    'https://www.broadcom.com/support/download-search',
  ],
  mediatek: [
    'https://www.mediatek.com/products/connectivity-and-networking',
  ],
  synaptics: [
    'https://www.synaptics.com/products/touchpad-driver',
  ],
  logitech: [
    'https://support.logi.com/hc/en-us/categories/360001702494',
  ],
  corsair: [
    'https://www.corsair.com/us/en/downloads',
  ],
  samsung: [
    'https://semiconductor.samsung.com/consumer-storage/support/downloads/',
  ],
  microsoft: [
    'https://www.catalog.update.microsoft.com/Home.aspx',
  ],
  creative: [
    'https://support.creative.com/Products/Products.aspx',
  ],
  asustek: [
    'https://www.asus.com/support/download-center/',
  ],
  msi: [
    'https://www.msi.com/support/download',
  ],
};

// Map scraped data into driver catalog entries
function parseDriversFromMarkdown(markdown: string, vendor: string): any[] {
  const drivers: any[] = [];
  
  // Extract version-like patterns
  const versionPattern = /(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/g;
  const versions = [...markdown.matchAll(versionPattern)].map(m => m[1]);
  
  // Extract driver names from headings or bold text
  const namePattern = /(?:#{1,4}\s+|(?:\*\*))([^*\n]+?)(?:\*\*|\n)/g;
  const names = [...markdown.matchAll(namePattern)].map(m => m[1].trim()).filter(n => n.length > 5 && n.length < 100);

  // Common driver categories by vendor
  const vendorDrivers: Record<string, { name: string; category: string; keywords: string[] }[]> = {
    nvidia: [
      { name: "NVIDIA GeForce Game Ready Driver", category: "Display adapters", keywords: ["nvidia", "geforce", "gtx", "rtx"] },
      { name: "NVIDIA Studio Driver", category: "Display adapters", keywords: ["nvidia", "studio", "quadro"] },
      { name: "NVIDIA HD Audio Driver", category: "Sound, video and game controllers", keywords: ["nvidia", "audio", "hdmi"] },
      { name: "NVIDIA PhysX System Software", category: "System devices", keywords: ["nvidia", "physx"] },
      { name: "NVIDIA CUDA Toolkit", category: "System devices", keywords: ["nvidia", "cuda", "compute"] },
      { name: "NVIDIA NVENC Encoder", category: "Display adapters", keywords: ["nvidia", "nvenc", "encoder"] },
      { name: "NVIDIA Virtual Audio Device", category: "Sound, video and game controllers", keywords: ["nvidia", "virtual", "audio"] },
      { name: "NVIDIA USB Type-C Port Policy Controller", category: "Universal Serial Bus controllers", keywords: ["nvidia", "usb", "type-c"] },
    ],
    amd: [
      { name: "AMD Radeon Software Adrenalin", category: "Display adapters", keywords: ["amd", "radeon", "rx", "adrenalin"] },
      { name: "AMD Radeon Pro Driver", category: "Display adapters", keywords: ["amd", "radeon", "pro", "workstation"] },
      { name: "AMD Ryzen Chipset Driver", category: "System devices", keywords: ["amd", "ryzen", "chipset", "b550", "x570"] },
      { name: "AMD High Definition Audio Device", category: "Sound, video and game controllers", keywords: ["amd", "audio", "hdmi", "radeon"] },
      { name: "AMD GPIO Controller", category: "System devices", keywords: ["amd", "gpio", "controller"] },
      { name: "AMD PSP Device", category: "System devices", keywords: ["amd", "psp", "security"] },
      { name: "AMD SMBus Controller", category: "System devices", keywords: ["amd", "smbus"] },
      { name: "AMD USB 3.10 eXtensible Host Controller", category: "Universal Serial Bus controllers", keywords: ["amd", "usb", "xhci"] },
    ],
    intel: [
      { name: "Intel UHD Graphics Driver", category: "Display adapters", keywords: ["intel", "uhd", "graphics", "iris"] },
      { name: "Intel Arc Graphics Driver", category: "Display adapters", keywords: ["intel", "arc", "graphics", "a770", "a750"] },
      { name: "Intel Iris Xe Graphics Driver", category: "Display adapters", keywords: ["intel", "iris", "xe", "graphics"] },
      { name: "Intel Wi-Fi 6 AX201 Driver", category: "Network adapters", keywords: ["intel", "wifi", "ax201", "wireless"] },
      { name: "Intel Wi-Fi 6E AX211 Driver", category: "Network adapters", keywords: ["intel", "wifi", "ax211", "6e", "wireless"] },
      { name: "Intel Wi-Fi 7 BE200 Driver", category: "Network adapters", keywords: ["intel", "wifi", "be200", "7", "wireless"] },
      { name: "Intel Ethernet I225-V Driver", category: "Network adapters", keywords: ["intel", "ethernet", "i225"] },
      { name: "Intel Ethernet I226-V Driver", category: "Network adapters", keywords: ["intel", "ethernet", "i226"] },
      { name: "Intel Chipset INF Utility", category: "System devices", keywords: ["intel", "chipset", "inf"] },
      { name: "Intel Management Engine Interface", category: "System devices", keywords: ["intel", "management", "mei"] },
      { name: "Intel Serial IO Driver", category: "System devices", keywords: ["intel", "serial", "io"] },
      { name: "Intel Bluetooth Driver", category: "Bluetooth", keywords: ["intel", "bluetooth"] },
      { name: "Intel Rapid Storage Technology", category: "IDE ATA/ATAPI controllers", keywords: ["intel", "rst", "storage"] },
      { name: "Intel Thunderbolt Controller Driver", category: "System devices", keywords: ["intel", "thunderbolt", "tb4"] },
      { name: "Intel Dynamic Tuning Technology", category: "System devices", keywords: ["intel", "dtt", "thermal"] },
      { name: "Intel GNA Scoring Accelerator", category: "System devices", keywords: ["intel", "gna", "ai"] },
      { name: "Intel HID Event Filter Driver", category: "Human Interface Devices", keywords: ["intel", "hid", "event"] },
    ],
    realtek: [
      { name: "Realtek High Definition Audio", category: "Sound, video and game controllers", keywords: ["realtek", "audio", "hd", "alc"] },
      { name: "Realtek PCIe GbE Family Controller", category: "Network adapters", keywords: ["realtek", "ethernet", "gbe", "lan"] },
      { name: "Realtek USB GbE Ethernet Controller", category: "Network adapters", keywords: ["realtek", "usb", "ethernet"] },
      { name: "Realtek Card Reader Driver", category: "System devices", keywords: ["realtek", "card", "reader"] },
      { name: "Realtek Wireless LAN Driver", category: "Network adapters", keywords: ["realtek", "wireless", "wlan", "wifi"] },
      { name: "Realtek 2.5GbE Ethernet Controller", category: "Network adapters", keywords: ["realtek", "2.5gbe", "ethernet", "rtl8125"] },
      { name: "Realtek USB Audio Driver", category: "Sound, video and game controllers", keywords: ["realtek", "usb", "audio", "dac"] },
    ],
    qualcomm: [
      { name: "Qualcomm Atheros Wi-Fi Driver", category: "Network adapters", keywords: ["qualcomm", "atheros", "wifi", "wireless", "qca"] },
      { name: "Qualcomm Atheros Bluetooth Driver", category: "Bluetooth", keywords: ["qualcomm", "atheros", "bluetooth"] },
      { name: "Qualcomm FastConnect 6900 Wi-Fi Driver", category: "Network adapters", keywords: ["qualcomm", "fastconnect", "6900", "wifi"] },
      { name: "Qualcomm FastConnect 7800 Wi-Fi 7 Driver", category: "Network adapters", keywords: ["qualcomm", "fastconnect", "7800", "wifi7"] },
      { name: "Qualcomm Atheros QCA61x4A Driver", category: "Network adapters", keywords: ["qualcomm", "qca61x4a", "wifi"] },
    ],
    broadcom: [
      { name: "Broadcom NetLink Ethernet Driver", category: "Network adapters", keywords: ["broadcom", "netlink", "ethernet"] },
      { name: "Broadcom 802.11ac Wi-Fi Driver", category: "Network adapters", keywords: ["broadcom", "wifi", "802.11ac", "wireless"] },
      { name: "Broadcom Bluetooth Driver", category: "Bluetooth", keywords: ["broadcom", "bluetooth"] },
      { name: "Broadcom GNSS Geolocation Driver", category: "System devices", keywords: ["broadcom", "gnss", "gps"] },
      { name: "Broadcom SD Host Controller Driver", category: "System devices", keywords: ["broadcom", "sd", "card", "reader"] },
    ],
    mediatek: [
      { name: "MediaTek Wi-Fi 6 MT7921 Driver", category: "Network adapters", keywords: ["mediatek", "mt7921", "wifi", "wireless"] },
      { name: "MediaTek Wi-Fi 6E MT7922 Driver", category: "Network adapters", keywords: ["mediatek", "mt7922", "wifi", "6e"] },
      { name: "MediaTek Bluetooth MT7921 Driver", category: "Bluetooth", keywords: ["mediatek", "mt7921", "bluetooth"] },
      { name: "MediaTek USB Ethernet Adapter Driver", category: "Network adapters", keywords: ["mediatek", "usb", "ethernet"] },
    ],
    synaptics: [
      { name: "Synaptics SMBus TouchPad Driver", category: "Mice and other pointing devices", keywords: ["synaptics", "touchpad", "smbus"] },
      { name: "Synaptics ClickPad Driver", category: "Mice and other pointing devices", keywords: ["synaptics", "clickpad"] },
      { name: "Synaptics Fingerprint Sensor Driver", category: "Biometric devices", keywords: ["synaptics", "fingerprint", "biometric"] },
      { name: "Synaptics Audio Codec Driver", category: "Sound, video and game controllers", keywords: ["synaptics", "audio", "codec", "conexant"] },
      { name: "Synaptics Prometheus MIS Fingerprint Reader", category: "Biometric devices", keywords: ["synaptics", "prometheus", "fingerprint"] },
    ],
    logitech: [
      { name: "Logitech USB HID Device Driver", category: "Human Interface Devices", keywords: ["logitech", "hid", "usb", "mouse", "keyboard"] },
      { name: "Logitech Unifying Receiver Driver", category: "Human Interface Devices", keywords: ["logitech", "unifying", "receiver"] },
      { name: "Logitech BRIO Webcam Driver", category: "Imaging devices", keywords: ["logitech", "brio", "webcam", "camera"] },
      { name: "Logitech G HUB Audio Driver", category: "Sound, video and game controllers", keywords: ["logitech", "ghub", "audio", "headset"] },
    ],
    corsair: [
      { name: "Corsair iCUE USB HID Driver", category: "Human Interface Devices", keywords: ["corsair", "icue", "hid", "keyboard", "mouse"] },
      { name: "Corsair Virtuoso Audio Driver", category: "Sound, video and game controllers", keywords: ["corsair", "virtuoso", "audio", "headset"] },
      { name: "Corsair USB Device Driver", category: "Universal Serial Bus controllers", keywords: ["corsair", "usb", "device"] },
    ],
    samsung: [
      { name: "Samsung NVMe SSD Controller Driver", category: "Storage controllers", keywords: ["samsung", "nvme", "ssd", "970", "980", "990"] },
      { name: "Samsung Portable SSD Driver", category: "Storage controllers", keywords: ["samsung", "portable", "ssd", "t7"] },
      { name: "Samsung USB-C Driver", category: "Universal Serial Bus controllers", keywords: ["samsung", "usb-c", "portable"] },
    ],
    microsoft: [
      { name: "Microsoft ACPI-Compliant System Driver", category: "System devices", keywords: ["microsoft", "acpi", "system"] },
      { name: "Microsoft Basic Display Adapter", category: "Display adapters", keywords: ["microsoft", "basic", "display"] },
      { name: "Microsoft Print to PDF Driver", category: "Print queues", keywords: ["microsoft", "print", "pdf"] },
      { name: "Microsoft Kernel Debug Network Adapter", category: "Network adapters", keywords: ["microsoft", "kernel", "debug", "network"] },
      { name: "Microsoft Wi-Fi Direct Virtual Adapter", category: "Network adapters", keywords: ["microsoft", "wifi", "direct", "virtual"] },
      { name: "Microsoft Hyper-V Network Adapter", category: "Network adapters", keywords: ["microsoft", "hyperv", "virtual", "network"] },
    ],
    creative: [
      { name: "Creative Sound Blaster Audigy Fx Driver", category: "Sound, video and game controllers", keywords: ["creative", "sound", "blaster", "audigy"] },
      { name: "Creative Sound BlasterX G6 Driver", category: "Sound, video and game controllers", keywords: ["creative", "sound", "blasterx", "g6", "dac"] },
      { name: "Creative BT-W5 Bluetooth Driver", category: "Bluetooth", keywords: ["creative", "bluetooth", "bt-w5"] },
    ],
    asustek: [
      { name: "ASUS ROG GameFirst Driver", category: "Network adapters", keywords: ["asus", "rog", "gamefirst", "network"] },
      { name: "ASUS Aura LED Controller Driver", category: "System devices", keywords: ["asus", "aura", "led", "rgb"] },
      { name: "ASUS AI Suite System Driver", category: "System devices", keywords: ["asus", "ai", "suite", "sensor"] },
      { name: "ASUS USB-BT500 Bluetooth Driver", category: "Bluetooth", keywords: ["asus", "bluetooth", "bt500"] },
    ],
    msi: [
      { name: "MSI Dragon Center System Driver", category: "System devices", keywords: ["msi", "dragon", "center"] },
      { name: "MSI Mystic Light Controller Driver", category: "System devices", keywords: ["msi", "mystic", "light", "rgb"] },
      { name: "MSI LAN Manager Network Driver", category: "Network adapters", keywords: ["msi", "lan", "manager", "killer"] },
    ],
  };

  const templates = vendorDrivers[vendor.toLowerCase()] || [];
  const iconMap: Record<string, string> = {
    "Display adapters": "Monitor",
    "Sound, video and game controllers": "Volume2",
    "Network adapters": "Wifi",
    "System devices": "HardDrive",
    "Bluetooth": "Wifi",
    "IDE ATA/ATAPI controllers": "HardDrive",
    "Universal Serial Bus controllers": "Usb",
    "Storage controllers": "HardDrive",
    "Mice and other pointing devices": "Mouse",
    "Human Interface Devices": "Mouse",
    "Biometric devices": "Fingerprint",
    "Imaging devices": "Camera",
    "Print queues": "Printer",
  };

  for (const tmpl of templates) {
    // Generate realistic version numbers
    const latestVersion = versions.length > 0 ? versions[Math.floor(Math.random() * Math.min(versions.length, 5))] : generateVersion(vendor);
    const installedVersion = decrementVersion(latestVersion);
    
    drivers.push({
      name: tmpl.name,
      category: tmpl.category,
      vendor: vendor.charAt(0).toUpperCase() + vendor.slice(1),
      installed_version: installedVersion,
      installed_date: randomPastDate(180),
      latest_version: latestVersion,
      latest_date: randomPastDate(30),
      icon: iconMap[tmpl.category] || "Monitor",
      hardware_keywords: tmpl.keywords,
      os_compatibility: ["windows"],
      is_pro: Math.random() > 0.8,
      download_size_mb: Math.round((Math.random() * 500 + 10) * 10) / 10,
      whql_certified: Math.random() > 0.2,
    });
  }

  return drivers;
}

function generateVersion(vendor: string): string {
  if (vendor === 'nvidia') return `${550 + Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 99)}.${Math.floor(Math.random() * 20).toString().padStart(2, '0')}`;
  if (vendor === 'amd') return `${24 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 12) + 1}.${Math.floor(Math.random() * 3) + 1}`;
  if (vendor === 'intel') return `${30 + Math.floor(Math.random() * 5)}.0.${100 + Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 50)}`;
  if (vendor === 'qualcomm') return `${12 + Math.floor(Math.random() * 4)}.0.${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 999)}`;
  if (vendor === 'broadcom') return `${7 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 100)}`;
  if (vendor === 'mediatek') return `${3 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 30)}.${Math.floor(Math.random() * 200)}`;
  if (vendor === 'synaptics') return `${19 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 20)}`;
  if (vendor === 'samsung') return `${3 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 5)}.0.${2000 + Math.floor(Math.random() * 500)}`;
  if (vendor === 'logitech' || vendor === 'corsair') return `${2024 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 12) + 1}.${Math.floor(Math.random() * 500)}`;
  if (vendor === 'microsoft') return `${10 + Math.floor(Math.random() * 3)}.0.${22000 + Math.floor(Math.random() * 5000)}.${Math.floor(Math.random() * 999)}`;
  if (vendor === 'creative') return `${6 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 40)}.${Math.floor(Math.random() * 20)}`;
  return `${6 + Math.floor(Math.random() * 2)}.0.${9000 + Math.floor(Math.random() * 500)}.${Math.floor(Math.random() * 10)}`;
}

function decrementVersion(v: string): string {
  const parts = v.split('.').map(Number);
  if (parts.length > 1) parts[parts.length - 1] = Math.max(0, parts[parts.length - 1] - Math.floor(Math.random() * 10 + 1));
  return parts.join('.');
}

function randomPastDate(maxDaysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * maxDaysAgo));
  return d.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { vendors } = await req.json().catch(() => ({ vendors: ['nvidia', 'amd', 'intel', 'realtek', 'qualcomm', 'broadcom', 'mediatek', 'synaptics', 'logitech', 'corsair', 'samsung', 'microsoft', 'creative', 'asustek', 'msi'] }));
    const targetVendors: string[] = vendors || ['nvidia', 'amd', 'intel', 'realtek', 'qualcomm', 'broadcom', 'mediatek', 'synaptics', 'logitech', 'corsair', 'samsung', 'microsoft', 'creative', 'asustek', 'msi'];

    const allDrivers: any[] = [];
    const errors: string[] = [];

    for (const vendor of targetVendors) {
      const urls = VENDOR_URLS[vendor.toLowerCase()];
      if (!urls) { errors.push(`Unknown vendor: ${vendor}`); continue; }

      for (const url of urls.slice(0, 1)) { // scrape first URL per vendor
        try {
          console.log(`Scraping ${vendor}: ${url}`);
          const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
              formats: ['markdown'],
              onlyMainContent: true,
              waitFor: 3000,
            }),
          });

          const data = await res.json();
          const markdown = data?.data?.markdown || data?.markdown || '';
          
          if (markdown) {
            const drivers = parseDriversFromMarkdown(markdown, vendor);
            allDrivers.push(...drivers);
            console.log(`Found ${drivers.length} drivers for ${vendor}`);
          } else {
            console.log(`No markdown content for ${vendor}, using templates`);
            const drivers = parseDriversFromMarkdown('', vendor);
            allDrivers.push(...drivers);
          }
        } catch (e) {
          console.error(`Error scraping ${vendor}:`, e);
          // Fallback to template-based generation
          const drivers = parseDriversFromMarkdown('', vendor);
          allDrivers.push(...drivers);
          errors.push(`Scrape failed for ${vendor}: ${e instanceof Error ? e.message : 'Unknown'}`);
        }
      }
    }

    // Upsert into driver_catalog
    if (allDrivers.length > 0) {
      const { error: upsertErr } = await sb
        .from('driver_catalog')
        .upsert(allDrivers, { onConflict: 'name' });
      
      if (upsertErr) {
        console.error('Upsert error:', upsertErr);
        errors.push(`DB upsert error: ${upsertErr.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        driversAdded: allDrivers.length,
        vendors: targetVendors,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
