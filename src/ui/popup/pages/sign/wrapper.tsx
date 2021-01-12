import React, { FunctionComponent } from "react";

import { SignDocHelper } from "../../../../common/stargate/sign";
import {
  MessageObj,
  renderAminoMessage,
  renderBeginRedelegateMsg,
  renderDelegateMsg,
  renderSendMsg,
  renderUndelegateMsg,
  renderUnknownMessage
} from "./messages";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import styleDetailsTab from "./details-tab.module.scss";
import { Currency } from "../../../../common/currency";
import { IntlShape } from "react-intl";

import { cosmos } from "../../../../common/stargate/proto";
import { toBase64 } from "@cosmjs/encoding";
import { CoinPrimitive } from "../../../hooks/use-reward";

const Buffer = require("buffer/").Buffer;

interface AminoJsonObj {
  fee: {
    amount: [{ amount: string; denom: string }];
    gas: string;
  };
  memo: string;
  msgs: MessageObj[];
}

export class SignDocWrapper {
  protected isProtobuf: boolean;

  protected _protoSignDoc?: SignDocHelper;

  protected _aminoJsonObj?: AminoJsonObj;

  constructor(protected readonly message: Uint8Array) {
    // Assume that message is amino json if it starts with "{"
    this.isProtobuf = message[0] !== 123;
  }

  protected get protoSignDoc(): SignDocHelper {
    if (!this._protoSignDoc) {
      this._protoSignDoc = SignDocHelper.decode(this.message);
    }

    return this._protoSignDoc;
  }

  protected get aminoJsonObj(): AminoJsonObj {
    if (!this._aminoJsonObj) {
      this._aminoJsonObj = JSON.parse(Buffer.from(this.message));
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._aminoJsonObj!;
  }

  get memo(): string {
    if (this.isProtobuf) {
      return this.protoSignDoc.txBody.memo;
    }

    return this.aminoJsonObj.memo;
  }

  get fees(): Coin[] {
    if (this.isProtobuf) {
      const fees: Coin[] = [];
      for (const coinObj of this.protoSignDoc.authInfo.fee?.amount ?? []) {
        if (coinObj.denom == null || coinObj.amount == null) {
          throw new Error("Invalid fee");
        }
        fees.push(new Coin(coinObj.denom, coinObj.amount));
      }

      return fees;
    }

    const fees: Coin[] = [];
    const coinObjs = this.aminoJsonObj.fee.amount;
    if (coinObjs) {
      for (const coinObj of coinObjs) {
        fees.push(new Coin(coinObj.denom, coinObj.amount));
      }
    }

    return fees;
  }

  toString(): string {
    if (this.isProtobuf) {
      return JSON.stringify(
        JSON.parse(this.protoSignDoc.toString()),
        undefined,
        2
      );
    }
    return JSON.stringify(this.aminoJsonObj, undefined, 2);
  }

  protected static renderProtobufMsgs(
    currencies: Currency[],
    intl: IntlShape,
    msgs: any[]
  ) {
    return (
      <React.Fragment>
        {msgs.map((msg, i) => {
          let msgContent;

          console.log(msg, i);
          /*
           switch (msg.constroctor) hinders the `Typescript`'s type-inference feature...
           So, just ust the if-elseif-else.
           Is there a better way?
           */
          if (msg instanceof cosmos.bank.v1beta1.MsgSend) {
            msgContent = renderSendMsg(
              currencies,
              intl,
              msg.toAddress,
              msg.amount as CoinPrimitive[]
            );
          } else if (msg instanceof cosmos.staking.v1beta1.MsgDelegate) {
            msgContent = renderDelegateMsg(
              currencies,
              intl,
              msg.amount as CoinPrimitive,
              msg.validatorAddress
            );
          } else if (msg instanceof cosmos.staking.v1beta1.MsgBeginRedelegate) {
            msgContent = renderBeginRedelegateMsg(
              currencies,
              intl,
              msg.amount as CoinPrimitive,
              msg.validatorSrcAddress,
              msg.validatorDstAddress
            );
          } else if (msg instanceof cosmos.staking.v1beta1.MsgUndelegate) {
            msgContent = renderUndelegateMsg(
              currencies,
              intl,
              msg.amount as CoinPrimitive,
              msg.validatorAddress
            );
          } else {
            const isAny = (msg.typeUrl || msg.type_url) != null;

            msgContent = renderUnknownMessage(
              currencies,
              intl,
              isAny
                ? {
                    typeUrl: msg.typeUrl || msg.type_url || "Unknown",
                    value: toBase64(msg.value)
                  }
                : msg
            );
          }

          return (
            <React.Fragment key={i.toString()}>
              <Msg icon={msgContent.icon} title={msgContent.title}>
                {msgContent.content}
              </Msg>
              <hr />
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }

  renderMsgs(currencies: Currency[], intl: IntlShape): React.ReactElement {
    if (this.isProtobuf) {
      return SignDocWrapper.renderProtobufMsgs(
        currencies,
        intl,
        this.protoSignDoc.txMsgs
      );
    }

    const msgs = this.aminoJsonObj.msgs;

    return (
      <React.Fragment>
        {msgs.map((msg, i) => {
          const msgContent = renderAminoMessage(msg, currencies, intl);
          return (
            <React.Fragment key={i.toString()}>
              <Msg icon={msgContent.icon} title={msgContent.title}>
                {msgContent.content}
              </Msg>
              <hr />
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
}

export const Msg: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({ icon = "fas fa-question", title, children }) => {
  return (
    <div className={styleDetailsTab.msg}>
      <div className={styleDetailsTab.icon}>
        <div style={{ height: "2px" }} />
        <i className={icon} />
        <div style={{ flex: 1 }} />
      </div>
      <div className={styleDetailsTab.contentContainer}>
        <div className={styleDetailsTab.contentTitle}>{title}</div>
        <div className={styleDetailsTab.content}>{children}</div>
      </div>
    </div>
  );
};
