import React, { FunctionComponent } from "react";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";

export const AssetView: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();

  const coinAmount = CoinUtils.amountOf(
    accountStore.assets,
    chainStore.chainInfo.coinMinimalDenom
  );

  return (
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
  );
});
