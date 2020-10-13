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

const LazyDoughnut = React.lazy(async () => {
  const module = await import("react-chartjs-2");

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const chartJS = module.Chart as any;

  chartJS.pluginService.register({
    beforeDraw: function(chart: any): void {
      const round = {
        x: (chart.chartArea.left + chart.chartArea.right) / 2,
        y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
        radius: (chart.outerRadius + chart.innerRadius) / 2,
        thickness: (chart.outerRadius - chart.innerRadius) / 2
      };

      const ctx = chart.chart.ctx;

      // Draw the background circle.
      ctx.save();
      ctx.beginPath();
      ctx.arc(round.x, round.y, round.radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.lineWidth = round.thickness * 2;
      ctx.strokeStyle = "#f4f5f7";
      ctx.stroke();
      ctx.restore();
    },
    afterDraw: function(chart: any): void {
      const data = chart.getDatasetMeta(0).data;

      const round = {
        x: (chart.chartArea.left + chart.chartArea.right) / 2,
        y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
        radius: (chart.outerRadius + chart.innerRadius) / 2,
        thickness: (chart.outerRadius - chart.innerRadius) / 2
      };

      const ctx = chart.chart.ctx;

      const drawCircleEnd = (arc: any) => {
        const startAngle = Math.PI / 2 - arc._view.startAngle;
        const endAngle = Math.PI / 2 - arc._view.endAngle;

        if (
          Math.abs(startAngle) > (Math.PI / 180) * 3 ||
          Math.abs(endAngle) > (Math.PI / 180) * 3
        ) {
          ctx.save();
          ctx.translate(round.x, round.y);
          ctx.fillStyle = arc._model.backgroundColor;
          ctx.beginPath();
          ctx.arc(
            round.radius * Math.sin(startAngle),
            round.radius * Math.cos(startAngle),
            round.thickness,
            0,
            2 * Math.PI
          );
          ctx.arc(
            round.radius * Math.sin(endAngle),
            round.radius * Math.cos(endAngle),
            round.thickness,
            0,
            2 * Math.PI
          );
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      };

      if (data.length > 0) {
        for (const arc of data) {
          drawCircleEnd(arc);
        }
      }
    }
  });

  return { default: module.Doughnut };
});
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
      <div className={styleAsset.containerChart}>
        <div className={styleAsset.centerText}>
          <div className={styleAsset.big}>Total Balance</div>
          <div className={styleAsset.small}>
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
        <React.Suspense fallback={<div />}>
          <LazyDoughnut
            data={{
              datasets: [
                {
                  data,
                  backgroundColor: ["#5e72e4", "#11cdef"],
                  borderWidth: [0, 0]
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
      </div>
      <div style={{ marginTop: "12px" }}>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: "#5e72e4" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-primary" />
            </span>
            Available
          </div>
          <div style={{ minWidth: "12px" }} />
          <div
            className={styleAsset.value}
            style={{
              color: "#525f7f"
            }}
          >{`${CoinUtils.shrinkDecimals(
            available,
            stakeCurrency.coinDecimals,
            0,
            4
          )} ${stakeCurrency.coinDenom.toUpperCase()}`}</div>
        </div>
        <div className={styleAsset.legend}>
          <div className={styleAsset.label} style={{ color: "#11cdef" }}>
            <span className="badge-dot badge badge-secondary">
              <i className="bg-info" />
            </span>
            Staked
          </div>
          <div style={{ minWidth: "12px" }} />
          <div
            className={styleAsset.value}
            style={{
              color: "#525f7f"
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
