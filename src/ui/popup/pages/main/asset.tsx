import React, { FunctionComponent, useEffect } from "react";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import { Currency } from "../../../../common/currency";
import {
  getCurrency,
  getFiatCurrencyFromLanguage
} from "../../../../common/currency";

import { FormattedMessage } from "react-intl";
import { ToolTip } from "../../../components/tooltip";
import { useLanguage } from "../../language";
import { DecUtils } from "../../../../common/dec-utils";

export const AssetView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, priceStore } = useStore();
  const language = useLanguage();

  const fiatCurrency = getFiatCurrencyFromLanguage(language.language);

  useEffect(() => {
    const coinGeckoId = getCurrency(chainStore.chainInfo.nativeCurrency)
      ?.coinGeckoId;

    if (coinGeckoId != null && !priceStore.hasFiat(fiatCurrency.currency)) {
      priceStore.fetchValue([fiatCurrency.currency], [coinGeckoId]);
    }
  }, [
    chainStore.chainInfo.nativeCurrency,
    fiatCurrency.currency,
    language.language,
    priceStore
  ]);

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
      {/* TODO: Show the information that account is fetching. */}
      <div className={styleAsset.amount}>
        <div>
          {!(accountStore.assets.length === 0)
            ? DecUtils.removeTrailingZerosFromDecStr(
                CoinUtils.shrinkDecimals(
                  coinAmount,
                  nativeCurrency.coinDecimals,
                  0,
                  6
                )
              )
            : "0"}{" "}
          {nativeCurrency.coinDenom}
        </div>
        <div className={styleAsset.indicatorIcon}>
          {accountStore.isAssetFetching ? (
            <i className="fas fa-spinner fa-spin" />
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
              <i className="fas fa-exclamation-triangle text-danger" />
            </ToolTip>
          ) : null}
        </div>
      </div>
    </div>
  );
});
