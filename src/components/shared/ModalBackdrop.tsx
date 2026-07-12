import { motion } from "motion/react";

/**
 * The click-to-dismiss backdrop overlay behind a modal panel. Was
 * independently duplicated identically in AddBOQPartModal.tsx and
 * SplitConfigWizard.tsx.
 */
export function ModalBackdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-surface-canvas/80 backdrop-blur-sm"
      onClick={onClick}
    />
  );
}
