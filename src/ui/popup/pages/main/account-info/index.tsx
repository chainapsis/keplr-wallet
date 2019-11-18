import React, { FunctionComponent } from "react";

import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";

import style from "./style.module.scss";
import styleAsset from "./asset.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import { CoinUtils } from "../../../../../common/coin-utils";

export const AccountInfo: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();

  const coinAmount = CoinUtils.amountOf(
    accountStore.assets,
    chainStore.chainInfo.coinMinimalDenom
  );

  return (
    <div className={style.container}>
      <div className={styleAsset.containerAsset}>
        <div className={styleAsset.containerSymbol}>
          <img
            className={styleAsset.symbol}
            src={chainStore.chainInfo.coinIconUrl}
          />
        </div>
        <div className={styleAsset.amount}>
          {!accountStore.isAssetFetching
            ? CoinUtils.shrinkDecimals(
                coinAmount,
                chainStore.chainInfo.coinDecimals,
                0,
                6
              )
            : "0"}{" "}
          {chainStore.chainInfo.coinDenom}
        </div>
      </div>
      <AccountView />
      <TxButtonView />
    </div>
  );
});
