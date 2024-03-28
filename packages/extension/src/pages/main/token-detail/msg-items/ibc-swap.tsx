import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainImageFallback } from "../../../../components/image";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";

export const MsgRelationIBCSwap: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = observer(({ msg, prices, targetDenom }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const from = msg.meta["from"];
    if (
      from &&
      Array.isArray(from) &&
      from.length > 0 &&
      typeof from[0] === "string"
    ) {
      for (const coinStr of from) {
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

  const destinationChain: ChainInfo | undefined = (() => {
    if (!msg.ibcTracking) {
      return undefined;
    }

    try {
      let res: ChainInfo | undefined = undefined;
      for (const path of msg.ibcTracking.paths) {
        if (!path.clientChainId) {
          return undefined;
        }
        if (!chainStore.hasChain(path.clientChainId)) {
          return undefined;
        }

        res = chainStore.getChain(path.clientChainId);
      }

      return res;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  })();

  return (
    <MsgItemBase
      logo={
        <ItemLogo
          center={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.87"
                d="M3 13.5l10-10m0 0H5.5m7.5 0V11"
              />
            </svg>
          }
          deco={
            destinationChain ? (
              <ChainImageFallback
                chainInfo={destinationChain}
                size="0.875rem"
              />
            ) : undefined
          }
        />
      }
      chainId={msg.chainId}
      title="Swap"
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: "none",
        prefix: "minus",
      }}
    />
  );
});
