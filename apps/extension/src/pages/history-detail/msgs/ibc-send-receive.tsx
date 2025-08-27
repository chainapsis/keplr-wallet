import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { MsgHistory } from "../../main/token-detail/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { HistoryDetailSendBaseUI } from "./send";
import { Buffer } from "buffer";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";

export const HistoryDetailIBCSendReceive: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore, accountStore } = useStore();

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

      return packet["sender"];
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  })();

  const shortenedFromAddress = useMemo(() => {
    try {
      return Bech32Address.shortenAddress(fromAddress, 18);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [fromAddress]);

  const fromChainName = (() => {
    if (!msg.ibcTracking) {
      return "";
    }

    if (msg.ibcTracking.paths.length === 0) {
      return "";
    }

    const firstPath = msg.ibcTracking.paths[0];
    if (firstPath.chainId && chainStore.hasChain(firstPath.chainId)) {
      return chainStore.getChain(firstPath.chainId).chainName;
    }
    return "";
  })();

  const toAddress = (() => {
    if (!msg.ibcTracking) {
      return "Unknown";
    }

    try {
      const packet = JSON.parse(
        Buffer.from(msg.ibcTracking.originPacket, "base64").toString()
      );

      return packet["receiver"];
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  })();

  const toChainId = (() => {
    if (!msg.ibcTracking) {
      return "";
    }

    if (msg.ibcTracking.paths.length === 0) {
      return "";
    }

    const lastPath = msg.ibcTracking.paths[msg.ibcTracking.paths.length - 1];
    if (lastPath.clientChainId && chainStore.hasChain(lastPath.clientChainId)) {
      return chainStore.getChain(lastPath.clientChainId).chainId;
    }
    return "";
  })();

  const toWalletName = (() => {
    if (!toChainId) {
      return "";
    }

    if (chainStore.hasChain(toChainId)) {
      const toAccount = accountStore.getAccount(toChainId);
      if (toAccount.bech32Address === toAddress) {
        return toAccount.name;
      }
    }

    return "";
  })();

  const shortenedToAddress = useMemo(() => {
    try {
      return Bech32Address.shortenAddress(toAddress, 18);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [toAddress]);

  return (
    <HistoryDetailSendBaseUI
      fromAddress={fromAddress}
      shortenedFromAddress={shortenedFromAddress}
      toAddress={toAddress}
      shortenedToAddress={shortenedToAddress}
      fromText={fromChainName}
      toAmount={sendAmountPretty}
      toTextWalletIcon={true}
      toText={toWalletName}
    />
  );
});
