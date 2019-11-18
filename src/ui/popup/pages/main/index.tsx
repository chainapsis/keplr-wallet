import React, { FunctionComponent } from "react";

import { HeaderLayout } from "../../layouts/HeaderLayout";

import style from "./style.module.scss";
import { Menu } from "./menu";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";

export const MainPage: FunctionComponent = () => {
  return (
    <HeaderLayout showChainName canChangeChainInfo menuRenderer={<Menu />}>
      <div className={style.containerAccount}>
        <div className={style.containerAccountInner}>
          <AssetView />
          <AccountView />
          <TxButtonView />
        </div>
      </div>
      <div className={style.containerTxs} />
    </HeaderLayout>
  );
};
