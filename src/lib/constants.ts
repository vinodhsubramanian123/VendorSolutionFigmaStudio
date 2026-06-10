import { tokens } from "../styles/tokens";

export const PRIORITY_COLOR: Record<string, string> = {
  critical: tokens.colors.status.error, 
  high: tokens.colors.status.warning, 
  medium: tokens.colors.accent.indigo, 
  low: tokens.colors.text.muted, 
};
