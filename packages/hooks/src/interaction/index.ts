import { useLocation } from "react-router";

import queryString from "querystring";

import { disableScroll, fitPopupWindow } from "@keplr-wallet/popup";
import { useEffect, useRef } from "react";

export const useInteractionInfo = (cleanUp?: () => void) => {
  const location = useLocation();
  let search = location.search;
  if (search.startsWith("?")) {
    search = search.slice(1);
  }
  const query = queryString.parse(search);

  const cleanUpRef = useRef<(() => void) | undefined>(cleanUp);
  cleanUpRef.current = cleanUp;

  const result = {
    interaction: query.interaction === "true",
    interactionInternal: query.interactionInternal === "true",
  };

  useEffect(() => {
    if (result.interaction && !result.interactionInternal) {
      disableScroll();
      fitPopupWindow();
    }
  }, [result.interaction, result.interactionInternal]);

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

  return result;
};
