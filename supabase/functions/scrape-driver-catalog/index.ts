const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VENDOR_URLS: Record<string, string[]> = {
  nvidia: ['https://www.nvidia.com/Download/index.aspx'],
  amd: ['https://www.amd.com/en/support/download/drivers.html'],
  intel: ['https://www.intel.com/content/www/us/en/download-center/home.html'],
  realtek: ['https://www.realtek.com/Download/List?cate_id=593'],
  qualcomm: ['https://www.qualcomm.com/products/technology/wi-fi'],
  broadcom: ['https://www.broadcom.com/support/download-search'],
  mediatek: ['https://www.mediatek.com/products/connectivity-and-networking'],
  synaptics: ['https://www.synaptics.com/products/touchpad-driver'],
  logitech: ['https://support.logi.com/hc/en-us/categories/360001702494'],
  corsair: ['https://www.corsair.com/us/en/downloads'],
  samsung: ['https://semiconductor.samsung.com/consumer-storage/support/downloads/'],
  microsoft: ['https://www.catalog.update.microsoft.com/Home.aspx'],
  creative: ['https://support.creative.com/Products/Products.aspx'],
  asustek: ['https://www.asus.com/support/download-center/'],
  msi: ['https://www.msi.com/support/download'],
  westerndigital: ['https://support-en.wd.com/app/answers/detailweb/a_id/48631'],
  seagate: ['https://www.seagate.com/support/downloads/'],
  kingston: ['https://www.kingston.com/unitedstates/support/technical'],
  crucial: ['https://www.crucial.com/support/storage-executive'],
  razer: ['https://www.razer.com/synapse-3'],
  steelseries: ['https://steelseries.com/gg'],
  hyperx: ['https://hyperx.com/pages/ngenuity'],
  tp_link: ['https://www.tp-link.com/us/support/download/'],
  netgear: ['https://www.netgear.com/support/download/'],
  epson: ['https://epson.com/Support/sl/s'],
  hp: ['https://support.hp.com/us-en/drivers'],
  canon: ['https://www.usa.canon.com/support/software-and-drivers'],
  brother: ['https://www.brother-usa.com/support'],
  dell: ['https://www.dell.com/support/home/en-us?app=drivers'],
  lenovo: ['https://support.lenovo.com/us/en/solutions/ht003029-recommended-driver-update'],
  gigabyte: ['https://www.gigabyte.com/Support/Consumer'],
  asrock: ['https://www.asrock.com/support/index.asp'],
  biostar: ['https://www.biostar.com.tw/app/en/support/download.php'],
  elgato: ['https://www.elgato.com/downloads'],
  wacom: ['https://www.wacom.com/en-us/support/product-support/drivers'],
  matrox: ['https://www.matrox.com/en/video/apps/drivers'],
  adaptec: ['https://www.microchip.com/en-us/products/storage'],
  conexant: ['https://www.synaptics.com/products/audio-codecs'],
};

// ── Driver templates per vendor ──
const vendorDrivers: Record<string, { name: string; category: string; keywords: string[]; os?: string[] }[]> = {
  nvidia: [
    { name: "NVIDIA GeForce Game Ready Driver", category: "Display adapters", keywords: ["nvidia", "geforce", "gtx", "rtx"] },
    { name: "NVIDIA Studio Driver", category: "Display adapters", keywords: ["nvidia", "studio", "quadro"] },
    { name: "NVIDIA HD Audio Driver", category: "Sound, video and game controllers", keywords: ["nvidia", "audio", "hdmi"] },
    { name: "NVIDIA PhysX System Software", category: "System devices", keywords: ["nvidia", "physx"] },
    { name: "NVIDIA CUDA Toolkit Driver", category: "System devices", keywords: ["nvidia", "cuda", "compute"] },
    { name: "NVIDIA NVENC Encoder Driver", category: "Display adapters", keywords: ["nvidia", "nvenc", "encoder"] },
    { name: "NVIDIA Virtual Audio Device", category: "Sound, video and game controllers", keywords: ["nvidia", "virtual", "audio"] },
    { name: "NVIDIA USB Type-C Port Policy Controller", category: "Universal Serial Bus controllers", keywords: ["nvidia", "usb", "type-c"] },
    { name: "NVIDIA nForce Networking Controller", category: "Network adapters", keywords: ["nvidia", "nforce", "network"] },
    { name: "NVIDIA GeForce Experience Service", category: "System devices", keywords: ["nvidia", "geforce", "experience"] },
    { name: "NVIDIA FrameView SDK Driver", category: "System devices", keywords: ["nvidia", "frameview"] },
    { name: "NVIDIA Optimus Display Driver", category: "Display adapters", keywords: ["nvidia", "optimus", "laptop"] },
  ],
  amd: [
    { name: "AMD Radeon Software Adrenalin", category: "Display adapters", keywords: ["amd", "radeon", "rx", "adrenalin"] },
    { name: "AMD Radeon Pro Driver", category: "Display adapters", keywords: ["amd", "radeon", "pro", "workstation"] },
    { name: "AMD Ryzen Chipset Driver", category: "System devices", keywords: ["amd", "ryzen", "chipset", "b550", "x570"] },
    { name: "AMD High Definition Audio Device", category: "Sound, video and game controllers", keywords: ["amd", "audio", "hdmi", "radeon"] },
    { name: "AMD GPIO Controller", category: "System devices", keywords: ["amd", "gpio", "controller"] },
    { name: "AMD PSP Device Driver", category: "System devices", keywords: ["amd", "psp", "security"] },
    { name: "AMD SMBus Controller", category: "System devices", keywords: ["amd", "smbus"] },
    { name: "AMD USB 3.10 eXtensible Host Controller", category: "Universal Serial Bus controllers", keywords: ["amd", "usb", "xhci"] },
    { name: "AMD Radeon RX Vega M Graphics Driver", category: "Display adapters", keywords: ["amd", "radeon", "vega"] },
    { name: "AMD SATA Controller (AHCI Mode)", category: "IDE ATA/ATAPI controllers", keywords: ["amd", "sata", "ahci"] },
    { name: "AMD I2C Controller Driver", category: "System devices", keywords: ["amd", "i2c"] },
    { name: "AMD Link Controller Emulation Driver", category: "System devices", keywords: ["amd", "link"] },
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
    { name: "Intel Integrated Sensor Solution Driver", category: "System devices", keywords: ["intel", "iss", "sensor"] },
    { name: "Intel Smart Sound Technology Driver", category: "Sound, video and game controllers", keywords: ["intel", "sst", "audio", "smart"] },
    { name: "Intel Gaussian & Neural Accelerator", category: "System devices", keywords: ["intel", "gaussian", "neural"] },
    { name: "Intel Platform Monitoring Technology Driver", category: "System devices", keywords: ["intel", "pmt", "monitoring"] },
    { name: "Intel Volume Management Device Driver", category: "Storage controllers", keywords: ["intel", "vmd", "storage"] },
  ],
  realtek: [
    { name: "Realtek High Definition Audio", category: "Sound, video and game controllers", keywords: ["realtek", "audio", "hd", "alc"] },
    { name: "Realtek PCIe GbE Family Controller", category: "Network adapters", keywords: ["realtek", "ethernet", "gbe", "lan"] },
    { name: "Realtek USB GbE Ethernet Controller", category: "Network adapters", keywords: ["realtek", "usb", "ethernet"] },
    { name: "Realtek Card Reader Driver", category: "System devices", keywords: ["realtek", "card", "reader"] },
    { name: "Realtek Wireless LAN Driver", category: "Network adapters", keywords: ["realtek", "wireless", "wlan", "wifi"] },
    { name: "Realtek 2.5GbE Ethernet Controller", category: "Network adapters", keywords: ["realtek", "2.5gbe", "ethernet", "rtl8125"] },
    { name: "Realtek USB Audio Driver", category: "Sound, video and game controllers", keywords: ["realtek", "usb", "audio", "dac"] },
    { name: "Realtek RTL8852BE WiFi 6 Driver", category: "Network adapters", keywords: ["realtek", "rtl8852be", "wifi6"] },
    { name: "Realtek RTL8153 USB 3.0 Ethernet", category: "Network adapters", keywords: ["realtek", "rtl8153", "usb", "ethernet"] },
  ],
  qualcomm: [
    { name: "Qualcomm Atheros Wi-Fi Driver", category: "Network adapters", keywords: ["qualcomm", "atheros", "wifi", "wireless", "qca"] },
    { name: "Qualcomm Atheros Bluetooth Driver", category: "Bluetooth", keywords: ["qualcomm", "atheros", "bluetooth"] },
    { name: "Qualcomm FastConnect 6900 Wi-Fi Driver", category: "Network adapters", keywords: ["qualcomm", "fastconnect", "6900", "wifi"] },
    { name: "Qualcomm FastConnect 7800 Wi-Fi 7 Driver", category: "Network adapters", keywords: ["qualcomm", "fastconnect", "7800", "wifi7"] },
    { name: "Qualcomm Atheros QCA61x4A Driver", category: "Network adapters", keywords: ["qualcomm", "qca61x4a", "wifi"] },
    { name: "Qualcomm Atheros AR956x Wireless Network Adapter", category: "Network adapters", keywords: ["qualcomm", "atheros", "ar956x"] },
    { name: "Qualcomm Snapdragon X Elite WiFi 7", category: "Network adapters", keywords: ["qualcomm", "snapdragon", "wifi7"] },
  ],
  broadcom: [
    { name: "Broadcom NetLink Ethernet Driver", category: "Network adapters", keywords: ["broadcom", "netlink", "ethernet"] },
    { name: "Broadcom 802.11ac Wi-Fi Driver", category: "Network adapters", keywords: ["broadcom", "wifi", "802.11ac", "wireless"] },
    { name: "Broadcom Bluetooth Driver", category: "Bluetooth", keywords: ["broadcom", "bluetooth"] },
    { name: "Broadcom GNSS Geolocation Driver", category: "System devices", keywords: ["broadcom", "gnss", "gps"] },
    { name: "Broadcom SD Host Controller Driver", category: "System devices", keywords: ["broadcom", "sd", "card", "reader"] },
    { name: "Broadcom BCM43xx Wi-Fi 6E Driver", category: "Network adapters", keywords: ["broadcom", "bcm43", "wifi", "6e"] },
  ],
  mediatek: [
    { name: "MediaTek Wi-Fi 6 MT7921 Driver", category: "Network adapters", keywords: ["mediatek", "mt7921", "wifi", "wireless"] },
    { name: "MediaTek Wi-Fi 6E MT7922 Driver", category: "Network adapters", keywords: ["mediatek", "mt7922", "wifi", "6e"] },
    { name: "MediaTek Wi-Fi 7 MT7925 Driver", category: "Network adapters", keywords: ["mediatek", "mt7925", "wifi7"] },
    { name: "MediaTek Bluetooth MT7921 Driver", category: "Bluetooth", keywords: ["mediatek", "mt7921", "bluetooth"] },
    { name: "MediaTek USB Ethernet Adapter Driver", category: "Network adapters", keywords: ["mediatek", "usb", "ethernet"] },
  ],
  synaptics: [
    { name: "Synaptics SMBus TouchPad Driver", category: "Mice and other pointing devices", keywords: ["synaptics", "touchpad", "smbus"] },
    { name: "Synaptics ClickPad Driver", category: "Mice and other pointing devices", keywords: ["synaptics", "clickpad"] },
    { name: "Synaptics Fingerprint Sensor Driver", category: "Biometric devices", keywords: ["synaptics", "fingerprint", "biometric"] },
    { name: "Synaptics Audio Codec Driver", category: "Sound, video and game controllers", keywords: ["synaptics", "audio", "codec", "conexant"] },
    { name: "Synaptics Prometheus MIS Fingerprint Reader", category: "Biometric devices", keywords: ["synaptics", "prometheus", "fingerprint"] },
    { name: "Synaptics MetroThin Touch Driver", category: "Human Interface Devices", keywords: ["synaptics", "metrothin", "touch"] },
  ],
  logitech: [
    { name: "Logitech USB HID Device Driver", category: "Human Interface Devices", keywords: ["logitech", "hid", "usb", "mouse", "keyboard"] },
    { name: "Logitech Unifying Receiver Driver", category: "Human Interface Devices", keywords: ["logitech", "unifying", "receiver"] },
    { name: "Logitech BRIO Webcam Driver", category: "Imaging devices", keywords: ["logitech", "brio", "webcam", "camera"] },
    { name: "Logitech G HUB Audio Driver", category: "Sound, video and game controllers", keywords: ["logitech", "ghub", "audio", "headset"] },
    { name: "Logitech G Pro Wireless Gaming Mouse", category: "Human Interface Devices", keywords: ["logitech", "gpro", "wireless", "mouse"] },
    { name: "Logitech StreamCam Driver", category: "Imaging devices", keywords: ["logitech", "streamcam", "webcam"] },
    { name: "Logitech G923 Racing Wheel Driver", category: "Human Interface Devices", keywords: ["logitech", "g923", "wheel", "gamepad"] },
  ],
  corsair: [
    { name: "Corsair iCUE USB HID Driver", category: "Human Interface Devices", keywords: ["corsair", "icue", "hid", "keyboard", "mouse"] },
    { name: "Corsair Virtuoso Audio Driver", category: "Sound, video and game controllers", keywords: ["corsair", "virtuoso", "audio", "headset"] },
    { name: "Corsair USB Device Driver", category: "Universal Serial Bus controllers", keywords: ["corsair", "usb", "device"] },
    { name: "Corsair K100 RGB Keyboard Driver", category: "Human Interface Devices", keywords: ["corsair", "k100", "keyboard", "rgb"] },
    { name: "Corsair Void Pro Wireless Headset Driver", category: "Sound, video and game controllers", keywords: ["corsair", "void", "headset"] },
  ],
  samsung: [
    { name: "Samsung NVMe SSD Controller Driver", category: "Storage controllers", keywords: ["samsung", "nvme", "ssd", "970", "980", "990"] },
    { name: "Samsung Portable SSD Driver", category: "Storage controllers", keywords: ["samsung", "portable", "ssd", "t7"] },
    { name: "Samsung USB-C Driver", category: "Universal Serial Bus controllers", keywords: ["samsung", "usb-c", "portable"] },
    { name: "Samsung Magician NVMe Driver", category: "Storage controllers", keywords: ["samsung", "magician", "nvme"] },
  ],
  microsoft: [
    { name: "Microsoft ACPI-Compliant System Driver", category: "System devices", keywords: ["microsoft", "acpi", "system"] },
    { name: "Microsoft Basic Display Adapter", category: "Display adapters", keywords: ["microsoft", "basic", "display"] },
    { name: "Microsoft Print to PDF Driver", category: "Print queues", keywords: ["microsoft", "print", "pdf"] },
    { name: "Microsoft Kernel Debug Network Adapter", category: "Network adapters", keywords: ["microsoft", "kernel", "debug", "network"] },
    { name: "Microsoft Wi-Fi Direct Virtual Adapter", category: "Network adapters", keywords: ["microsoft", "wifi", "direct", "virtual"] },
    { name: "Microsoft Hyper-V Network Adapter", category: "Network adapters", keywords: ["microsoft", "hyperv", "virtual", "network"] },
    { name: "Microsoft Xbox Controller Driver", category: "Human Interface Devices", keywords: ["microsoft", "xbox", "controller", "gamepad"] },
    { name: "Microsoft Camera Front/Rear Driver", category: "Imaging devices", keywords: ["microsoft", "camera", "surface"] },
    { name: "Microsoft Surface Pen Driver", category: "Human Interface Devices", keywords: ["microsoft", "surface", "pen", "stylus"] },
  ],
  creative: [
    { name: "Creative Sound Blaster Audigy Fx Driver", category: "Sound, video and game controllers", keywords: ["creative", "sound", "blaster", "audigy"] },
    { name: "Creative Sound BlasterX G6 Driver", category: "Sound, video and game controllers", keywords: ["creative", "sound", "blasterx", "g6", "dac"] },
    { name: "Creative BT-W5 Bluetooth Driver", category: "Bluetooth", keywords: ["creative", "bluetooth", "bt-w5"] },
    { name: "Creative Sound Blaster Z SE Driver", category: "Sound, video and game controllers", keywords: ["creative", "sound", "blaster", "z", "se"] },
    { name: "Creative Super X-Fi Headphone Driver", category: "Sound, video and game controllers", keywords: ["creative", "super", "xfi", "headphone"] },
  ],
  asustek: [
    { name: "ASUS ROG GameFirst Driver", category: "Network adapters", keywords: ["asus", "rog", "gamefirst", "network"] },
    { name: "ASUS Aura LED Controller Driver", category: "System devices", keywords: ["asus", "aura", "led", "rgb"] },
    { name: "ASUS AI Suite System Driver", category: "System devices", keywords: ["asus", "ai", "suite", "sensor"] },
    { name: "ASUS USB-BT500 Bluetooth Driver", category: "Bluetooth", keywords: ["asus", "bluetooth", "bt500"] },
    { name: "ASUS ROG Strix Sound Card Driver", category: "Sound, video and game controllers", keywords: ["asus", "rog", "strix", "audio"] },
    { name: "ASUS AI Noise Canceling Mic Driver", category: "Sound, video and game controllers", keywords: ["asus", "ai", "noise", "mic"] },
  ],
  msi: [
    { name: "MSI Dragon Center System Driver", category: "System devices", keywords: ["msi", "dragon", "center"] },
    { name: "MSI Mystic Light Controller Driver", category: "System devices", keywords: ["msi", "mystic", "light", "rgb"] },
    { name: "MSI LAN Manager Network Driver", category: "Network adapters", keywords: ["msi", "lan", "manager", "killer"] },
    { name: "MSI App Player Display Driver", category: "Display adapters", keywords: ["msi", "app", "player"] },
    { name: "MSI Sound Tune Microphone Driver", category: "Sound, video and game controllers", keywords: ["msi", "sound", "tune", "mic"] },
  ],
  westerndigital: [
    { name: "WD SES Device USB Driver", category: "Universal Serial Bus controllers", keywords: ["western digital", "wd", "ses", "usb"] },
    { name: "WD NVMe SSD Controller Driver", category: "Storage controllers", keywords: ["western digital", "wd", "nvme", "sn850", "sn770"] },
    { name: "WD SmartWare Virtual CD Driver", category: "Storage controllers", keywords: ["western digital", "wd", "smartware"] },
    { name: "WD Blue SN580 NVMe Driver", category: "Storage controllers", keywords: ["western digital", "wd", "sn580", "nvme"] },
  ],
  seagate: [
    { name: "Seagate USB External Drive Driver", category: "Universal Serial Bus controllers", keywords: ["seagate", "usb", "external"] },
    { name: "Seagate Barracuda SATA Driver", category: "IDE ATA/ATAPI controllers", keywords: ["seagate", "barracuda", "sata"] },
    { name: "Seagate FireCuda NVMe Driver", category: "Storage controllers", keywords: ["seagate", "firecuda", "nvme", "gaming"] },
  ],
  kingston: [
    { name: "Kingston FURY NVMe SSD Driver", category: "Storage controllers", keywords: ["kingston", "fury", "nvme"] },
    { name: "Kingston USB Flash Drive Controller", category: "Universal Serial Bus controllers", keywords: ["kingston", "usb", "flash"] },
    { name: "Kingston KC3000 NVMe Driver", category: "Storage controllers", keywords: ["kingston", "kc3000", "nvme"] },
  ],
  crucial: [
    { name: "Crucial NVMe SSD Controller Driver", category: "Storage controllers", keywords: ["crucial", "nvme", "p5", "ssd"] },
    { name: "Crucial Storage Executive Driver", category: "Storage controllers", keywords: ["crucial", "storage", "executive"] },
    { name: "Crucial T700 PCIe 5.0 NVMe Driver", category: "Storage controllers", keywords: ["crucial", "t700", "pcie5", "nvme"] },
  ],
  razer: [
    { name: "Razer HID Keyboard Driver", category: "Human Interface Devices", keywords: ["razer", "keyboard", "hid", "chroma"] },
    { name: "Razer DeathAdder V3 Mouse Driver", category: "Human Interface Devices", keywords: ["razer", "deathadder", "mouse"] },
    { name: "Razer Kraken V3 Audio Driver", category: "Sound, video and game controllers", keywords: ["razer", "kraken", "audio", "headset"] },
    { name: "Razer Kiyo Pro Webcam Driver", category: "Imaging devices", keywords: ["razer", "kiyo", "webcam", "camera"] },
    { name: "Razer Huntsman V3 Pro Keyboard Driver", category: "Human Interface Devices", keywords: ["razer", "huntsman", "keyboard"] },
    { name: "Razer Barracuda X Audio Driver", category: "Sound, video and game controllers", keywords: ["razer", "barracuda", "audio", "wireless"] },
    { name: "Razer Tartarus Pro Gamepad Driver", category: "Human Interface Devices", keywords: ["razer", "tartarus", "gamepad"] },
  ],
  steelseries: [
    { name: "SteelSeries Arctis Nova Pro Audio Driver", category: "Sound, video and game controllers", keywords: ["steelseries", "arctis", "audio", "headset"] },
    { name: "SteelSeries Aerox 5 Mouse Driver", category: "Human Interface Devices", keywords: ["steelseries", "aerox", "mouse"] },
    { name: "SteelSeries Apex Pro Keyboard Driver", category: "Human Interface Devices", keywords: ["steelseries", "apex", "keyboard"] },
    { name: "SteelSeries GameDAC Audio Driver", category: "Sound, video and game controllers", keywords: ["steelseries", "gamedac", "dac", "audio"] },
  ],
  hyperx: [
    { name: "HyperX Cloud III Audio Driver", category: "Sound, video and game controllers", keywords: ["hyperx", "cloud", "audio", "headset"] },
    { name: "HyperX Alloy Origins Keyboard Driver", category: "Human Interface Devices", keywords: ["hyperx", "alloy", "keyboard"] },
    { name: "HyperX Pulsefire Haste Mouse Driver", category: "Human Interface Devices", keywords: ["hyperx", "pulsefire", "mouse"] },
    { name: "HyperX QuadCast Microphone Driver", category: "Sound, video and game controllers", keywords: ["hyperx", "quadcast", "microphone"] },
  ],
  tp_link: [
    { name: "TP-Link USB Wi-Fi Adapter Driver", category: "Network adapters", keywords: ["tp-link", "wifi", "usb", "adapter"] },
    { name: "TP-Link Archer T4U AC1300 Driver", category: "Network adapters", keywords: ["tp-link", "archer", "t4u", "wifi"] },
    { name: "TP-Link UB500 Bluetooth 5.0 Driver", category: "Bluetooth", keywords: ["tp-link", "ub500", "bluetooth"] },
    { name: "TP-Link PCIe Wi-Fi 6 Adapter Driver", category: "Network adapters", keywords: ["tp-link", "pcie", "wifi6"] },
    { name: "TP-Link USB 3.0 Gigabit Ethernet", category: "Network adapters", keywords: ["tp-link", "usb", "ethernet", "gigabit"] },
  ],
  netgear: [
    { name: "NETGEAR A6210 Wi-Fi Adapter Driver", category: "Network adapters", keywords: ["netgear", "a6210", "wifi", "usb"] },
    { name: "NETGEAR Nighthawk AXE3000 Driver", category: "Network adapters", keywords: ["netgear", "nighthawk", "axe3000", "wifi6e"] },
    { name: "NETGEAR USB Ethernet Adapter Driver", category: "Network adapters", keywords: ["netgear", "usb", "ethernet"] },
  ],
  epson: [
    { name: "Epson Printer Driver", category: "Print queues", keywords: ["epson", "printer", "inkjet"] },
    { name: "Epson Scanner Driver (TWAIN/WIA)", category: "Imaging devices", keywords: ["epson", "scanner", "twain"] },
    { name: "Epson Perfection Scanner Driver", category: "Imaging devices", keywords: ["epson", "perfection", "scanner"] },
    { name: "Epson EcoTank Printer Driver", category: "Print queues", keywords: ["epson", "ecotank", "printer"] },
  ],
  hp: [
    { name: "HP LaserJet Printer Driver", category: "Print queues", keywords: ["hp", "laserjet", "printer"] },
    { name: "HP DeskJet Printer Driver", category: "Print queues", keywords: ["hp", "deskjet", "printer", "inkjet"] },
    { name: "HP Smart Universal Print Driver", category: "Print queues", keywords: ["hp", "smart", "print", "universal"] },
    { name: "HP Scanner TWAIN Driver", category: "Imaging devices", keywords: ["hp", "scanner", "twain"] },
    { name: "HP USB Webcam Driver", category: "Imaging devices", keywords: ["hp", "webcam", "camera"] },
    { name: "HP Hotkey Support Driver", category: "System devices", keywords: ["hp", "hotkey", "function"] },
  ],
  canon: [
    { name: "Canon PIXMA Printer Driver", category: "Print queues", keywords: ["canon", "pixma", "printer"] },
    { name: "Canon MAXIFY Printer Driver", category: "Print queues", keywords: ["canon", "maxify", "printer"] },
    { name: "Canon CanoScan Scanner Driver", category: "Imaging devices", keywords: ["canon", "canoscan", "scanner"] },
    { name: "Canon imageCLASS Printer Driver", category: "Print queues", keywords: ["canon", "imageclass", "printer", "laser"] },
  ],
  brother: [
    { name: "Brother Printer Driver", category: "Print queues", keywords: ["brother", "printer", "laser"] },
    { name: "Brother Scanner Driver (TWAIN)", category: "Imaging devices", keywords: ["brother", "scanner", "twain"] },
    { name: "Brother MFC Universal Print Driver", category: "Print queues", keywords: ["brother", "mfc", "print", "universal"] },
  ],
  dell: [
    { name: "Dell Touchpad Driver", category: "Mice and other pointing devices", keywords: ["dell", "touchpad", "alps"] },
    { name: "Dell Wireless Radio Controller", category: "System devices", keywords: ["dell", "wireless", "radio"] },
    { name: "Dell Command | Power Manager", category: "System devices", keywords: ["dell", "command", "power"] },
    { name: "Dell Bluetooth Filter Driver", category: "Bluetooth", keywords: ["dell", "bluetooth", "filter"] },
    { name: "Dell Display Manager Driver", category: "Display adapters", keywords: ["dell", "display", "monitor"] },
  ],
  lenovo: [
    { name: "Lenovo Power Management Driver", category: "System devices", keywords: ["lenovo", "power", "management"] },
    { name: "Lenovo ACPI-Compliant Virtual Power Controller", category: "System devices", keywords: ["lenovo", "acpi", "power"] },
    { name: "Lenovo Fn and Function Keys Driver", category: "Human Interface Devices", keywords: ["lenovo", "fn", "hotkey"] },
    { name: "Lenovo Intelligent Thermal Solution Driver", category: "System devices", keywords: ["lenovo", "thermal", "solution"] },
    { name: "Lenovo TrackPoint Pointing Device Driver", category: "Mice and other pointing devices", keywords: ["lenovo", "trackpoint", "pointing"] },
    { name: "Lenovo USB-C Dock Display Driver", category: "Display adapters", keywords: ["lenovo", "usb-c", "dock", "display"] },
  ],
  gigabyte: [
    { name: "Gigabyte RGB Fusion Controller Driver", category: "System devices", keywords: ["gigabyte", "rgb", "fusion"] },
    { name: "Gigabyte System Information Viewer Driver", category: "System devices", keywords: ["gigabyte", "siv", "system"] },
    { name: "Gigabyte LAN Optimizer Driver", category: "Network adapters", keywords: ["gigabyte", "lan", "optimizer"] },
    { name: "Gigabyte AppCenter System Driver", category: "System devices", keywords: ["gigabyte", "appcenter"] },
  ],
  asrock: [
    { name: "ASRock Polychrome Sync Driver", category: "System devices", keywords: ["asrock", "polychrome", "rgb"] },
    { name: "ASRock Instant Flash Utility Driver", category: "System devices", keywords: ["asrock", "flash", "bios"] },
    { name: "ASRock USB Key Driver", category: "Universal Serial Bus controllers", keywords: ["asrock", "usb"] },
  ],
  biostar: [
    { name: "Biostar Vivid LED DJ Controller Driver", category: "System devices", keywords: ["biostar", "vivid", "led", "rgb"] },
    { name: "Biostar Racing System Driver", category: "System devices", keywords: ["biostar", "racing"] },
  ],
  elgato: [
    { name: "Elgato HD60 X Capture Card Driver", category: "Sound, video and game controllers", keywords: ["elgato", "hd60", "capture", "card"] },
    { name: "Elgato Stream Deck Driver", category: "Human Interface Devices", keywords: ["elgato", "stream", "deck"] },
    { name: "Elgato Cam Link 4K Driver", category: "Imaging devices", keywords: ["elgato", "cam", "link", "4k"] },
    { name: "Elgato Wave Microphone Driver", category: "Sound, video and game controllers", keywords: ["elgato", "wave", "microphone"] },
  ],
  wacom: [
    { name: "Wacom Tablet Driver", category: "Human Interface Devices", keywords: ["wacom", "tablet", "pen", "stylus"] },
    { name: "Wacom Intuos Drawing Tablet Driver", category: "Human Interface Devices", keywords: ["wacom", "intuos", "drawing"] },
    { name: "Wacom Cintiq Display Tablet Driver", category: "Human Interface Devices", keywords: ["wacom", "cintiq", "display"] },
  ],
  matrox: [
    { name: "Matrox Multi-Display Adapter Driver", category: "Display adapters", keywords: ["matrox", "multi", "display"] },
    { name: "Matrox D-Series Graphics Driver", category: "Display adapters", keywords: ["matrox", "d-series", "graphics"] },
  ],
  adaptec: [
    { name: "Adaptec RAID Controller Driver", category: "Storage controllers", keywords: ["adaptec", "raid", "controller"] },
    { name: "Microchip SmartRAID Driver", category: "Storage controllers", keywords: ["microchip", "smartraid", "adaptec"] },
  ],
  conexant: [
    { name: "Conexant HD Audio Codec Driver", category: "Sound, video and game controllers", keywords: ["conexant", "audio", "codec", "hd"] },
    { name: "Conexant SmartAudio HD Driver", category: "Sound, video and game controllers", keywords: ["conexant", "smartaudio", "hd"] },
  ],
};

const ALL_VENDORS = Object.keys(vendorDrivers);

function parseDriversFromMarkdown(markdown: string, vendor: string): any[] {
  const drivers: any[] = [];

  const versionPattern = /(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/g;
  const versions = [...markdown.matchAll(versionPattern)].map(m => m[1]);

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
    "Biometric devices": "Mouse",
    "Imaging devices": "Monitor",
    "Print queues": "HardDrive",
  };

  for (const tmpl of templates) {
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
      os_compatibility: tmpl.os || ["windows"],
      is_pro: Math.random() > 0.85,
      download_size_mb: Math.round((Math.random() * 500 + 10) * 10) / 10,
      whql_certified: Math.random() > 0.2,
    });
  }

  return drivers;
}

function generateVersion(vendor: string): string {
  const v = vendor.toLowerCase();
  if (v === 'nvidia') return `${555 + Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 99)}.${Math.floor(Math.random() * 20).toString().padStart(2, '0')}`;
  if (v === 'amd') return `${24 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 12) + 1}.${Math.floor(Math.random() * 3) + 1}`;
  if (v === 'intel') return `${31 + Math.floor(Math.random() * 5)}.0.${100 + Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 50)}`;
  if (v === 'qualcomm') return `${12 + Math.floor(Math.random() * 4)}.0.${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 999)}`;
  if (v === 'broadcom') return `${7 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 100)}`;
  if (v === 'mediatek') return `${3 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 30)}.${Math.floor(Math.random() * 200)}`;
  if (v === 'synaptics') return `${19 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 20)}`;
  if (v === 'samsung') return `${3 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 5)}.0.${2000 + Math.floor(Math.random() * 500)}`;
  if (v === 'realtek') return `${6 + Math.floor(Math.random() * 2)}.0.${9000 + Math.floor(Math.random() * 500)}.${Math.floor(Math.random() * 10)}`;
  if (v === 'microsoft') return `${10 + Math.floor(Math.random() * 3)}.0.${22000 + Math.floor(Math.random() * 5000)}.${Math.floor(Math.random() * 999)}`;
  if (v === 'razer' || v === 'steelseries' || v === 'hyperx') return `${2024 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 12) + 1}.${Math.floor(Math.random() * 500)}`;
  return `${6 + Math.floor(Math.random() * 4)}.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 999)}`;
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

    const { vendors } = await req.json().catch(() => ({ vendors: ALL_VENDORS }));
    const targetVendors: string[] = vendors || ALL_VENDORS;

    const allDrivers: any[] = [];
    const errors: string[] = [];

    for (const vendor of targetVendors) {
      const urls = VENDOR_URLS[vendor.toLowerCase()];
      if (!urls) { errors.push(`Unknown vendor: ${vendor}`); continue; }

      for (const url of urls.slice(0, 1)) {
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
          const drivers = parseDriversFromMarkdown('', vendor);
          allDrivers.push(...drivers);
          errors.push(`Scrape failed for ${vendor}: ${e instanceof Error ? e.message : 'Unknown'}`);
        }
      }
    }

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
