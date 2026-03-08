export {};

export interface ElectronGPU {
  name: string;
  vendor: string;
  vramMB: number;
  driverVersion: string;
}

export interface ElectronRAMModule {
  capacityGB: number;
  manufacturer: string;
  partNumber: string;
  speedMHz: number | null;
}

export interface ElectronDisk {
  model: string;
  sizeGB: number;
  interface: string;
  mediaType: string;
}

export interface ElectronNetworkAdapter {
  name: string;
  ip?: string;
  mac?: string;
  manufacturer?: string;
}

export interface ElectronAudioDevice {
  manufacturer: string;
  name: string;
}

export interface ElectronSystemInfo {
  os: {
    name: string;
    version: string;
    architecture: string;
    platform: string;
    hostname: string;
    uptime: number;
  };
  cpu: {
    name: string;
    cores: number;
    physicalCores: number;
    speed: number;
    architecture: string;
  };
  gpu: ElectronGPU[];
  ram: {
    totalGB: number;
    freeGB: number;
    usedGB: number;
    modules: ElectronRAMModule[];
  };
  motherboard: {
    manufacturer: string;
    product: string;
    serialNumber: string;
  };
  disks: ElectronDisk[];
  network: {
    adapters: ElectronNetworkAdapter[];
    detailedAdapters: ElectronNetworkAdapter[];
  };
  audio: ElectronAudioDevice[];
  usb: { count: number };
}

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isElectron: boolean;
      getSystemInfo: () => Promise<ElectronSystemInfo | null>;
    };
  }
}
