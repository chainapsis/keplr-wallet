import React, { FunctionComponent, useState } from "react";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { BackButton } from "../index";
import { MigrateMetamaskPrivateKeyPage } from "./metamask-privatekey";
import { ButtonV2 } from "@components-v2/buttons/button";
import style from "../style.module.scss";

export const TypeMigrateEth = "migrate-from-eth";

enum MigrationMode {
  SELECT_MODE,
  METAMASK_PRIVATE_KEY,
}

export const MigrateEthereumAddressIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  return (
    <React.Fragment>
      {" "}
      <ButtonV2
        styleProps={{ width: "390px" }}
        onClick={(e: any) => {
          e.preventDefault();

          registerConfig.setType(TypeMigrateEth);
        }}
        text={""}
      >
        <FormattedMessage id="register.eth-migrate.title" />
      </ButtonV2>
    </React.Fragment>
  );
});

const MigrationSelectionPage: FunctionComponent<{
  setMode: (mode: MigrationMode) => void;
  onBack: () => void;
}> = (props) => {
  return (
    <div className={style["migrateContainer"]}>
      <BackButton onClick={props.onBack} />
      <ButtonV2
        text=""
        onClick={() => props.setMode(MigrationMode.METAMASK_PRIVATE_KEY)}
      >
        <FormattedMessage id="register.eth-migrate.metamask-private-key.title" />
      </ButtonV2>
    </div>
  );
};

export const MigrateEthereumAddressPage: FunctionComponent<{
  registerConfig: RegisterConfig;
  setSelectedCard: any;
}> = observer(({ registerConfig, setSelectedCard }) => {
  const [mode, setMode] = useState<MigrationMode>(MigrationMode.SELECT_MODE);

  switch (mode) {
    case MigrationMode.SELECT_MODE:
      return (
        <MigrationSelectionPage
          setMode={setMode}
          onBack={() => setSelectedCard("main")}
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
