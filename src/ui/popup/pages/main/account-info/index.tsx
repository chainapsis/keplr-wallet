import React, { FunctionComponent } from "react";

import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";

import style from "./style.module.scss";
import styleAsset from "./asset.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { CoinUtils } from "../../../../../common/coin-utils";

function decimalStrAmount(amount: Int, decimals: number): string {
  const decimalPoint = new Int(
    "1" +
      Array.from(new Array(decimals))
        .map(() => "0")
        .join("")
  );
  const integerPart = amount.div(decimalPoint);
  const fractionalPart = amount.mod(decimalPoint);

  const fractionalStr =
    Array.from(new Array(decimals - fractionalPart.toString().length))
      .map(() => "0")
      .join("") + fractionalPart.toString();
  return integerPart.toString() + "." + fractionalStr;
}

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
            ? decimalStrAmount(coinAmount, chainStore.chainInfo.coinDecimals)
            : "0"}{" "}
          {chainStore.chainInfo.coinDenom}
        </div>
      </div>
      <AccountView />
      <TxButtonView />
    </div>
  );
});
