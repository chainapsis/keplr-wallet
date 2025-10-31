import { IMessageRenderer } from "../types";
import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";
import { Coin, CoinPretty } from "@keplr-wallet/unit";
import { FormattedMessage } from "react-intl";
import { Gutter } from "../../../../../components/gutter";
import { Box } from "../../../../../components/box";
import { XAxis } from "../../../../../components/axis";
import { Button } from "../../../../../components/button";
import { MessageSendIcon } from "../../../../../components/icon";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";

export const TransferMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "cosmos-sdk/MsgTransfer") {
        return {
          token: msg.value.token,
          receiver: msg.value.receiver,
          channelId: msg.value.source_channel,
          ibcMemo: msg.value.memo,
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
          ibcMemo: (msg.unpacked as MsgTransfer).memo,
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
          <FormattedMessage id="page.sign.components.messages.transfer.title" />
        ),
        content: (
          <TransferMessagePretty
            chainId={chainId}
            amount={d.token}
            receiver={d.receiver}
            channelId={d.channelId}
            ibcMemo={d.ibcMemo}
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
  ibcMemo?: string;
}> = observer(({ chainId, amount, receiver, channelId, ibcMemo }) => {
  const { chainStore } = useStore();

  const [isOpen, setIsOpen] = useState(false);

  const currency = chainStore
    .getModularChainInfoImpl(chainId)
    .forceFindCurrency(amount.denom);
  const coinPretty = new CoinPretty(currency, amount.amount);

  return (
    <React.Fragment>
      <FormattedMessage
        id="page.sign.components.messages.transfer.paragraph"
        values={{
          coin: coinPretty.trim(true).toString(),
          address: Bech32Address.shortenAddress(receiver, 20),
          channelId,
          b: (...chunks: any) => <b>{chunks}</b>,
        }}
      />
      {ibcMemo ? (
        <React.Fragment>
          <Gutter size="0.375rem" />
          <Box>
            {isOpen ? (
              <React.Fragment>
                <pre
                  style={{
                    width: "15rem",
                    margin: "0",
                    marginBottom: "0.5rem",
                  }}
                >
                  {isOpen
                    ? (() => {
                        try {
                          return JSON.stringify(JSON.parse(ibcMemo), null, 2);
                        } catch {
                          return ibcMemo;
                        }
                      })()
                    : ""}
                </pre>
              </React.Fragment>
            ) : null}
            <XAxis>
              <Button
                size="extraSmall"
                color="secondary"
                text={
                  isOpen ? (
                    <FormattedMessage id="page.sign.components.messages.transfer.forwarding.close-button" />
                  ) : (
                    <FormattedMessage id="page.sign.components.messages.transfer.forwarding.open-button" />
                  )
                }
                onClick={() => {
                  setIsOpen(!isOpen);
                }}
              />
            </XAxis>
          </Box>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
});
