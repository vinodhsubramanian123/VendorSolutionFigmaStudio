import { useState, useEffect, useRef } from "react";

export function useChartDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded" warning
          window.requestAnimationFrame(() => {
            setDimensions({ width, height });
          });
        }
      }
    });

    observer.observe(ref.current);

    // Initial measure
    const rect = ref.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDimensions({ width: rect.width, height: rect.height });
    }

    return () => observer.disconnect();
  }, []);

  return { ref, dimensions };
}
