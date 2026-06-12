import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

// Flag enabling local disconnected mock adapter
const VSIP_USE_MOCK = process.env.VSIP_USE_MOCK === "true";

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: "#03050a", // Platform cosmic slate background
    show: false,
  });

  // Prevent flicker by showing only when ready
  win.once("ready-to-show", () => {
    win.show();
  });

  const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, "../dist/index.html")}`;
  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC Mocking Adapter - Replaces MSW
ipcMain.handle("api-request", async (event, args) => {
  const { url, method, data } = args;

  console.log(`[IPC] Received ${method} request for ${url}`);

  if (VSIP_USE_MOCK) {
    console.log(`[IPC] Intercepting request in MOCK mode`);
    // Example mock logic mapping
    if (url.includes("/api/vendor/portal")) {
      return {
        success: true,
        data: { mockResponse: true, status: "mocked" },
        confidence: 0.99
      };
    }
    return {
      success: true,
      message: "Default IPC mock response",
    };
  }

  // If not mocked, theoretically would use node-fetch to forward request here
  // But since the frontend uses standard fetch for real API, this IPC channel 
  // is specifically designed as the mock interceptor proxy layer.
  return { success: false, error: "Real API should bypass IPC." };
});
