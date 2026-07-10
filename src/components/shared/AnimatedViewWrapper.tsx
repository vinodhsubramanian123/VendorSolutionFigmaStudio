import React, { ReactNode } from "react";
import { motion } from "motion/react";
import { ErrorBoundary } from "./ErrorBoundary";

interface AnimatedViewWrapperProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedViewWrapper({ children, className = "flex flex-col gap-4" }: AnimatedViewWrapperProps) {
  return (
    <ErrorBoundary>
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
      >
        {children}
      </motion.div>
    </ErrorBoundary>
  );
}
