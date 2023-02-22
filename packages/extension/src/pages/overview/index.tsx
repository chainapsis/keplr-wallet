import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useLanguage } from "../../languages";

import style from "./style.module.scss";
import { useHistory } from "react-router";
import classnames from "classnames";
import { Menu } from "../main/menu";
import { HeaderLayout } from "../../layouts";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";

export const OverviewPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const language = useLanguage();
  const history = useHistory();

  const fiatCurrency = language.fiatCurrency;

  const chainBalances = chainStore.chainInfos.map((chainInfo) => {
    const accountInfo = accountStore.getAccount(chainInfo.chainId);
    const queries = queriesStore.get(chainInfo.chainId);

    const stakable = queries.queryBalances.getQueryBech32Address(
      accountInfo.bech32Address
    ).stakable.balance;

    const delegated = queries.cosmos.queryDelegations
      .getQueryBech32Address(accountInfo.bech32Address)
      .total.upperCase(true);

    const unbonding = queries.cosmos.queryUnbondingDelegations
      .getQueryBech32Address(accountInfo.bech32Address)
      .total.upperCase(true);

    const stakedSum = delegated.add(unbonding);
    const stakedSumPrice = priceStore.calculatePrice(stakedSum, fiatCurrency);

    const stakablePrice = priceStore.calculatePrice(stakable, fiatCurrency);

    return {
      chainName: chainInfo.chainName,
      chainId: chainInfo.chainId,
      currency: stakable.currency,
      amount: parseFloat(stakable.toDec().toString()),
      staking: parseFloat(stakable.toDec().toString()),
      stakingPrice: parseFloat(stakedSumPrice?.toDec().toString() ?? "0"),
      denom: stakable.denom,
      price: parseFloat(stakablePrice?.toDec().toString() ?? "0"),
    };
  });

  const tokens = chainStore.chainInfos
    .map((chainInfo) => {
      const accountInfo = accountStore.getAccount(chainInfo.chainId);
      return queriesStore
        .get(chainInfo.chainId)
        .queryBalances.getQueryBech32Address(accountInfo.bech32Address)
        .unstakables.filter((bal) => {
          if (
            chainStore.current.features &&
            chainStore.current.features.includes("terra-classic-fee")
          ) {
            // At present, can't handle stability tax well if it is not registered native token.
            // So, for terra classic, disable other tokens.
            const denom = new DenomHelper(bal.currency.coinMinimalDenom);
            if (denom.type !== "native" || denom.denom.startsWith("ibc/")) {
              return false;
            }

            if (denom.type === "native") {
              return bal.balance.toDec().gt(new Dec("0"));
            }
          }

          // Temporary implementation for trimming the 0 balanced native tokens.
          // TODO: Remove this part.
          if (
            new DenomHelper(bal.currency.coinMinimalDenom).type === "native"
          ) {
            return bal.balance.toDec().gt(new Dec("0"));
          }
          return true;
        })
        .sort((a, b) => {
          const aDecIsZero = a.balance.toDec().isZero();
          const bDecIsZero = b.balance.toDec().isZero();

          if (aDecIsZero && !bDecIsZero) {
            return 1;
          }
          if (!aDecIsZero && bDecIsZero) {
            return -1;
          }

          return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
        });
    })
    .reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue),
      []
    );

  const totalPrice = chainBalances
    .map((balacne) => balacne.price)
    .reduce((accumulator, currentValue) => accumulator + currentValue)
    .toFixed(6);

  const onClickAsset = (chainId: string, currency: AppCurrency) => {
    chainStore.selectChain(chainId);
    history.push(`/new-send/${JSON.stringify(currency)}`);
  };

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo
      alternativeTitle={"Overview"}
      menuRenderer={<Menu />}
      rightRenderer={
        <div
          style={{
            height: "64px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingRight: "20px",
          }}
        >
          <i
            className="fas fa-user"
            style={{
              cursor: "pointer",
              padding: "4px",
            }}
            onClick={(e) => {
              e.preventDefault();

              history.push("/setting/set-keyring");
            }}
          />
        </div>
      }
    >
      <div className={style.container}>
        <div className={style.totalContainer}>
          <div className={style.totalTitle}>total balance</div>
          <div className={style.totalValue}>${totalPrice}</div>
        </div>

        <div className={style.optionContainer}>
          <button
            className={style.bottomButton}
            onClick={() => console.log("Deposit")}
          >
            Deposit
          </button>
          <button
            className={style.bottomButton}
            onClick={() => history.push("/select-asset")}
          >
            Send
          </button>
        </div>

        <div>Balance</div>
        <div className={classnames(style.coinContainer, style.flexColumn)}>
          {chainBalances.map((balance) => {
            return (
              <div
                className={classnames(
                  style.flexRow,
                  style.coinItem,
                  style.cursorPointer
                )}
                key={balance.chainName}
                onClick={() => onClickAsset(balance.chainId, balance.currency)}
              >
                <div className={classnames(style.flexColumn)}>
                  <div>{balance.denom}</div>
                  <div>STAKING{` ${balance.staking} ${balance.denom}`}</div>
                </div>

                <div className={classnames(style.flexColumn, style.alignRight)}>
                  <div>{`${balance.amount} ${balance.denom}`}</div>
                  <div>{`$${balance.price}`}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div>Tokens</div>

        <div className={classnames(style.coinContainer, style.flexColumn)}>
          {tokens.map((token, i) => {
            return (
              <div
                className={classnames(
                  style.flexRow,
                  style.coinItem,
                  style.cursorPointer
                )}
                key={i}
                onClick={() => onClickAsset(token.chainId, token.currency)}
              >
                <div className={classnames(style.flexColumn)}>
                  {token.currency.coinDenom}
                </div>

                <div className={classnames(style.flexColumn, style.alignRight)}>
                  {token.balance
                    .trim(true)
                    .shrink(true)
                    .maxDecimals(6)
                    .toString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </HeaderLayout>
  );
});
