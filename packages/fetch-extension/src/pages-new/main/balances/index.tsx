import React from "react";
import style from "./style.module.scss";
import { useStore } from "../../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { useLanguage } from "../../../languages";
import { AppCurrency } from "@keplr-wallet/types";
import { observer } from "mobx-react-lite";
import { Button } from "reactstrap";
import { useNavigate } from "react-router";
import { separateNumericAndDenom } from "@utils/format";

interface Props {
  tokenState: any;
}

export const Balances: React.FC<Props> = observer(({ tokenState }) => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const navigate = useNavigate();
  const language = useLanguage();

  const fiatCurrency = language.fiatCurrency;

  const current = chainStore.current;

  const queries = queriesStore.get(current.chainId);

  const accountInfo = accountStore.getAccount(current.chainId);

  const balanceQuery = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const balanceStakableQuery = balanceQuery.stakable;

  const isNoble =
    ChainIdHelper.parse(chainStore.current.chainId).identifier === "noble";
  const hasUSDC = chainStore.current.currencies.find(
    (currency: AppCurrency) => currency.coinMinimalDenom === "uusdc"
  );

  const isEvm = chainStore.current.features?.includes("evm") ?? false;
  const stakable = (() => {
    if (isNoble && hasUSDC) {
      return balanceQuery.getBalanceFromCurrency(hasUSDC);
    }

    return balanceStakableQuery.balance;
  })();

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
  const total = stakable.add(stakedSum).add(stakableReward);

  const totalPrice = priceStore.calculatePrice(total, fiatCurrency);

  const { numericPart: totalNumber, denomPart: totalDenom } =
    separateNumericAndDenom(
      total.shrink(true).trim(true).maxDecimals(6).toString()
    );

  const changeInDollarsValue =
    tokenState.type === "positive"
      ? (parseFloat(totalNumber) * tokenState.diff) / 100
      : -(parseFloat(totalNumber) * tokenState.diff) / 100;

  const changeInDollarsClass =
    tokenState.type === "positive"
      ? style["increaseInDollarsGreen"]
      : style["increaseInDollarsOrange"];

  return (
    <div className={style["balance-card"]}>
      {isEvm ? (
        <div className={style["balance-field"]}>
          <div className={style["balance"]}>
            {totalNumber} <div className={style["denom"]}>{totalDenom}</div>
          </div>
          <div className={style["inUsd"]}>
            {totalPrice && ` ${totalPrice.toString()} `}
          </div>
          {tokenState?.diff && (
            <div
              className={` ${
                tokenState.type === "positive"
                  ? style["priceChangesGreen"]
                  : style["priceChangesOrange"]
              }`}
            >
              <div
                className={
                  style["changeInDollars"] + " " + changeInDollarsClass
                }
              >
                {changeInDollarsValue.toFixed(4)} {totalDenom}
              </div>
              <div className={style["changeInPer"]}>
                ( {tokenState.type === "positive" ? "+" : "-"}
                {parseFloat(tokenState.diff).toFixed(2)} %)
              </div>
              <div className={style["day"]}>{tokenState.time}</div>
            </div>
          )}
        </div>
      ) : (
        <div className={style["balance-field"]}>
          <div className={style["balance"]}>
            {totalNumber} <div className={style["denom"]}>{totalDenom}</div>
          </div>
          <div className={style["inUsd"]}>
            {totalPrice
              ? ` ${totalPrice.toString()} `
              : ` ${total
                  .shrink(true)
                  .trim(true)
                  .maxDecimals(6)
                  .toString()} USD`}
          </div>
          {tokenState?.diff && (
            <div
              className={` ${
                tokenState.type === "positive"
                  ? style["priceChangesGreen"]
                  : style["priceChangesOrange"]
              }`}
            >
              <div
                className={
                  style["changeInDollars"] + " " + changeInDollarsClass
                }
              >
                {changeInDollarsValue.toFixed(4)} {totalDenom}
              </div>
              <div className={style["changeInPer"]}>
                ({tokenState.type === "positive" ? "+" : "-"}
                {parseFloat(tokenState.diff).toFixed(2)} %)
              </div>
              <div className={style["day"]}>{tokenState.time}</div>
            </div>
          )}
        </div>
      )}
      <Button
        className={style["portfolio"]}
        onClick={() => navigate("/portfolio")}
      >
        View portfolio
      </Button>
    </div>
  );
});
