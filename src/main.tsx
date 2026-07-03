/// <reference types="vite/client" />
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ToastProvider } from "./components/shared/ToastContext.tsx";
import { clearPersistedStores } from "./lib/resetSeedData.ts";

// When set, forces every load to start from pristine mock seed data instead
// of rehydrating from whatever a previous session left in localStorage.
// Intended for CI/demo runs where "same test, different result depending on
// what's in localStorage" would otherwise be a flake source (see
// docs/architecture/data-ownership.md, Phase 5). Not used by the default
// dev/prod flow, where persisting real session edits across reloads is the
// intended, correct behavior.
if (import.meta.env.VITE_RESET_ON_LOAD === 'true') {
  clearPersistedStores();
}

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
