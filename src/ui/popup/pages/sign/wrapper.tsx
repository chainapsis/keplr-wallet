import React, { FunctionComponent } from "react";

import { SignDocHelper } from "../../../../common/stargate/sign";
import { MessageObj, renderMessage, renderSendMsg } from "./messages";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import styleDetailsTab from "./details-tab.module.scss";
import { Currency } from "../../../../common/currency";
import { IntlShape } from "react-intl";

import { cosmos } from "../../../../common/stargate/proto";

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

  renderMsgs(currencies: Currency[], intl: IntlShape): React.ReactElement {
    if (this.isProtobuf) {
      const msgs = this.protoSignDoc.txMsgs;

      return (
        <React.Fragment>
          {msgs.map((msg, i) => {
            let msgContent = renderMessage(msg, currencies, intl);
            if (msg instanceof cosmos.bank.v1beta1.MsgSend) {
              msgContent = renderSendMsg(
                currencies,
                intl,
                msg.toAddress,
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                msg.amount
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

    const msgs = this.aminoJsonObj.msgs;

    return (
      <React.Fragment>
        {msgs.map((msg, i) => {
          const msgContent = renderMessage(msg, currencies, intl);
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
