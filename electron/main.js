const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { setupWindowControls } = require("./windowControls");
const { getSystemInfo } = require("./systemInfo");

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
      preload: path.join(__dirname, "preload.js"),
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

  // IPC handler for system info
  ipcMain.handle("get-system-info", async () => {
    console.log("[Electron] get-system-info IPC called");
    try {
      const info = getSystemInfo();
      console.log("[Electron] System info collected:", info?.cpu?.name || "unknown CPU");
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
