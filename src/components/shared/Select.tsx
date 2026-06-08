import React, { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  // You can add custom props here if needed later
}

export const Select: React.FC<SelectProps & { wrapperClassName?: string }> = ({
  className = "",
  wrapperClassName = "w-full",
  children,
  ...props
}) => {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        className={`w-full appearance-none bg-surface-card border border-white/10 rounded-lg px-4 py-2.5 text-content-primary focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/50 transition-all cursor-pointer text-sm font-semibold min-h-[44px] ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-content-muted">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
};
