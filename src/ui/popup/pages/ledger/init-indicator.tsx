import React, { FunctionComponent, useEffect } from "react";

import { InitLedgerNotifiyHandler } from "../../../../background/ledger/foreground";
import { useLoadingIndicator } from "../../../components/loading-indicator";

export const LedgerInitIndicator: FunctionComponent<{
  initLedgerNotifiyHandler: InitLedgerNotifiyHandler;
}> = ({ children, initLedgerNotifiyHandler }) => {
  const loadingIndicator = useLoadingIndicator();

  useEffect(() => {
    initLedgerNotifiyHandler.onInitFailed = () => {
      loadingIndicator.setIsLoading("ledger", true);
    };
    initLedgerNotifiyHandler.onInitResumed = () => {
      loadingIndicator.setIsLoading("ledger", false);
    };
  }, [
    initLedgerNotifiyHandler.onInitFailed,
    initLedgerNotifiyHandler.onInitResumed
  ]);

  return <React.Fragment>{children}</React.Fragment>;
};
