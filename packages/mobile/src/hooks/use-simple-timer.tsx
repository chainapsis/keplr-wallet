import { useState, useEffect, useCallback } from "react";

export const useSimpleTimer = () => {
  const [timeoutId, setTimeoutId] = useState<
    ReturnType<typeof setTimeout> | undefined
  >();

  const isTimedOut = !!timeoutId;

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const setTimer = useCallback((timeout: number) => {
    const timeoutId = setTimeout(() => setTimeoutId(undefined), timeout);
    setTimeoutId(timeoutId);
  }, []);

  return {
    isTimedOut,
    setTimer,
  };
};
