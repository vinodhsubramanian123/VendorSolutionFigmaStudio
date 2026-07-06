import { MatchStatus } from "./types";

export const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  matched:     { label: "Exact Match",   color: "text-status-success", bg: "bg-status-success/8",  border: "border-status-success/20", dot: "bg-status-success" },
  fuzzy:       { label: "Fuzzy Match",   color: "text-status-warning",   bg: "bg-status-warning/8",    border: "border-status-warning/20",   dot: "bg-status-warning" },
  unmatched:   { label: "Unmatched",     color: "text-status-warning",  bg: "bg-status-warning/8",   border: "border-status-warning/20",  dot: "bg-status-warning" },
  quarantined: { label: "Quarantined",   color: "text-status-error",     bg: "bg-status-error/8",      border: "border-status-error/20",     dot: "bg-status-error animate-pulse" },
  mapped:      { label: "Mapped",        color: "text-brand-indigo",  bg: "bg-brand-indigo/8",   border: "border-brand-indigo/20",  dot: "bg-brand-indigo" },
};
