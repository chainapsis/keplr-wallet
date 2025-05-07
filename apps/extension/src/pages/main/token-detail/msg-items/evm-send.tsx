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
import { MessageSendIcon } from "../../../../components/icon";

export const MsgRelationEvmSend: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const meta = msg.meta as NativeTransferRelMeta | ERC20TransferRelMeta;

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(
      meta.contract ? `erc20:${meta.contract}` : targetDenom
    );

    const val = meta.value;

    return new CoinPretty(currency, val);
  }, [chainInfo, meta.value, targetDenom, meta.contract]);

  const toAddress = (() => {
    try {
      return `${meta.receiver.slice(0, 12)}...${meta.receiver.slice(-10)}`;
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  })();

  return (
    <MsgItemBase
      logo={
        <ItemLogo center={<MessageSendIcon width="2rem" height="2rem" />} />
      }
      chainId={msg.chainId}
      title="Send"
      paragraph={`To ${toAddress}`}
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={sendAmountPretty.denom}
      amountDeco={{
        prefix: "minus",
        color: "none",
      }}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
