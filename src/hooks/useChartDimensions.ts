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
          window.requestAnimationFrame(() => {
            setDimensions((prev) => {
              if (prev.width === width && prev.height === height) return prev;
              return { width, height };
            });
          });
        }
      }
    });

    observer.observe(ref.current);

    // Initial measure
    const rect = ref.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDimensions((prev) => {
        if (prev.width === rect.width && prev.height === rect.height) return prev;
        return { width: rect.width, height: rect.height };
      });
    }

    return () => observer.disconnect();
  }, []);

  return { ref, dimensions };
}
