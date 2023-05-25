import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";
import { Coin, CoinPretty } from "@keplr-wallet/unit";
import { IconProps } from "../../../../../components/icon/types";

export const TransferMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "cosmos-sdk/MsgTransfer") {
        return {
          token: msg.value.token,
          receiver: msg.value.receiver,
          channelId: msg.value.source_channel,
        };
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/ibc.applications.transfer.v1.MsgTransfer"
      ) {
        return {
          token: (msg.unpacked as MsgTransfer).token,
          receiver: (msg.unpacked as MsgTransfer).receiver,
          channelId: (msg.unpacked as MsgTransfer).sourceChannel,
        };
      }
    })();

    if (d) {
      return {
        icon: <TransferIcon />,
        title: "IBC Transfer",
        content: (
          <TransferMessagePretty
            chainId={chainId}
            amount={d.token}
            receiver={d.receiver}
            channelId={d.channelId}
          />
        ),
      };
    }
  },
};

const TransferMessagePretty: FunctionComponent<{
  chainId: string;
  amount: Coin;
  receiver: string;
  channelId: string;
}> = observer(({ chainId, amount, receiver, channelId }) => {
  const { chainStore } = useStore();

  const currency = chainStore.getChain(chainId).forceFindCurrency(amount.denom);
  const coinPretty = new CoinPretty(currency, amount.amount);

  return (
    <React.Fragment>
      Send <b>{coinPretty.trim(true).toString()}</b> to{" "}
      <b>{Bech32Address.shortenAddress(receiver, 20)}</b> on <b>{channelId}</b>
    </React.Fragment>
  );
});

const TransferIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
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
        d="M12.9766 9.28281C13.345 9.4588 13.6903 9.69938 13.9955 10.0045C15.4374 11.4465 15.4374 13.7843 13.9955 15.2262L10.3032 18.9185C8.86123 20.3605 6.52339 20.3605 5.08145 18.9185C3.63952 17.4766 3.63952 15.1388 5.08145 13.6968L6.52307 12.2552M17.4769 11.7448L18.9185 10.3032C20.3605 8.86123 20.3605 6.52339 18.9185 5.08145C17.4766 3.63952 15.1388 3.63952 13.6968 5.08145L10.0045 8.77376C8.56259 10.2157 8.56259 12.5535 10.0045 13.9955C10.3097 14.3006 10.655 14.5412 11.0234 14.7172"
        stroke={color || "currentColor"}
        strokeWidth="2.05128"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
