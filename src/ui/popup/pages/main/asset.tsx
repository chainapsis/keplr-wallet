import React, { FunctionComponent } from "react";

import { Dec } from "@everett-protocol/cosmosjs/common/decimal";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import { Currency } from "../../../../chain-info";
import { getCurrency } from "../../../../common/currency";

import { FormattedMessage } from "react-intl";
import { ToolTip } from "../../../components/tooltip";

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
      <div className={styleAsset.title}>
        <FormattedMessage id="main.account.message.available-balance" />
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
      {/* TODO: Show the information that account is fetching. */}
      <div className={styleAsset.amount}>
        <div>
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
        <div className={styleAsset.indicatorIcon}>
          {accountStore.isAssetFetching ? (
            <span className={"icon"}>
              <i className="fas fa-spinner fa-spin" />
            </span>
          ) : accountStore.lastAssetFetchingError ? (
            <ToolTip
              tooltip={
                accountStore.lastAssetFetchingError.message ??
                accountStore.lastAssetFetchingError.toString()
              }
              theme="dark"
              trigger="hover"
              options={{
                placement: "top"
              }}
            >
              <span className={"icon has-text-danger"}>
                <i className="fas fa-exclamation-triangle" />
              </span>
            </ToolTip>
          ) : null}
        </div>
      </div>
    </div>
  );
});
