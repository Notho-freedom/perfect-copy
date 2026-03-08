const os = require("os");
const { execSync } = require("child_process");

function getSystemInfo() {
  const info = {
    os: getOSInfo(),
    cpu: getCPUInfo(),
    gpu: getGPUInfo(),
    ram: getRAMInfo(),
    motherboard: getMotherboardInfo(),
    disks: getDiskInfo(),
    network: getNetworkInfo(),
    audio: getAudioInfo(),
    usb: getUSBInfo(),
  };
  return info;
}

function getOSInfo() {
  const platform = os.platform();
  const release = os.release();
  const arch = os.arch();
  let name = "Unknown OS";
  let version = release;

  if (platform === "win32") {
    name = "Microsoft Windows";
    try {
      const caption = execSync('wmic os get Caption /value', { encoding: 'utf8', timeout: 5000 });
      const match = caption.match(/Caption=(.+)/);
      if (match) name = match[1].trim();
    } catch {}
    try {
      const ver = execSync('wmic os get Version /value', { encoding: 'utf8', timeout: 5000 });
      const match = ver.match(/Version=(.+)/);
      if (match) version = match[1].trim();
    } catch {}
  } else if (platform === "darwin") {
    name = "macOS";
    try {
      version = execSync('sw_vers -productVersion', { encoding: 'utf8', timeout: 5000 }).trim();
    } catch {}
  } else if (platform === "linux") {
    name = "Linux";
    try {
      const release = execSync('cat /etc/os-release', { encoding: 'utf8', timeout: 5000 });
      const nameMatch = release.match(/PRETTY_NAME="(.+)"/);
      if (nameMatch) name = nameMatch[1];
    } catch {}
  }

  return {
    name,
    version,
    architecture: arch === "x64" ? "x64" : arch === "arm64" ? "ARM64" : arch,
    platform: `${platform} ${release}`,
    hostname: os.hostname(),
    uptime: os.uptime(),
  };
}

function getCPUInfo() {
  const cpus = os.cpus();
  const model = cpus.length > 0 ? cpus[0].model : "Unknown CPU";
  const speed = cpus.length > 0 ? cpus[0].speed : 0;
  const cores = cpus.length;
  const physicalCores = getPhysicalCores();

  return {
    name: model.trim(),
    cores,
    physicalCores,
    speed, // MHz
    architecture: os.arch(),
  };
}

function getPhysicalCores() {
  try {
    if (os.platform() === "win32") {
      const out = execSync('wmic cpu get NumberOfCores /value', { encoding: 'utf8', timeout: 5000 });
      const match = out.match(/NumberOfCores=(\d+)/);
      return match ? parseInt(match[1]) : os.cpus().length;
    } else if (os.platform() === "darwin") {
      return parseInt(execSync('sysctl -n hw.physicalcpu', { encoding: 'utf8', timeout: 5000 }).trim());
    } else {
      return parseInt(execSync('grep "^core id" /proc/cpuinfo | sort -u | wc -l', { encoding: 'utf8', timeout: 5000 }).trim()) || os.cpus().length;
    }
  } catch {
    return os.cpus().length;
  }
}

function getGPUInfo() {
  const gpus = [];
  try {
    if (os.platform() === "win32") {
      const out = execSync('wmic path win32_VideoController get Name,AdapterRAM,DriverVersion,VideoProcessor /format:csv', { encoding: 'utf8', timeout: 8000 });
      const lines = out.trim().split('\n').filter(l => l.trim() && !l.startsWith('Node'));
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 4) {
          const adapterRAM = parseInt(parts[1]) || 0;
          const driverVersion = parts[2]?.trim() || "Unknown";
          const name = parts[3]?.trim() || "Unknown GPU";
          gpus.push({
            name,
            vendor: name.toLowerCase().includes('nvidia') ? 'NVIDIA' : name.toLowerCase().includes('amd') || name.toLowerCase().includes('radeon') ? 'AMD' : name.toLowerCase().includes('intel') ? 'Intel' : 'Unknown',
            vramMB: Math.round(adapterRAM / 1048576),
            driverVersion,
          });
        }
      }
    } else if (os.platform() === "darwin") {
      const out = execSync('system_profiler SPDisplaysDataType', { encoding: 'utf8', timeout: 8000 });
      const nameMatch = out.match(/Chipset Model:\s*(.+)/);
      const vramMatch = out.match(/VRAM.*?:\s*(\d+)/);
      gpus.push({
        name: nameMatch ? nameMatch[1].trim() : "Apple GPU",
        vendor: "Apple",
        vramMB: vramMatch ? parseInt(vramMatch[1]) : 0,
        driverVersion: "Built-in",
      });
    } else {
      const out = execSync('lspci | grep -i vga', { encoding: 'utf8', timeout: 5000 });
      const match = out.match(/:\s*(.+)/);
      gpus.push({
        name: match ? match[1].trim() : "Unknown GPU",
        vendor: "Unknown",
        vramMB: 0,
        driverVersion: "Unknown",
      });
    }
  } catch (e) {
    gpus.push({ name: "Detection failed", vendor: "Unknown", vramMB: 0, driverVersion: "N/A" });
  }
  return gpus;
}

function getRAMInfo() {
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  let modules = [];
  try {
    if (os.platform() === "win32") {
      const out = execSync('wmic memorychip get Capacity,Speed,Manufacturer,PartNumber /format:csv', { encoding: 'utf8', timeout: 8000 });
      const lines = out.trim().split('\n').filter(l => l.trim() && !l.startsWith('Node'));
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 4) {
          modules.push({
            capacityGB: Math.round(parseInt(parts[1] || '0') / 1073741824),
            manufacturer: (parts[2] || '').trim(),
            partNumber: (parts[3] || '').trim(),
            speedMHz: parseInt(parts[4] || '0') || null,
          });
        }
      }
    }
  } catch {}
  return {
    totalGB: Math.round(totalBytes / 1073741824 * 10) / 10,
    freeGB: Math.round(freeBytes / 1073741824 * 10) / 10,
    usedGB: Math.round((totalBytes - freeBytes) / 1073741824 * 10) / 10,
    modules,
  };
}

function getMotherboardInfo() {
  try {
    if (os.platform() === "win32") {
      const mfr = execSync('wmic baseboard get Manufacturer /value', { encoding: 'utf8', timeout: 5000 });
      const prod = execSync('wmic baseboard get Product /value', { encoding: 'utf8', timeout: 5000 });
      const serial = execSync('wmic baseboard get SerialNumber /value', { encoding: 'utf8', timeout: 5000 });
      return {
        manufacturer: (mfr.match(/Manufacturer=(.+)/) || [])[1]?.trim() || "Unknown",
        product: (prod.match(/Product=(.+)/) || [])[1]?.trim() || "Unknown",
        serialNumber: (serial.match(/SerialNumber=(.+)/) || [])[1]?.trim() || "N/A",
      };
    }
  } catch {}
  return { manufacturer: "Unknown", product: "Unknown", serialNumber: "N/A" };
}

function getDiskInfo() {
  const disks = [];
  try {
    if (os.platform() === "win32") {
      const out = execSync('wmic diskdrive get Model,Size,InterfaceType,MediaType /format:csv', { encoding: 'utf8', timeout: 8000 });
      const lines = out.trim().split('\n').filter(l => l.trim() && !l.startsWith('Node'));
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 4) {
          disks.push({
            model: (parts[2] || '').trim(),
            sizeGB: Math.round(parseInt(parts[4] || '0') / 1073741824),
            interface: (parts[1] || '').trim(),
            mediaType: (parts[3] || '').trim(),
          });
        }
      }
    }
  } catch {}
  return disks;
}

function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const adapters = [];
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    const ipv4 = addrs.find(a => a.family === 'IPv4' && !a.internal);
    if (ipv4) {
      adapters.push({
        name,
        ip: ipv4.address,
        mac: ipv4.mac,
      });
    }
  }

  // Get detailed adapter info on Windows
  let detailedAdapters = [];
  try {
    if (os.platform() === "win32") {
      const out = execSync('wmic nic where "NetEnabled=true" get Name,MACAddress,Manufacturer /format:csv', { encoding: 'utf8', timeout: 8000 });
      const lines = out.trim().split('\n').filter(l => l.trim() && !l.startsWith('Node'));
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 3) {
          detailedAdapters.push({
            mac: (parts[1] || '').trim(),
            manufacturer: (parts[2] || '').trim(),
            name: (parts[3] || '').trim(),
          });
        }
      }
    }
  } catch {}

  return { adapters, detailedAdapters };
}

function getAudioInfo() {
  const devices = [];
  try {
    if (os.platform() === "win32") {
      const out = execSync('wmic sounddev get Name,Manufacturer /format:csv', { encoding: 'utf8', timeout: 5000 });
      const lines = out.trim().split('\n').filter(l => l.trim() && !l.startsWith('Node'));
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 2) {
          devices.push({
            manufacturer: (parts[1] || '').trim(),
            name: (parts[2] || '').trim(),
          });
        }
      }
    }
  } catch {}
  return devices;
}

function getUSBInfo() {
  const devices = [];
  try {
    if (os.platform() === "win32") {
      const out = execSync('wmic path Win32_USBControllerDevice get Dependent /format:csv', { encoding: 'utf8', timeout: 5000 });
      // Count USB devices
      const lines = out.trim().split('\n').filter(l => l.trim() && !l.startsWith('Node'));
      return { count: lines.length };
    }
  } catch {}
  return { count: 0 };
}

module.exports = { getSystemInfo };
