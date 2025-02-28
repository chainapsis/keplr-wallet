import React, { FunctionComponent, useMemo } from "react";
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

  const amountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);
    const tokensOut = msg.meta["tokensOut"];
    if (
      tokensOut &&
      Array.isArray(tokensOut) &&
      tokensOut.length > 0 &&
      typeof tokensOut[0] === "string"
    ) {
      for (const coinStr of tokensOut) {
        if (isValidCoinStr(coinStr as string)) {
          const coin = parseCoinStr(coinStr as string);
          if (coin.denom === targetDenom) {
            return new CoinPretty(currency, coin.amount);
          }
        }
      }
    }

    return new CoinPretty(currency, "0");
  }, [chainInfo, msg.meta, targetDenom]);

  return (
    <MsgItemBase
      logo={
        <ItemLogo center={<MessageReceiveIcon width="2rem" height="2rem" />} />
      }
      chainId={msg.chainId}
      title="Deposit"
      paragraph={(() => {
        if (chainInfo) {
          return `To ${amountPretty.denom} on ${chainInfo.chainName}`;
        }
        return "Unknown";
      })()}
      amount={amountPretty}
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
