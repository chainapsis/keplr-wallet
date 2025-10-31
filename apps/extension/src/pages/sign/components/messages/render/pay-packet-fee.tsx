import { IMessageRenderer } from "../types";
import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { FormattedMessage } from "react-intl";
import { Gutter } from "../../../../../components/gutter";
import { Box } from "../../../../../components/box";
import { XAxis } from "../../../../../components/axis";
import { Button } from "../../../../../components/button";
import { MsgPayPacketFee } from "@keplr-wallet/proto-types/ibc/applications/fee/v1/tx";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { CustomIcon } from "./custom-icon";

export const PayPacketFeeMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "cosmos-sdk/MsgPayPacketFee") {
        return {
          fee: (() => {
            if (!msg.value.fee) {
              return undefined;
            }

            return {
              recvFee: msg.value.fee.recv_fee,
              ackFee: msg.value.fee.ack_fee,
              timeoutFee: msg.value.fee.timeout_fee,
            };
          })(),
          relayers: msg.value.relayers || [],
          sourceChannelId: msg.value.source_channel_id,
          sourcePortId: msg.value.source_port_id,
        };
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/ibc.applications.fee.v1.MsgPayPacketFee"
      ) {
        return {
          fee: (msg.unpacked as MsgPayPacketFee).fee,
          relayers: (msg.unpacked as MsgPayPacketFee).relayers,
          sourceChannelId: (msg.unpacked as MsgPayPacketFee).sourceChannelId,
          sourcePortId: (msg.unpacked as MsgPayPacketFee).sourcePortId,
        };
      }
    })();

    if (d) {
      return {
        icon: <CustomIcon />,
        title: (
          <FormattedMessage id="page.sign.components.messages.pay-packet-fee.title" />
        ),
        content: (
          <PayPacketFeeMessagePretty
            chainId={chainId}
            fee={d.fee}
            relayers={d.relayers}
            sourcePortId={d.sourcePortId}
            sourceChannelId={d.sourceChannelId}
          />
        ),
      };
    }
  },
};

const PayPacketFeeMessagePretty: FunctionComponent<{
  chainId: string;
  fee:
    | {
        recvFee: {
          amount: string;
          denom: string;
        }[];
        ackFee: {
          amount: string;
          denom: string;
        }[];
        timeoutFee: {
          amount: string;
          denom: string;
        }[];
      }
    | undefined;
  sourcePortId: string;
  sourceChannelId: string;
  relayers: string[];
}> = observer(({ chainId, fee, sourceChannelId, relayers }) => {
  const { chainStore } = useStore();

  const modularChainInfoImpl = chainStore.getModularChainInfoImpl(chainId);
  const cosmos =
    ("cosmos" in modularChainInfoImpl.embedded &&
      modularChainInfoImpl.embedded.cosmos) ||
    undefined;

  const [isOpen, setIsOpen] = useState(false);

  const totalFee: CoinPretty[] = (() => {
    if (!fee) {
      return [
        new CoinPretty(
          cosmos?.stakeCurrency ||
            modularChainInfoImpl.forceFindCurrency(
              cosmos?.feeCurrencies[0].coinMinimalDenom || ""
            ),
          "0"
        ),
      ];
    }

    const res: CoinPretty[] = [];
    const pushCoin = (coinPretty: CoinPretty) => {
      const findIndex = res.findIndex(
        (c) =>
          c.currency.coinMinimalDenom === coinPretty.currency.coinMinimalDenom
      );
      if (findIndex >= 0) {
        res[findIndex] = res[findIndex].add(coinPretty);
      } else {
        res.push(coinPretty);
      }
    };
    for (const coin of fee.recvFee) {
      pushCoin(
        new CoinPretty(
          chainStore
            .getModularChainInfoImpl(chainId)
            .forceFindCurrency(coin.denom),
          coin.amount
        )
      );
    }
    for (const coin of fee.ackFee) {
      pushCoin(
        new CoinPretty(
          chainStore
            .getModularChainInfoImpl(chainId)
            .forceFindCurrency(coin.denom),
          coin.amount
        )
      );
    }
    for (const coin of fee.timeoutFee) {
      pushCoin(
        new CoinPretty(
          chainStore
            .getModularChainInfoImpl(chainId)
            .forceFindCurrency(coin.denom),
          coin.amount
        )
      );
    }
    return res;
  })();

  return (
    <React.Fragment>
      <FormattedMessage
        id="page.sign.components.messages.pay-packet-fee.paragraph"
        values={{
          total: totalFee.map((coin) => coin.trim(true).toString()).join(", "),
          channelId: sourceChannelId,
          b: (...chunks: any) => <b>{chunks}</b>,
        }}
      />

      <Gutter size="0.375rem" />
      <Box>
        {isOpen ? (
          <pre
            style={{
              width: "15rem",
              margin: "0",
              marginBottom: "0.5rem",
            }}
          >
            {relayers.length > 0 ? (
              <React.Fragment>
                relayers:{" "}
                {relayers
                  .map((relayer) => Bech32Address.shortenAddress(relayer, 24))
                  .join(", ")}
                <br />
              </React.Fragment>
            ) : null}
            recv fee:{" "}
            {fee?.recvFee
              .map((coin) =>
                new CoinPretty(
                  chainStore
                    .getModularChainInfoImpl(chainId)
                    .forceFindCurrency(coin.denom),
                  coin.amount
                )
                  .trim(true)
                  .toString()
              )
              .join(", ")}
            <br />
            ack fee:{" "}
            {fee?.ackFee
              .map((coin) =>
                new CoinPretty(
                  chainStore
                    .getModularChainInfoImpl(chainId)
                    .forceFindCurrency(coin.denom),
                  coin.amount
                )
                  .trim(true)
                  .toString()
              )
              .join(", ")}
            <br />
            timeout fee:{" "}
            {fee?.timeoutFee
              .map((coin) =>
                new CoinPretty(
                  chainStore
                    .getModularChainInfoImpl(chainId)
                    .forceFindCurrency(coin.denom),
                  coin.amount
                )
                  .trim(true)
                  .toString()
              )
              .join(", ")}
            <br />
          </pre>
        ) : null}
        <XAxis>
          <Button
            size="extraSmall"
            color="secondary"
            text={
              isOpen ? (
                <FormattedMessage id="page.sign.components.messages.pay-packet-fee.close-button" />
              ) : (
                <FormattedMessage id="page.sign.components.messages.pay-packet-fee.open-button" />
              )
            }
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          />
        </XAxis>
      </Box>
    </React.Fragment>
  );
});
