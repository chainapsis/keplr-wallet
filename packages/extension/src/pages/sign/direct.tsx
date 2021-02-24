import { Currency } from "@keplr/types";
import { IntlShape } from "react-intl";
import { cosmos, UnknownMessage } from "@keplr/cosmos";
import {
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgSend,
  renderMsgUndelegate,
  renderUnknownMessage,
} from "./messages";
import { CoinPrimitive } from "@keplr/stores";

import { Buffer } from "buffer/";

export function renderDirectMessage(
  msg: any,
  currencies: Currency[],
  intl: IntlShape
) {
  if (msg instanceof cosmos.bank.v1beta1.MsgSend) {
    return renderMsgSend(
      currencies,
      intl,
      msg.amount as CoinPrimitive[],
      msg.toAddress
    );
  }

  if (msg instanceof cosmos.staking.v1beta1.MsgDelegate) {
    return renderMsgDelegate(
      currencies,
      intl,
      msg.amount as CoinPrimitive,
      msg.validatorAddress
    );
  }

  if (msg instanceof cosmos.staking.v1beta1.MsgBeginRedelegate) {
    return renderMsgBeginRedelegate(
      currencies,
      intl,
      msg.amount as CoinPrimitive,
      msg.validatorSrcAddress,
      msg.validatorDstAddress
    );
  }

  if (msg instanceof cosmos.staking.v1beta1.MsgUndelegate) {
    return renderMsgUndelegate(
      currencies,
      intl,
      msg.amount as CoinPrimitive,
      msg.validatorAddress
    );
  }

  if (msg instanceof UnknownMessage) {
    return renderUnknownMessage(msg.toJSON());
  }

  return renderUnknownMessage({
    typeUrl: msg.typeUrl || msg.type_url || "Unknown",
    value: Buffer.from(msg.value).toString("base64"),
  });
}
