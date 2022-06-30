/* eslint-disable react/display-name */

import {
  CosmosMsgOpts,
  CosmwasmMsgOpts,
  SecretMsgOpts,
} from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { FormattedMessage, IntlShape } from "react-intl";
import React from "react";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Hash } from "@keplr-wallet/crypto";
import {
  MessageObj,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgLink,
  MsgSend,
  MsgTransfer,
  MsgUndelegate,
  MsgVote,
  MsgWithdrawDelegatorReward,
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgExecuteContract,
  renderMsgInstantiateContract,
  renderMsgSend,
  renderMsgTransfer,
  renderMsgUndelegate,
  renderMsgVote,
  renderMsgWithdrawDelegatorReward,
  renderUnknownMessage,
} from "./messages";

export function renderAminoMessage(
  msgOpts: {
    readonly cosmos: {
      readonly msgOpts: CosmosMsgOpts;
    };
    readonly cosmwasm: {
      readonly msgOpts: CosmwasmMsgOpts;
    };
    readonly secret: {
      readonly msgOpts: SecretMsgOpts;
    };
  },
  msg: MessageObj,
  currencies: Currency[],
  intl: IntlShape
): {
  icon: string | undefined;
  title: string;
  content: React.ReactElement;
} {
  try {
    if (msg.type === msgOpts.cosmos.msgOpts.send.native.type) {
      const value = msg.value as MsgSend["value"];
      return renderMsgSend(currencies, intl, value.amount, value.to_address);
    }

    if (msg.type === msgOpts.cosmos.msgOpts.ibcTransfer.type) {
      const value = msg.value as MsgTransfer["value"];
      return renderMsgTransfer(
        currencies,
        intl,
        value.token,
        value.receiver,
        value.source_channel
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.redelegate.type) {
      const value = msg.value as MsgBeginRedelegate["value"];
      return renderMsgBeginRedelegate(
        currencies,
        intl,
        value.amount,
        value.validator_src_address,
        value.validator_dst_address
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.undelegate.type) {
      const value = msg.value as MsgUndelegate["value"];
      return renderMsgUndelegate(
        currencies,
        intl,
        value.amount,
        value.validator_address
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.delegate.type) {
      const value = msg.value as MsgDelegate["value"];
      return renderMsgDelegate(
        currencies,
        intl,
        value.amount,
        value.validator_address
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.withdrawRewards.type) {
      const value = msg.value as MsgWithdrawDelegatorReward["value"];
      return renderMsgWithdrawDelegatorReward(intl, value.validator_address);
    }

    if (msg.type === msgOpts.cosmos.msgOpts.govVote.type) {
      const value = msg.value as MsgVote["value"];
      return renderMsgVote(intl, value.proposal_id, value.option);
    }

    if (msg.type === "wasm/MsgInstantiateContract") {
      const value = msg.value as MsgInstantiateContract["value"];
      return renderMsgInstantiateContract(
        currencies,
        intl,
        value.init_funds,
        value.admin,
        value.code_id,
        value.label,
        value.init_msg
      );
    }

    if (msg.type === msgOpts.cosmwasm.msgOpts.executeWasm.type) {
      const value = msg.value as MsgExecuteContract["value"];
      return renderMsgExecuteContract(
        currencies,
        intl,
        value.funds ?? [],
        undefined,
        value.contract,
        value.msg
      );
    }

    if (msg.type === msgOpts.secret.msgOpts.executeSecretWasm.type) {
      const value = msg.value as MsgExecuteContract["value"];
      return renderMsgExecuteContract(
        currencies,
        intl,
        value.sent_funds ?? [],
        value.callback_code_hash,
        value.contract,
        value.msg
      );
    }

    if (msg.type === "cyber/Link") {
      const value = msg.value as MsgLink["value"];

      const cyberlinks: { from: string; to: string }[] = [];

      for (const link of value.links) {
        cyberlinks.push({
          from: link.from,
          to: link.to,
        });
      }

      return {
        icon: "fas fa-paper-plane",
        title: intl.formatMessage({
          id: "sign.list.message.cyber/Link.title",
        }),
        content: (
          <FormattedMessage
            id="sign.list.message.cyber/Link.content"
            values={{
              b: (...chunks: any[]) => <b>{chunks}</b>,
              br: <br />,
              neuron: Bech32Address.shortenAddress(value.neuron, 20),
              link: cyberlinks
                .map((link) => {
                  return `${Hash.truncHashPortion(
                    link.from,
                    7,
                    7
                  )} → ${Hash.truncHashPortion(link.to, 7, 7)}`;
                })
                .join(", "),
            }}
          />
        ),
      };
    }
  } catch (e) {
    console.log(e);
  }

  return renderUnknownMessage(msg);
}
