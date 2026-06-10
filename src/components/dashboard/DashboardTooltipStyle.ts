import { tokens } from "../../styles/tokens";
export const TOOLTIP_STYLE = {
  contentStyle: {
    background: tokens.colors.background.tooltip, 
    border: "1px solid rgba(74, 133, 253,0.2)",
    borderRadius: 8,
    color: tokens.colors.text.primary, 
    fontSize: 12,
  },
  itemStyle: { color: tokens.colors.text.secondary }, 
  labelStyle: { color: tokens.colors.text.primary, fontWeight: 600 }, 
};
