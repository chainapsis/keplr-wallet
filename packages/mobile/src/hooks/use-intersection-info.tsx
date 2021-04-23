import { useEffect, useRef } from "react";

export const useInteractionInfo = (cleanUp?: () => void) => {
  const cleanUpRef = useRef<(() => void) | undefined>(cleanUp);
  cleanUpRef.current = cleanUp;

  const result = {
    interaction: "true",
    interactionInternal: "true",
  };

  useEffect(() => {
    return () => {
      if (cleanUpRef.current) {
        cleanUpRef.current();
      }
    };
  }, []);

  return result;
};
