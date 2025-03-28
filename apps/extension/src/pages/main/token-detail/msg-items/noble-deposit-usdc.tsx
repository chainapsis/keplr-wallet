import React, { FunctionComponent } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { MessageReceiveIcon } from "../../../../components/icon";

export const MsgRelationNobleDepositUsdc: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore } = useStore();
  const chainInfo = chainStore.getChain(msg.chainId);

  const tokenIn = (() => {
    const tokensIn = msg.meta["tokensIn"];
    if (tokensIn && Array.isArray(tokensIn)) {
      for (const coinStr of tokensIn) {
        if (isValidCoinStr(coinStr as string)) {
          return parseCoinStr(coinStr as string);
        }
      }
    }
    return undefined;
  })();

  const tokenOut = (() => {
    const tokensOut = msg.meta["tokensOut"];
    if (tokensOut && Array.isArray(tokensOut)) {
      for (const coinStr of tokensOut) {
        if (isValidCoinStr(coinStr as string)) {
          return parseCoinStr(coinStr as string);
        }
      }
    }
    return undefined;
  })();

  const destCurrency = chainInfo.forceFindCurrency(targetDenom);

  const tokenAmountPretty = (() => {
    if (tokenIn?.denom === targetDenom) {
      return new CoinPretty(destCurrency, tokenIn.amount);
    }
    if (tokenOut?.denom === targetDenom) {
      return new CoinPretty(destCurrency, tokenOut.amount);
    }

    return new CoinPretty(destCurrency, "0");
  })();

  return (
    <MsgItemBase
      logo={
        <ItemLogo center={<MessageReceiveIcon width="2rem" height="2rem" />} />
      }
      chainId={msg.chainId}
      title="Deposit"
      paragraph={(() => {
        if (chainInfo) {
          if (tokenIn) {
            const denom = new CoinPretty(
              chainInfo.forceFindCurrency(tokenIn?.denom ?? ""),
              tokenIn?.amount
            ).denom;
            return `From ${denom} on ${chainInfo.chainName}`;
          }
        }
        return "Unknown";
      })()}
      amount={tokenAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: "green",
        prefix: "plus",
      }}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
