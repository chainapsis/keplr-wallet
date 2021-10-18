import { useEffect, useRef } from "react";

export const useUnmount = (cleanUpFn: () => void) => {
  const ref = useRef(cleanUpFn);
  ref.current = cleanUpFn;

  useEffect(() => {
    return () => {
      ref.current();
    };
  }, []);
};
