import React, { FunctionComponent, useEffect } from "react";

import { Dec } from "@chainapsis/cosmosjs/common/decimal";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import { getFiatCurrencyFromLanguage } from "../../../../common/currency";

import { FormattedMessage } from "react-intl";
import { ToolTip } from "../../../components/tooltip";
import { useLanguage } from "../../language";
import { DecUtils } from "../../../../common/dec-utils";

export const AssetView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, priceStore } = useStore();
  const language = useLanguage();

  const fiatCurrency = getFiatCurrencyFromLanguage(language.language);

  useEffect(() => {
    const coinGeckoId = chainStore.chainInfo.stakeCurrency.coinGeckoId;

    if (coinGeckoId != null && !priceStore.hasFiat(fiatCurrency.currency)) {
      priceStore.fetchValue([fiatCurrency.currency], [coinGeckoId]);
    }
  }, [
    chainStore.chainInfo.stakeCurrency.coinGeckoId,
    fiatCurrency.currency,
    language.language,
    priceStore
  ]);

  const fiat = priceStore.getValue(
    fiatCurrency.currency,
    chainStore.chainInfo.stakeCurrency.coinGeckoId
  );

  const stakeCurrency = chainStore.chainInfo.stakeCurrency;

  const coinAmount = CoinUtils.amountOf(
    accountStore.assets,
    stakeCurrency.coinMinimalDenom
  );

  const hasCoinGeckoId = stakeCurrency.coinGeckoId != null;

  return (
    <div className={styleAsset.containerAsset}>
      <div className={styleAsset.title}>
        <FormattedMessage id="main.account.message.available-balance" />
      </div>
      <div className={styleAsset.fiat}>
        {fiat && !fiat.value.equals(new Dec(0))
          ? fiatCurrency.symbol +
            DecUtils.trim(
              fiatCurrency.parse(
                parseFloat(
                  fiat.value
                    .mul(new Dec(coinAmount, stakeCurrency.coinDecimals))
                    .toString()
                )
              )
            )
          : hasCoinGeckoId
          ? "?"
          : "-"}
      </div>
      {/* TODO: Show the information that account is fetching. */}
      <div className={styleAsset.amount}>
        <div>
          {!(accountStore.assets.length === 0)
            ? CoinUtils.shrinkDecimals(
                coinAmount,
                stakeCurrency.coinDecimals,
                0,
                6
              )
            : "0"}{" "}
          {stakeCurrency.coinDenom}
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
