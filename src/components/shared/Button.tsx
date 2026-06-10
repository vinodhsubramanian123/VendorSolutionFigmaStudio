import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-brand-indigo to-indigo-600 hover:from-brand-indigo hover:to-brand-indigo text-white shadow-lg shadow-brand-indigo/20 border border-transparent",
  secondary:
    "bg-surface-elevated hover:bg-surface-card text-white border border-white/10",
  outline:
    "bg-transparent hover:bg-white/5 text-content-primary border border-white/10",
  ghost: "bg-transparent hover:bg-white/5 text-content-primary border-transparent",
  danger:
    "bg-status-error/10 hover:bg-status-error/20 text-status-error border border-status-error/20",
  success:
    "bg-status-success/10 hover:bg-status-success/20 text-status-success border border-status-success/20",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs min-h-[32px]",
  md: "px-4 py-2 text-sm min-h-[44px]",
  lg: "px-6 py-3 text-base min-h-[48px]",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      onClick={props.onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
};
