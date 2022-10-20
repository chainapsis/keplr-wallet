import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import { Button } from "../../../components/button";

export const ImportLedgerType = "new-mnemonic";

export const ImportLedgerIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="transparent"
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(ImportLedgerType);
        analyticsStore.logEvent("Create account started", {
          registerType: "seed",
        });
      }}
    >
      Create new seed{" "}
    </Button>
  );
});
