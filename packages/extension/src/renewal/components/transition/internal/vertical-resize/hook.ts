import { useEffect, useState, useRef } from "react";

export const useVerticalResizeObserver = (
  onResize: (height: number) => void
) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onResize);
  callbackRef.current = onResize;

  const prev = useRef<number | undefined>();

  const [resizeObserver] = useState(() => {
    return new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const entry = entries[0];
        const boxSize = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;

        const height = boxSize.blockSize;
        if (prev.current == null || prev.current !== height) {
          callbackRef.current(height);
          prev.current = height;
        }
      }
    });
  });
  useEffect(() => {
    if (ref.current) {
      const div = ref.current;
      resizeObserver.observe(div, {});

      return () => {
        resizeObserver.unobserve(div);
      };
    }
  }, [resizeObserver]);

  return ref;
};
