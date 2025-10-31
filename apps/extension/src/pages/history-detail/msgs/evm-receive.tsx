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

export const HistoryDetailEvmReceive: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore, accountStore } = useStore();

  const modularChainInfoImpl = chainStore.getModularChainInfoImpl(msg.chainId);
  const account = accountStore.getAccount(msg.chainId);

  const meta = msg.meta as NativeTransferRelMeta | ERC20TransferRelMeta;

  const receiveAmountPretty = useMemo(() => {
    const currency = modularChainInfoImpl.findCurrency(
      meta.contract ? `erc20:${meta.contract}` : targetDenom
    );

    if (currency) {
      const val = meta.value;

      return new CoinPretty(currency, val);
    } else {
      return "Unknown";
    }
  }, [modularChainInfoImpl, meta.value, targetDenom, meta.contract]);

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
    // Check if the to address matches the account address (EVM format)
    if (account.ethereumHexAddress?.toLowerCase() === toAddress.toLowerCase()) {
      return account.name;
    }
    return "";
  }, [account.ethereumHexAddress, account.name, toAddress]);

  return (
    <HistoryDetailSendBaseUI
      fromAddress={fromAddress}
      shortenedFromAddress={shortenedFromAddress}
      toAddress={toAddress}
      shortenedToAddress={shortenedToAddress}
      toTextWalletIcon={true}
      toText={name}
      toAmount={receiveAmountPretty}
    />
  );
});
