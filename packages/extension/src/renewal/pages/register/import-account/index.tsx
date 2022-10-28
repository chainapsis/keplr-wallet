import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import { Button } from "../../../components/button";

export const ImportAccountType = "new-mnemonic";

export const ImportAccountButton: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="secondary"
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(ImportAccountType);
        analyticsStore.logEvent("Import account started", {
          registerType: "seed",
        });
      }}
    >
      Import existing account
    </Button>
  );
});
