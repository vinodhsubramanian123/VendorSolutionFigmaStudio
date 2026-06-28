/// <reference types="vite/client" />
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ToastProvider } from "./components/shared/ToastContext.tsx";

// Gently suppress benign sandbox development environment websocket/Vite connection alerts
if (typeof window !== "undefined") {
  const isWebsocketOrViteError = (msg: string | null | undefined) => {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    return lower.includes("websocket") || lower.includes("vite");
  };

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (reason) {
      const msg = reason.message || (typeof reason === "string" ? reason : "");
      if (isWebsocketOrViteError(msg)) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }
  });

  window.addEventListener("error", (event) => {
    const msg = event.message || "";
    if (isWebsocketOrViteError(msg)) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
}

async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }
  const { mockServer } = await import('./mocks/browser');
  return mockServer.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </StrictMode>,
  );
});
