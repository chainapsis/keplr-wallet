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
    // Execute the clean-up function when closing window.
    const beforeunload = async () => {
      console.log("beforeunload");
      if (cleanUpRef.current) {
        cleanUpRef.current();
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, []);

  useEffect(() => {
    // TODO: 현재 페이지에서 뒤로가기를 했을 때 이를 감지하고 cleanUp 함수를 실행하는 로직이 필요함.
  }, []);

  return useMemo(() => {
    return {
      interaction: result.interaction,
      interactionInternal: result.interactionInternal,
    };
  }, [result.interaction, result.interactionInternal]);
};
