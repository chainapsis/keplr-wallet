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
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import { UnknownChainImage } from "./unknown-chain-image";

export const MsgRelationIBCSendReceive: FunctionComponent<{
  explorerUrl: string;
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = observer(({ explorerUrl, msg, prices, targetDenom }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const receives = msg.meta["receives"] as string[];
    for (const receive of receives) {
      if (isValidCoinStr(receive)) {
        const coin = parseCoinStr(receive);
        if (coin.denom === targetDenom) {
          return new CoinPretty(currency, coin.amount);
        }
      }
    }

    return new CoinPretty(currency, "0");
  }, [chainInfo, msg.meta, targetDenom]);

  const fromAddress = (() => {
    if (!msg.ibcTracking) {
      return "Unknown";
    }

    try {
      const packet = JSON.parse(
        Buffer.from(msg.ibcTracking.originPacket, "base64").toString()
      );

      return Bech32Address.shortenAddress(packet["sender"], 20);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  })();

  const sourceChain: ChainInfo | undefined = (() => {
    if (!msg.ibcTracking) {
      return undefined;
    }

    try {
      for (const path of msg.ibcTracking.paths) {
        if (!path.chainId) {
          return undefined;
        }
        if (!chainStore.hasChain(path.chainId)) {
          return undefined;
        }

        if (!path.clientChainId) {
          return undefined;
        }
        if (!chainStore.hasChain(path.clientChainId)) {
          return undefined;
        }
      }

      if (msg.ibcTracking.paths.length > 0) {
        const path = msg.ibcTracking.paths[0];
        if (!path.chainId) {
          return undefined;
        }
        if (!chainStore.hasChain(path.chainId)) {
          return undefined;
        }
        return chainStore.getChain(path.chainId);
      }

      return undefined;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  })();

  return (
    <MsgItemBase
      explorerUrl={explorerUrl}
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
                d="M13 3L3 13m0 0h7.5M3 13V5.5"
              />
            </svg>
          }
          deco={
            sourceChain ? (
              <ChainImageFallback chainInfo={sourceChain} size="0.875rem" />
            ) : (
              <UnknownChainImage size="0.875rem" />
            )
          }
        />
      }
      chainId={msg.chainId}
      title="Receive"
      paragraph={`From ${fromAddress}`}
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: "green",
        prefix: "plus",
      }}
    />
  );
});
