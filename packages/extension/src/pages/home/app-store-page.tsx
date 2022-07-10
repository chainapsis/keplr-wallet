import { AppStore } from "@obi-wallet/components";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useNavigate } from "react-router";

import { HeaderLayout } from "../../layouts";
import { useStore } from "../../stores";
import { Menu } from "../main/menu";

export const AppStorePage: FunctionComponent<{
  onBackButton?: () => void;
}> = observer(({ onBackButton }) => {
  const navigate = useNavigate();
  const { appsStore } = useStore();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      menuRenderer={<Menu />}
      onBackButton={
        onBackButton
          ? onBackButton
          : () => {
              navigate(-1);
            }
      }
    >
      <AppStore
        appsStore={appsStore}
        onAfterAppAdded={() => {
          navigate(-1);
        }}
      />
    </HeaderLayout>
  );
});
