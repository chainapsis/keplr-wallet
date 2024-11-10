import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export const useInteractionInfo = ({
  onUnmount,
  onWindowClose,
}: {
  onUnmount?: () => void;
  onWindowClose?: () => void;
}) => {
  const [searchParams] = useSearchParams();

  const onUnmountRef = useRef<(() => void) | undefined>(onUnmount);
  onUnmountRef.current = onUnmount;

  const onWindowCloseRef = useRef<(() => void) | undefined>(onWindowClose);
  onWindowCloseRef.current = onWindowClose;

  const result = {
    interaction: searchParams.get("interaction") === "true",
    interactionInternal: searchParams.get("interactionInternal") === "true",
  };

  useEffect(() => {
    // Execute the clean-up function when unmounting.
    return () => {
      if (onUnmountRef.current) {
        onUnmountRef.current();
      }
    };
  }, []);

  useEffect(() => {
    // Execute the clean-up function when closing window.
    const beforeunload = async () => {
      if (onWindowCloseRef.current) {
        onWindowCloseRef.current();
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
