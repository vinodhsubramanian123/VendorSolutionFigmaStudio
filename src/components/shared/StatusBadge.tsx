import React from "react";

export type BadgeVariant = "success" | "warning" | "error" | "info" | "default";
export type BadgeSize = "sm" | "md";

export interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "border-status-success/30 bg-status-success/10 text-status-success",
  warning: "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-amber-500",
  error: "border-status-error/30 bg-status-error/10 text-status-error",
  info: "border-brand-indigo/30 bg-brand-indigo/10 text-brand-indigo",
  default: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[8.5px]",
  md: "px-2 py-0.5 text-[9px]",
};

/**
 * Standardized enum status indicator.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = "default",
  size = "md",
  className = "",
  icon,
}) => {
  return (
    <span
      className={`rounded border font-bold uppercase tracking-wide inline-flex items-center justify-center gap-1 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {status}
    </span>
  );
};
