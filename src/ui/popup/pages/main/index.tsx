import React, { FunctionComponent } from "react";

import { HeaderLayout } from "../../layouts/HeaderLayout";

import style from "./style.module.scss";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";

const Test: React.FunctionComponent = () => {
  return (
    <aside className="menu">
      <p className="menu-label">General</p>
      <ul className="menu-list">
        <li>
          <a>Test</a>
        </li>
      </ul>
    </aside>
  );
};

export const MainPage: FunctionComponent = () => {
  return (
    <HeaderLayout showChainName canChangeChainInfo menuRenderer={<Test />}>
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
