import { Home } from "@obi-wallet/components";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useNavigate } from "react-router";

import { HeaderLayout } from "../../layouts";
import { Menu } from "../main/menu";
import { useStore } from "../../stores";

export const HomePage: FunctionComponent<{
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
      <Home
        appsStore={appsStore}
        onAppPress={(app) => {
          window.open(app.url);
        }}
        onAppStorePress={() => {
          navigate({
            pathname: "/home/app-store",
          });
        }}
      />
    </HeaderLayout>
  );
});
