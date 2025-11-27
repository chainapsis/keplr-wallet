import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { MsgHistory } from "../../main/token-detail/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { HistoryDetailSendBaseUI } from "./send";
import { ColorPalette } from "../../../styles";
import { useTheme } from "styled-components";

export const HistoryDetailReceive: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore, accountStore } = useStore();

  const modularChainInfoImpl = chainStore.getModularChainInfoImpl(msg.chainId);
  const account = accountStore.getAccount(msg.chainId);

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
    return (msg.msg as any)["from_address"];
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
    return (msg.msg as any)["to_address"];
  })();

  const name = (() => {
    if (account.bech32Address === toAddress) {
      return account.name;
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
      toTextWalletIcon={true}
      toText={name}
      toAmount={sendAmountPretty}
    />
  );
});

export const HistoryDetailReceiveIcon: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="41"
      height="41"
      fill="none"
      viewBox="0 0 41 41"
    >
      <path
        stroke={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.53"
        d="M31.836 8.645 8.644 31.836m0 0h17.394m-17.394 0V14.442"
      />
    </svg>
  );
};
