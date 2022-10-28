import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import { Button } from "../../../components/button";

export const CreateAccountType = "new-mnemonic";

export const CreateAccountButton: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="primary"
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(CreateAccountType);
        analyticsStore.logEvent("Create account started", {
          registerType: "seed",
        });
      }}
    >
      Create new account
    </Button>
  );
});
