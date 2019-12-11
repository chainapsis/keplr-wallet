import React, { FunctionComponent } from "react";

import { Dec } from "@everett-protocol/cosmosjs/common/decimal";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import { Currency, getCurrency } from "../../../../chain-info";

export const AssetView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, priceStore } = useStore();

  const fiat = priceStore.getValue(
    "usd",
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getCurrency(chainStore.chainInfo.nativeCurrency)!.coinGeckoId
  );

  const nativeCurrency = getCurrency(
    chainStore.chainInfo.nativeCurrency
  ) as Currency;

  const coinAmount = CoinUtils.amountOf(
    accountStore.assets,
    nativeCurrency.coinMinimalDenom
  );

  return (
    <div className={styleAsset.containerAsset}>
      <div className={styleAsset.containerSymbol}>
        <img
          className={styleAsset.symbol}
          src={chainStore.chainInfo.coinIconUrl}
        />
      </div>
      {/* TODO: Show the information that account is fetching. */}
      <div className={styleAsset.amount}>
        {!(accountStore.assets.length === 0)
          ? CoinUtils.shrinkDecimals(
              coinAmount,
              nativeCurrency.coinDecimals,
              0,
              6
            )
          : "0"}{" "}
        {nativeCurrency.coinDenom}
      </div>
      <div className={styleAsset.fiat}>
        {fiat && !fiat.value.equals(new Dec(0))
          ? "$" +
            parseFloat(
              fiat.value
                .mul(new Dec(coinAmount, nativeCurrency.coinDecimals))
                .toString()
            ).toLocaleString()
          : "?"}
      </div>
    </div>
  );
});
