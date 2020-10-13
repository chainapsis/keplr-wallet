import React, { FunctionComponent, useEffect } from "react";

import { Dec } from "@chainapsis/cosmosjs/common/decimal";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { CoinUtils } from "../../../../common/coin-utils";
import {
  Currency,
  FiatCurrency,
  getFiatCurrencyFromLanguage
} from "../../../../common/currency";

import { useLanguage } from "../../language";
import { DecUtils } from "../../../../common/dec-utils";

const LazyDoughnut = React.lazy(() =>
  import("react-chartjs-2").then(module => ({ default: module.Doughnut }))
);
import { Int } from "@chainapsis/cosmosjs/common/int";
import { Price } from "../../stores/price";

export const AssetStakedChartView: FunctionComponent<{
  fiat: Price | undefined;
  fiatCurrency: FiatCurrency;
  stakeCurrency: Currency;
  available: Int;
  staked: Int;
}> = ({ fiat, fiatCurrency, stakeCurrency, available, staked }) => {
  const hasCoinGeckoId = stakeCurrency.coinGeckoId != null;

  const availableDec = new Dec(available, stakeCurrency.coinDecimals);
  const stakedDec = new Dec(staked, stakeCurrency.coinDecimals);
  const totalDec = availableDec.add(stakedDec);

  // If fiat value is fetched, show the value that is multiplied with amount and fiat value.
  // If not, just show the amount of asset.
  const data: number[] = [
    fiat && !fiat.value.equals(new Dec(0))
      ? parseFloat(availableDec.mul(fiat.value).toString())
      : parseFloat(availableDec.toString()),
    fiat && !fiat.value.equals(new Dec(0))
      ? parseFloat(stakedDec.mul(fiat.value).toString())
      : parseFloat(stakedDec.toString())
  ];

  return (
    <React.Fragment>
      <div style={{ position: "relative" }}>
        <React.Suspense fallback={<div />}>
          <LazyDoughnut
            data={{
              datasets: [
                {
                  data,
                  backgroundColor: ["#5e72e4", "#11cdef"]
                }
              ],

              labels: ["Available", "Staked"]
            }}
            options={{
              rotation: 0.5 * Math.PI,
              cutoutPercentage: 85,
              legend: {
                display: false
              }
            }}
          />
        </React.Suspense>
        <div
          style={{
            position: "absolute",
            textAlign: "center",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#32325d"
            }}
          >
            Total Balance
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#32325d",
              fontWeight: "bold"
            }}
          >
            {fiat && !fiat.value.equals(new Dec(0))
              ? fiatCurrency.symbol +
                DecUtils.trim(
                  fiatCurrency.parse(
                    parseFloat(fiat.value.mul(totalDec).toString())
                  )
                )
              : hasCoinGeckoId
              ? "?"
              : `${CoinUtils.shrinkDecimals(
                  available.add(staked),
                  stakeCurrency.coinDecimals,
                  0,
                  3
                )} ${stakeCurrency.coinDenom.toUpperCase()}`}
          </div>
        </div>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <div style={{ color: "#5e72e4", letterSpacing: "-0.3px" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-primary" />
            </span>
            Available
          </div>
          <div style={{ minWidth: "12px" }} />
          <div
            style={{
              color: "#525f7f",
              letterSpacing: "-0.3px",
              fontWeight: "bold"
            }}
          >{`${CoinUtils.shrinkDecimals(
            available,
            stakeCurrency.coinDecimals,
            0,
            4
          )} ${stakeCurrency.coinDenom.toUpperCase()}`}</div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <div style={{ color: "#11cdef", letterSpacing: "-0.3px" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-info" />
            </span>
            Staked
          </div>
          <div style={{ minWidth: "12px" }} />
          <div
            style={{
              color: "#525f7f",
              letterSpacing: "-0.3px",
              fontWeight: "bold"
            }}
          >{`${CoinUtils.shrinkDecimals(
            staked,
            stakeCurrency.coinDecimals,
            0,
            4
          )} ${stakeCurrency.coinDenom.toUpperCase()}`}</div>
        </div>
      </div>
    </React.Fragment>
  );
};

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

  const availableAmount = CoinUtils.amountOf(
    accountStore.assets,
    stakeCurrency.coinMinimalDenom
  );

  const stakedAmount = accountStore.stakedAsset
    ? accountStore.stakedAsset.amount
    : new Int(0);

  return (
    <div className={styleAsset.containerAsset}>
      {/*<div className={styleAsset.title}>
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
      </div>*/}
      <AssetStakedChartView
        fiat={fiat}
        fiatCurrency={fiatCurrency}
        stakeCurrency={stakeCurrency}
        available={availableAmount}
        staked={stakedAmount}
      />
      {/*<div className={styleAsset.amount}>
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
      </div>*/}
    </div>
  );
});
