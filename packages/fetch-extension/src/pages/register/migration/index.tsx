import React, { FunctionComponent, useState } from "react";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { Button } from "reactstrap";
import { BackButton } from "../index";
import { MigrateMetamaskPrivateKeyPage } from "./metamask-privatekey";
import { useStore } from "../../../stores";

export const TypeMigrateEth = "migrate-from-eth";

enum MigrationMode {
  SELECT_MODE,
  METAMASK_PRIVATE_KEY,
}

export const MigrateEthereumAddressIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();

  return (
    <Button
      color="primary"
      outline
      block
      onClick={(e) => {
        e.preventDefault();
        analyticsStore.logEvent("migrate_from_eth_click");
        registerConfig.setType(TypeMigrateEth);
      }}
    >
      <FormattedMessage id="register.eth-migrate.title" />
    </Button>
  );
});

const MigrationSelectionPage: FunctionComponent<{
  setMode: (mode: MigrationMode) => void;
  onBack: () => void;
}> = (props) => {
  const { analyticsStore } = useStore();
  return (
    <div>
      <Button
        color="primary"
        outline
        block
        onClick={() => {
          props.setMode(MigrationMode.METAMASK_PRIVATE_KEY);
          analyticsStore.logEvent("migrate_a_metamask_pk_click");
        }}
      >
        <FormattedMessage id="register.eth-migrate.metamask-private-key.title" />
      </Button>
      <BackButton
        onClick={() => {
          analyticsStore.logEvent("back_click", {
            pageName: "Migrate a Metamask Private Key",
          });
          props.onBack();
        }}
      />
    </div>
  );
};

export const MigrateEthereumAddressPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const [mode, setMode] = useState<MigrationMode>(MigrationMode.SELECT_MODE);

  switch (mode) {
    case MigrationMode.SELECT_MODE:
      return (
        <MigrationSelectionPage
          setMode={setMode}
          onBack={() => registerConfig.clear()}
        />
      );
    case MigrationMode.METAMASK_PRIVATE_KEY:
      return (
        <MigrateMetamaskPrivateKeyPage
          registerConfig={registerConfig}
          onBack={() => setMode(MigrationMode.SELECT_MODE)}
        />
      );
  }
});
