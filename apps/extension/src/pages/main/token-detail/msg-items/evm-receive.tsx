import React, { FunctionComponent, useMemo } from "react";
import {
  ERC20TransferRelMeta,
  MsgHistory,
  NativeTransferRelMeta,
} from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { MessageReceiveIcon } from "../../../../components/icon";

export const MsgRelationEvmReceive: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const meta = msg.meta as NativeTransferRelMeta | ERC20TransferRelMeta;

  const receiveAmountPretty = useMemo(() => {
    const currency = chainInfo.findCurrency(
      meta.contract ? `erc20:${meta.contract}` : targetDenom
    );

    if (currency) {
      const val = meta.value;

      return new CoinPretty(currency, val);
    } else {
      return "Unknown";
    }
  }, [chainInfo, meta.value, targetDenom, meta.contract]);

  const fromAddress = (() => {
    try {
      return `${meta.sender.slice(0, 12)}...${meta.sender.slice(-10)}`;
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
      amount={receiveAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        prefix: "plus",
        color: "green",
      }}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
