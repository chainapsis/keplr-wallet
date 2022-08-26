import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { ToolTip } from "../../components/tooltip";
import { useLanguage } from "../../languages";
import { useStore } from "../../stores";
import styleAsset from "./asset.module.scss";
import { TxButtonView } from "./tx-button";
import walletIcon from "../../public/assets/icon/wallet.png";
import buyIcon from "../../public/assets/icon/buy.png";
import { DepositView } from "./deposit";

export const ProgressBar = ({
  width,
  data,
}: {
  width: number;
  data: number[];
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const total = data[0] + data[1];
    const percentage = data[0] / total;
    setValue(percentage * width);
  }, [width, data[0], data[1]]);

  return (
    <div>
      <div className={styleAsset.progressDiv} style={{ width }}>
        <div style={{ width: `${value}px` }} className={styleAsset.progress} />
      </div>
    </div>
  );
};

const EmptyState = ({ denom, chainId }: { denom: string; chainId: string }) => {
  return (
    <div className={styleAsset.emptyState}>
      <h1 className={styleAsset.title}>No funds added</h1>
      <img src={walletIcon} alt="no fund" />
      <p className={styleAsset.desc}>
        That’s okay, you can deposit tokens to your address or buy some.
      </p>
      <button>Deposit {denom}</button>
      {chainId == "fetchhub-4" && (
        <a
          href={"https://indacoin.io/buy-fetch.ai-with-card"}
          target="_blank"
          rel="noopener noreferrer"
          className={styleAsset.buyButton}
        >
          <button>
            <img src={buyIcon} alt="buy tokens" /> Buy Tokens
          </button>
        </a>
      )}
    </div>
  );
};

export const AssetView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const language = useLanguage();

  const fiatCurrency = language.fiatCurrency;

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);

  const balanceStakableQuery = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  ).stakable;

  const stakable = balanceStakableQuery.balance;

  const delegated = queries.cosmos.queryDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const stakableReward = rewards.stakableReward;

  const stakedSum = delegated.add(unbonding);

  const total = stakable.add(stakedSum);

  const stakablePrice = priceStore.calculatePrice(stakable, fiatCurrency);
  const stakedSumPrice = priceStore.calculatePrice(stakedSum, fiatCurrency);

  const totalPrice = priceStore.calculatePrice(total, fiatCurrency);

  // If fiat value is fetched, show the value that is multiplied with amount and fiat value.
  // If not, just show the amount of asset.
  const data: number[] = [
    stakablePrice
      ? parseFloat(stakablePrice.toDec().toString())
      : parseFloat(stakable.toDec().toString()),
    stakedSumPrice
      ? parseFloat(stakedSumPrice.toDec().toString())
      : parseFloat(stakedSum.toDec().toString()),
  ];

  const hasBalance = totalPrice
    ? !totalPrice.toDec().isZero()
    : !total.toDec().isZero();

  if (!hasBalance) {
    return (
      <EmptyState
        denom={chainStore.current.stakeCurrency.coinDenom}
        chainId={chainStore.current.chainId}
      />
    );
  }

  return (
    <React.Fragment>
      <div className={styleAsset.containerAsset}>
        <div className={styleAsset.containerChart}>
          <div className={styleAsset.centerText}>
            <div className={styleAsset.big}>
              <FormattedMessage id="main.account.chart.total-balance" />
            </div>
            <div
              className={styleAsset.small}
              style={{
                marginBottom: "20px",
              }}
            >
              {totalPrice
                ? totalPrice.toString()
                : total.shrink(true).trim(true).maxDecimals(6).toString()}
            </div>
            <div className={styleAsset.indicatorIcon}>
              <React.Fragment>
                {balanceStakableQuery.isFetching ? (
                  <i className="fas fa-spinner fa-spin" />
                ) : balanceStakableQuery.error ? (
                  <ToolTip
                    tooltip={
                      balanceStakableQuery.error?.message ||
                      balanceStakableQuery.error?.statusText
                    }
                    theme="dark"
                    trigger="hover"
                    options={{
                      placement: "top",
                    }}
                  >
                    <i className="fas fa-exclamation-triangle text-danger" />
                  </ToolTip>
                ) : null}
              </React.Fragment>
            </div>
          </div>
          <ProgressBar width={300} data={data} />
        </div>
        <div className={styleAsset.legendContainer}>
          <div className={styleAsset.legend}>
            <div className={styleAsset.label} style={{ color: "#5e72e4" }}>
              <FormattedMessage id="main.account.chart.available-balance" />
            </div>
            <div style={{ minWidth: "16px" }} />
            <div
              className={styleAsset.value}
              style={{
                color: "#525f7f",
              }}
            >
              {stakable.shrink(true).maxDecimals(6).toString()}
            </div>
          </div>
          <div className={styleAsset.legend}>
            <div className={styleAsset.label} style={{ color: "#11cdef" }}>
              <FormattedMessage id="main.account.chart.staked-balance" />
            </div>
            <div style={{ minWidth: "16px" }} />
            <div
              className={styleAsset.value}
              style={{
                color: "#525f7f",
              }}
            >
              {stakedSum.shrink(true).maxDecimals(6).toString()}
            </div>
          </div>
          <div className={styleAsset.legend}>
            <div className={styleAsset.label} style={{ color: "#D43BF6" }}>
              <FormattedMessage id="main.account.chart.reward-balance" />
            </div>
            <div style={{ minWidth: "16px" }} />
            <div
              className={styleAsset.value}
              style={{
                color: "#525f7f",
              }}
            >
              {stakableReward.shrink(true).maxDecimals(6).toString()}
            </div>
          </div>
        </div>
      </div>
      <TxButtonView />
      <hr className={styleAsset.hr} />
      <DepositView />
    </React.Fragment>
  );
});
