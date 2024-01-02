import { useEffect, useRef } from "react";

export const usePrevious = <T extends any>(
  state: T,
  initialValue?: T
): T | undefined => {
  const ref = useRef<T | undefined>(initialValue);

  useEffect(() => {
    ref.current = state;
  }, [state]);

  return ref.current;
};
