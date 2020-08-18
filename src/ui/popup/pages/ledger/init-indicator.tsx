import React, { FunctionComponent, useEffect, useState } from "react";

import { InitLedgerNotifiyHandler } from "../../../../background/ledger/foreground";
import { useLoadingIndicator } from "../../../components/loading-indicator";

export const LedgerInitIndicator: FunctionComponent<{
  initLedgerNotifiyHandler: InitLedgerNotifiyHandler;
}> = ({ children, initLedgerNotifiyHandler }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    initLedgerNotifiyHandler.onInitFailed = () => {
      setIsLoading(true);
    };
  }, [initLedgerNotifiyHandler.onInitFailed]);

  const loadingIndicator = useLoadingIndicator();
  useEffect(() => {
    loadingIndicator.setIsLoading(isLoading || loadingIndicator.isLoading);
  }, [isLoading, loadingIndicator]);

  return <React.Fragment>{children}</React.Fragment>;
};
