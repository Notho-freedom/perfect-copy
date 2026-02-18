export interface Driver {
  id: string;
  name: string;
  category: string;
  currentVersion: string;
  currentDate: string;
  newVersion: string;
  newDate: string;
  isPro: boolean;
  icon: string;
}

export const outdatedDrivers: Driver[] = [
  { id: "1", name: "Intel(R) HD Graphics 630", category: "Display adapters", currentVersion: "27.20.100.8681", currentDate: "2021-06-15", newVersion: "31.0.101.4952", newDate: "2024-03-20", isPro: false, icon: "Monitor" },
  { id: "2", name: "Realtek High Definition Audio", category: "Sound, video and game controllers", currentVersion: "6.0.9235.1", currentDate: "2022-01-10", newVersion: "6.0.9539.1", newDate: "2024-02-28", isPro: false, icon: "Volume2" },
  { id: "3", name: "NVIDIA GeForce RTX 3060", category: "Display adapters", currentVersion: "536.40", currentDate: "2023-06-27", newVersion: "551.86", newDate: "2024-03-15", isPro: true, icon: "Monitor" },
  { id: "4", name: "Intel(R) Wi-Fi 6 AX201 160MHz", category: "Network adapters", currentVersion: "22.200.0.4", currentDate: "2023-03-15", newVersion: "23.40.0.6", newDate: "2024-03-10", isPro: false, icon: "Wifi" },
  { id: "5", name: "Realtek PCIe GBE Family Controller", category: "Network adapters", currentVersion: "10.52.828.2021", currentDate: "2021-11-20", newVersion: "10.70.227.2024", newDate: "2024-02-18", isPro: true, icon: "Network" },
  { id: "6", name: "Intel(R) USB 3.1 eXtensible Host Controller", category: "Universal Serial Bus controllers", currentVersion: "5.0.4.43", currentDate: "2020-08-10", newVersion: "5.0.5.52", newDate: "2024-01-25", isPro: false, icon: "Usb" },
  { id: "7", name: "Samsung NVMe SSD Controller", category: "Storage controllers", currentVersion: "3.3.0.2003", currentDate: "2022-05-12", newVersion: "3.4.0.2311", newDate: "2024-03-05", isPro: true, icon: "HardDrive" },
  { id: "8", name: "Synaptics SMBus TouchPad", category: "Mice and other pointing devices", currentVersion: "19.5.35.75", currentDate: "2023-01-18", newVersion: "19.5.40.12", newDate: "2024-02-22", isPro: false, icon: "Mouse" },
];

export const upToDateDrivers = [
  "Intel(R) Management Engine Interface",
  "Microsoft ACPI-Compliant System",
  "HID-compliant mouse",
  "High Definition Audio Controller",
  "PCI Express Root Port",
  "Intel(R) Serial IO GPIO Controller",
  "Microsoft Basic Display Adapter",
  "Disk drive",
  "Generic USB Hub",
  "Standard SATA AHCI Controller",
  "Microsoft Kernel Debug Network Adapter",
  "Intel(R) Thermal Subsystem",
];

export const scanDriverNames = [
  "Scanning PCI bus...",
  "Checking Intel(R) HD Graphics...",
  "Checking Realtek Audio Driver...",
  "Scanning USB controllers...",
  "Checking Network adapters...",
  "Scanning NVIDIA Display Driver...",
  "Checking Storage controllers...",
  "Scanning Bluetooth devices...",
  "Checking System devices...",
  "Verifying driver signatures...",
  "Comparing driver versions...",
  "Finalizing scan results...",
];
