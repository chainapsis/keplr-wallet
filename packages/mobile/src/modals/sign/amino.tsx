import React from "react";
import {
  AccountSetOpts,
  CosmosMsgOpts,
  SecretMsgOpts,
} from "@keplr-wallet/stores";
import {
  MessageObj,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgSend,
  MsgTransfer,
  MsgUndelegate,
  MsgVote,
  MsgWithdrawDelegatorReward,
  renderMsgSend,
  renderUnknownMessage,
  renderMsgTransfer,
  renderMsgBeginRedelegate,
  renderMsgUndelegate,
  renderMsgDelegate,
  renderMsgWithdrawDelegatorReward,
  renderMsgVote,
} from "./messages";
import { AppCurrency } from "@keplr-wallet/types";

export function renderAminoMessage(
  msgOpts: AccountSetOpts<CosmosMsgOpts & SecretMsgOpts>["msgOpts"],
  msg: MessageObj,
  currencies: AppCurrency[]
): {
  title: string;
  content: React.ReactElement;
  scrollViewHorizontal?: boolean;
} {
  if (msg.type === msgOpts.send.native.type) {
    const value = msg.value as MsgSend["value"];
    return renderMsgSend(currencies, value.amount, value.to_address);
  }

  if (msg.type === msgOpts.ibcTransfer.type) {
    const value = msg.value as MsgTransfer["value"];
    return renderMsgTransfer(
      currencies,
      value.token,
      value.receiver,
      value.source_channel
    );
  }

  if (msg.type === msgOpts.redelegate.type) {
    const value = msg.value as MsgBeginRedelegate["value"];
    return renderMsgBeginRedelegate(
      currencies,
      value.amount,
      value.validator_src_address,
      value.validator_dst_address
    );
  }

  if (msg.type === msgOpts.undelegate.type) {
    const value = msg.value as MsgUndelegate["value"];
    return renderMsgUndelegate(
      currencies,
      value.amount,
      value.validator_address
    );
  }

  if (msg.type === msgOpts.delegate.type) {
    const value = msg.value as MsgDelegate["value"];
    return renderMsgDelegate(currencies, value.amount, value.validator_address);
  }

  if (msg.type === msgOpts.withdrawRewards.type) {
    const value = msg.value as MsgWithdrawDelegatorReward["value"];
    return renderMsgWithdrawDelegatorReward(value.validator_address);
  }

  if (msg.type === msgOpts.govVote.type) {
    const value = msg.value as MsgVote["value"];
    return renderMsgVote(value.proposal_id, value.option);
  }

  /*
  if (msg.type === "wasm/MsgInstantiateContract") {
    const value = msg.value as MsgInstantiateContract["value"];
    return renderMsgInstantiateContract(
      currencies,
      value.init_funds,
      value.admin,
      value.code_id,
      value.label,
      value.init_msg
    );
  }

  if (msg.type === msgOpts.executeSecretWasm.type) {
    const value = msg.value as MsgExecuteContract["value"];
    return renderMsgExecuteContract(
      currencies,
      value.sent_funds,
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
            address: Bech32Address.shortenAddress(value.address, 20),
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
   */
  return renderUnknownMessage(msg);
}
