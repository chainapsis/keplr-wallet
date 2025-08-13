import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import {
  ERC20TransferRelMeta,
  MsgHistory,
  NativeTransferRelMeta,
} from "../../main/token-detail/types";
import { HistoryDetailSendBaseUI } from "./send";

export const HistoryDetailEvmSend: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore, accountStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);
  const account = accountStore.getAccount(msg.chainId);

  const meta = msg.meta as NativeTransferRelMeta | ERC20TransferRelMeta;

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(
      meta.contract ? `erc20:${meta.contract}` : targetDenom
    );

    const val = meta.value;

    return new CoinPretty(currency, val);
  }, [chainInfo, meta.value, targetDenom, meta.contract]);

  const fromAddress = useMemo(() => {
    return meta.sender;
  }, [meta.sender]);

  const toAddress = useMemo(() => {
    return meta.receiver;
  }, [meta.receiver]);

  const shortenedFromAddress = useMemo(() => {
    try {
      return `${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}`;
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [fromAddress]);

  const shortenedToAddress = useMemo(() => {
    try {
      return `${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`;
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [toAddress]);

  const name = useMemo(() => {
    // Check if the from address matches the account address (EVM format)
    if (
      account.ethereumHexAddress?.toLowerCase() === fromAddress.toLowerCase()
    ) {
      return account.name;
    }
    return "";
  }, [account.ethereumHexAddress, account.name, fromAddress]);

  return (
    <HistoryDetailSendBaseUI
      fromAddress={fromAddress}
      shortenedFromAddress={shortenedFromAddress}
      toAddress={toAddress}
      shortenedToAddress={shortenedToAddress}
      fromTextWalletIcon={true}
      fromText={name}
      fromAmount={sendAmountPretty}
    />
  );
});
