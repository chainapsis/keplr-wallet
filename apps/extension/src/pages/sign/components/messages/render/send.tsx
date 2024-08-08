import { IMessageRenderer } from "../types";

import React, { FunctionComponent } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import { Coin } from "@keplr-wallet/types";
import { FormattedMessage } from "react-intl";
import { MessageSendIcon } from "../../../../../components/icon";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";

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
        icon: (
          <ItemLogo
            width="2.5rem"
            height="2.5rem"
            center={<MessageSendIcon width="2.5rem" height="2.5rem" />}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.send.title" />
        ),
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
      <FormattedMessage
        id="page.sign.components.messages.send.paragraph"
        values={{
          address: Bech32Address.shortenAddress(toAddress, 20),
          amount: coins
            .map((coinPretty) => {
              return coinPretty.trim(true).toString();
            })
            .join(", "),
          b: (...chunks: any) => <b>{chunks}</b>,
          br: <br />,
        }}
      />
    </React.Fragment>
  );
});
