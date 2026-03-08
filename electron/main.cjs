const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { setupWindowControls } = require("./windowControls.cjs");
const { getSystemInfo } = require("./systemInfo.js");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 640,
    minWidth: 800,
    minHeight: 580,
    frame: false,
    titleBarStyle: "hidden",
    resizable: true,
    icon: path.join(__dirname, "../public/favicon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: "#0f1117",
  });

  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    mainWindow.loadURL("http://localhost:8080");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupWindowControls();

  // IPC handler for full system info (CPU, GPU, RAM, disks, motherboard, audio, network, USB)
  ipcMain.handle("get-system-info", async () => {
    console.log("[Electron] get-system-info IPC called");
    try {
      const info = getSystemInfo();
      console.log("[Electron] System info collected — CPU:", info?.cpu?.name || "unknown");
      return info;
    } catch (e) {
      console.error("[Electron] Failed to get system info:", e.message, e.stack);
      return null;
    }
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
