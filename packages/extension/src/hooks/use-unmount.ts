import { useEffect, useRef } from "react";

export const useUnmount = (fn: () => void) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    return () => {
      fnRef.current();
    };
  }, []);
};
