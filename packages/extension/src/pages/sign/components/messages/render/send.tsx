import { IMessageRenderer } from "../types";

import React, { FunctionComponent } from "react";
import { IconProps } from "../../../../../components/icon/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import { Coin } from "@keplr-wallet/types";

export const SendMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "cosmos-sdk/MsgSend") {
        return {
          amount: msg.value.amount,
          fromAddress: msg.value.from_address,
          toAddress: msg.value.to_address,
        };
      }

      if ("unpacked" in msg && msg.typeUrl === "/cosmos.bank.v1beta1.MsgSend") {
        return {
          amount: (msg.unpacked as MsgSend).amount,
          fromAddress: (msg.unpacked as MsgSend).fromAddress,
          toAddress: (msg.unpacked as MsgSend).toAddress,
        };
      }
    })();

    if (d) {
      return {
        icon: <SendIcon />,
        title: "Send",
        content: (
          <SendMessagePretty
            chainId={chainId}
            amount={d.amount}
            toAddress={d.toAddress}
          />
        ),
      };
    }
  },
};

const SendMessagePretty: FunctionComponent<{
  chainId: string;
  amount: Coin[];
  toAddress: string;
}> = observer(({ chainId, amount, toAddress }) => {
  const { chainStore } = useStore();
  const coins = amount.map((coin) => {
    const currency = chainStore.getChain(chainId).forceFindCurrency(coin.denom);

    return new CoinPretty(currency, coin.amount);
  });

  return (
    <React.Fragment>
      <b>{Bech32Address.shortenAddress(toAddress, 20)}</b> will receive
      <br />
      <b>
        {coins
          .map((coinPretty) => {
            return coinPretty.trim(true).toString();
          })
          .join(", ")}
      </b>
    </React.Fragment>
  );
});

const SendIcon: FunctionComponent<IconProps> = ({
  width = 24,
  height = 24,
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.25345 10.6659L6.43889 13.8514C6.75408 14.1666 7.25645 14.1906 7.59963 13.9074L16.1216 6.87875L9.09316 15.4002C8.80997 15.7434 8.83397 16.2466 9.14916 16.561L12.3346 19.7465C12.7818 20.1937 13.5417 20.0249 13.7577 19.4305L18.9463 5.16118C19.1967 4.47159 18.5287 3.8028 17.8391 4.05399L3.56943 9.24271C2.97506 9.45871 2.80627 10.2187 3.25345 10.6659Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
