import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";

export const MsgRelationSend: FunctionComponent<{
  explorerUrl: string;
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = observer(({ explorerUrl, msg, prices, targetDenom }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const amounts = (msg.msg as any)["amount"] as {
      denom: string;
      amount: string;
    }[];

    const amt = amounts.find((amt) => amt.denom === targetDenom);
    if (!amt) {
      return new CoinPretty(currency, "0");
    }
    return new CoinPretty(currency, amt.amount);
  }, [chainInfo, msg.msg, targetDenom]);

  const toAddress = (() => {
    try {
      return Bech32Address.shortenAddress((msg.msg as any)["to_address"], 20);
    } catch (e) {
      console.log(e);
      return "Unknown";
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
                d="M3 13.5l10-10m0 0H5.5m7.5 0V11"
              />
            </svg>
          }
        />
      }
      chainId={msg.chainId}
      title="Send"
      paragraph={`To ${toAddress}`}
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        prefix: "minus",
        color: "none",
      }}
    />
  );
});
