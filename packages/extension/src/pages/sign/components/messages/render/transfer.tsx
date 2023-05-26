import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";
import { Coin, CoinPretty } from "@keplr-wallet/unit";
import { Image } from "../../../../../components/image";

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
        icon: (
          <Image
            alt="icns-icon"
            src={require("../../../../../public/assets/img/sign-ibc-transfer.png")}
            style={{ width: "3rem", height: "3rem" }}
          />
        ),
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
