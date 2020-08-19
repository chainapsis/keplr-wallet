import React, { FunctionComponent, useEffect } from "react";

import { useLoadingIndicator } from "../../../components/loading-indicator";

export const LedgerInitIndicator: FunctionComponent = ({ children }) => {
  const loadingIndicator = useLoadingIndicator();

  useEffect(() => {
    const startLoading = () => {
      loadingIndicator.setIsLoading("ledger", true);
    };

    const endLoading = () => {
      loadingIndicator.setIsLoading("ledger", false);
    };

    window.addEventListener("ledgerInitFailed", startLoading);
    window.addEventListener("ledgerInitResumed", endLoading);

    return () => {
      window.removeEventListener("ledgerInitFailed", startLoading);
      window.removeEventListener("ledgerInitResumed", endLoading);
    };
  }, [loadingIndicator]);

  return <React.Fragment>{children}</React.Fragment>;
};
