import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { MsgHistory } from "../../main/token-detail/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { HistoryDetailSendBaseUI } from "./send";
import { Buffer } from "buffer";

export const HistoryDetailIBCSend: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore, accountStore } = useStore();

  const modularChainInfoImpl = chainStore.getModularChainInfoImpl(msg.chainId);
  const account = accountStore.getAccount(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = modularChainInfoImpl.forceFindCurrency(targetDenom);

    const token = (msg.msg as any)["token"] as {
      denom: string;
      amount: string;
    };

    if (token.denom !== targetDenom) {
      return new CoinPretty(currency, "0");
    }
    return new CoinPretty(currency, token.amount);
  }, [modularChainInfoImpl, msg.msg, targetDenom]);

  const fromAddress = (() => {
    return (msg.msg as any)["sender"];
  })();

  const name = (() => {
    if (account.bech32Address === fromAddress) {
      return account.name;
    }
    return "";
  })();

  const shortenedFromAddress = useMemo(() => {
    try {
      return Bech32Address.shortenAddress(fromAddress, 18);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [fromAddress]);

  const toAddress = (() => {
    if (!msg.ibcTracking) {
      return "Unknown";
    }

    try {
      let res = (msg.msg as any)["receiver"];
      const packetData = Buffer.from(
        msg.ibcTracking.originPacket,
        "base64"
      ).toString();
      const parsed = JSON.parse(packetData);
      let obj: any = (() => {
        if (!parsed.memo) {
          return undefined;
        }

        typeof parsed.memo === "string" ? JSON.parse(parsed.memo) : parsed.memo;
      })();

      while (obj) {
        if (obj.receiver) {
          res = obj.receiver;
        }
        obj = (() => {
          if (
            obj.forward &&
            typeof obj.forward === "object" &&
            obj.forward.next
          ) {
            const next = obj.forward.next;
            return typeof next === "string" ? JSON.parse(next) : next;
          }

          return typeof obj.next === "string" ? JSON.parse(obj.next) : obj.next;
        })();
      }

      return res;
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  })();

  const toChainName = (() => {
    if (!msg.ibcTracking) {
      return "Unknown";
    }

    if (msg.ibcTracking.paths.length === 0) {
      return "Unknown";
    }

    const lastPath = msg.ibcTracking.paths[msg.ibcTracking.paths.length - 1];
    if (lastPath.clientChainId && chainStore.hasChain(lastPath.clientChainId)) {
      return chainStore.getChain(lastPath.clientChainId).chainName;
    }
    return "Unknown";
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
      fromTextWalletIcon={true}
      fromText={name}
      fromAmount={sendAmountPretty}
      toText={toChainName}
    />
  );
});
