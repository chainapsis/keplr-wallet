import React, { FunctionComponent } from "react";

import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";

import style from "./style.scss";
import styleAsset from "./asset.scss";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";

export const AccountInfo: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <div className={style.container}>
      <div className={styleAsset.containerAsset}>
        <div className={styleAsset.containerSymbol}>
          <img
            className={styleAsset.symbol}
            src={require("assets/atom-icon.png")}
          />
        </div>
        <div className={styleAsset.amount}>
          1342.243 {chainStore.chainInfo.coinDenom}
        </div>
      </div>
      <AccountView />
      <TxButtonView />
    </div>
  );
});
