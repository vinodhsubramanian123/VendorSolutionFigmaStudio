import { contextBridge, ipcRenderer } from "electron";

// Expose safe IPC APIs to the renderer process (React)
contextBridge.exposeInMainWorld("electronAPI", {
  apiRequest: (args: { url: string; method: string; data?: unknown }) => 
    ipcRenderer.invoke("api-request", args),
  // Additional system bindings can go here
});
