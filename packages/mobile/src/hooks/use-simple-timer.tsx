import { useState, useEffect } from "react";

export const useSimpleTimer = () => {
  const [timeoutId, setTimeoutId] = useState(0);

  const isTimedOut = !!timeoutId;

  useEffect(() => {
    if (!!timeoutId) {
      return () => clearTimeout(timeoutId);
    }
  }, [timeoutId]);

  const setTimer = (timeout: number) => {
    const timeoutId = setTimeout(() => setTimeoutId(0), timeout);
    setTimeoutId(timeoutId);
  };

  return {
    isTimedOut,
    setTimer,
  };
};
