import { useEffect } from "react";

/**
 * Wires up a window-level "Escape closes this" listener, cleaning up on
 * unmount. This exact effect body was independently duplicated across 8
 * modal/overlay components (CatalogAddForm, SnapshotDiffModal, UCIDModals
 * x2, NewUCIDModal, RuleConflictModal, RuleClarificationModal,
 * RefineRuleOverlay) -- differing only in which callback Escape triggers.
 *
 * Pass `null` for onEscape to skip attaching the listener without
 * conditionally calling the hook itself (keeps hook-call order stable),
 * e.g. for a modal that's always mounted but only sometimes open.
 */
export function useEscapeKey(onEscape: (() => void) | null): void {
  useEffect(() => {
    if (!onEscape) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onEscape]);
}
