import React from "react";

import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";

import style from "./style.scss";
import styleAsset from "./asset.scss";

export class AccountInfo extends React.Component {
  render() {
    return (
      <div className={style.container}>
        <div className={styleAsset.containerAsset}>
          <div className={styleAsset.containerSymbol}>
            <img
              className={styleAsset.symbol}
              src={require("assets/atom-icon.png")}
            />
          </div>
          <div className={styleAsset.amount}>1342.243 ATOM</div>
        </div>
        <AccountView />
        <TxButtonView />
      </div>
    );
  }
}
