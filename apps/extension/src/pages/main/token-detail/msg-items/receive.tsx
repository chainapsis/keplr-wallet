import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { MessageReceiveIcon } from "../../../../components/icon";

export const MsgRelationReceive: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore } = useStore();

  const modularChainInfoImpl = chainStore.getModularChainInfoImpl(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = modularChainInfoImpl.forceFindCurrency(targetDenom);

    const amounts = (msg.msg as any)["amount"] as {
      denom: string;
      amount: string;
    }[];

    const amt = amounts.find((amt) => amt.denom === targetDenom);
    if (!amt) {
      return new CoinPretty(currency, "0");
    }
    return new CoinPretty(currency, amt.amount);
  }, [modularChainInfoImpl, msg.msg, targetDenom]);

  const fromAddress = (() => {
    try {
      return Bech32Address.shortenAddress((msg.msg as any)["from_address"], 20);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  })();

  return (
    <MsgItemBase
      logo={
        <ItemLogo center={<MessageReceiveIcon width="2rem" height="2rem" />} />
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
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
