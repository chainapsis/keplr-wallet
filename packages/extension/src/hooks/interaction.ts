import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export const useInteractionInfo = (cleanUp?: () => void) => {
  const [searchParams] = useSearchParams();

  const cleanUpRef = useRef<(() => void) | undefined>(cleanUp);
  cleanUpRef.current = cleanUp;

  const result = {
    interaction: searchParams.get("interaction") === "true",
    interactionInternal: searchParams.get("interactionInternal") === "true",
  };

  useEffect(() => {
    return () => {
      if (cleanUpRef.current) {
        cleanUpRef.current();
      }
    };
  }, []);

  useEffect(() => {
    // Execute the clean-up function when closing window.
    const beforeunload = async () => {
      if (cleanUpRef.current) {
        cleanUpRef.current();
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, []);

  return useMemo(() => {
    return {
      interaction: result.interaction,
      interactionInternal: result.interactionInternal,
    };
  }, [result.interaction, result.interactionInternal]);
};
