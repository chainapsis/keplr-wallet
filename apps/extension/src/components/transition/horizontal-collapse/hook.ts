import { useEffect, useState, useRef } from "react";

export const useHorizontalResizeObserver = (
  onResize: (width: number) => void,
  onResizeHeight?: (height: number) => void
) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onResize);
  callbackRef.current = onResize;
  const callbackRefHeight = useRef(onResizeHeight);
  callbackRefHeight.current = onResizeHeight;

  const prevWidth = useRef<number | undefined>();
  const prevHeight = useRef<number | undefined>();

  const [resizeObserver] = useState(() => {
    return new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const entry = entries[0];
        const boxSize = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;

        const width = boxSize.inlineSize;
        const height = boxSize.blockSize;
        if (prevWidth.current == null || prevWidth.current !== width) {
          callbackRef.current(width);
          prevWidth.current = width;
        }
        if (prevHeight.current == null || prevHeight.current !== height) {
          if (callbackRefHeight.current) {
            callbackRefHeight.current(height);
          }
          prevHeight.current = height;
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
