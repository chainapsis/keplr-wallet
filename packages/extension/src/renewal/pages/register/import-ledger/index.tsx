import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import { Button } from "../../../components/button";

export const ImportLedgerType = "new-mnemonic";

export const ImportLedgerButton: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="transparent"
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(ImportLedgerType);
        analyticsStore.logEvent("Import account started", {
          registerType: "ledger",
        });
      }}
    >
      Import ledger
    </Button>
  );
});
