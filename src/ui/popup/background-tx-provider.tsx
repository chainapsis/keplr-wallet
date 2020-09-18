import React, { FunctionComponent, useCallback, useEffect } from "react";
import { useStore } from "./stores";

export const BackgroundTxProvider: FunctionComponent = ({ children }) => {
  const { chainStore, accountStore } = useStore();

  const updateAssets = useCallback(
    (e: CustomEvent<{ chainId: string }>) => {
      if (
        e.detail?.chainId &&
        chainStore.chainInfo.chainId === e.detail.chainId
      ) {
        accountStore.fetchAccount();
      }
    },
    [accountStore, chainStore.chainInfo.chainId]
  );

  // Update the account store if tx is committed.
  useEffect(() => {
    window.addEventListener("backgroundTxCommitted", updateAssets as any);

    return () => {
      window.removeEventListener("backgroundTxCommitted", updateAssets as any);
    };
  }, [updateAssets]);

  return <React.Fragment>{children}</React.Fragment>;
};
