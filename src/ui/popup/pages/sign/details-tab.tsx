import React, { FunctionComponent, useEffect, useState } from "react";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { CoinUtils } from "../../../../common/coin-utils";

import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { getCurrencyFromMinimalDenom } from "../../../../common/currency";

import styleDetailsTab from "./details-tab.module.scss";
import classnames from "classnames";

import { MessageObj, renderMessage } from "./messages";
import { DecUtils } from "../../../../common/dec-utils";

export const DetailsTab: FunctionComponent<{ message: string }> = observer(
  ({ message }) => {
    const { priceStore } = useStore();

    const [fee, setFee] = useState<Coin[]>([]);
    const [feeFiat, setFeeFiat] = useState(new Dec(0));
    const [memo, setMemo] = useState("");
    const [msgs, setMsgs] = useState<MessageObj[]>([]);

    useEffect(() => {
      if (message) {
        const msgObj: {
          fee: {
            amount: [{ amount: string; denom: string }];
            gas: string;
          };
          memo: string;
          msgs: MessageObj[];
        } = JSON.parse(message);

        setMemo(msgObj.memo);
        setMsgs(msgObj.msgs);

        const coinObjs = msgObj.fee.amount;
        const fees: Coin[] = [];
        for (const coinObj of coinObjs) {
          fees.push(new Coin(coinObj.denom, coinObj.amount));
        }
        setFee(fees);
      }
    }, [message]);

    useEffect(() => {
      let price = new Dec(0);
      for (const coin of fee) {
        const currency = getCurrencyFromMinimalDenom(coin.denom);
        if (currency) {
          const value = priceStore.getValue("usd", currency.coinGeckoId);
          const parsed = CoinUtils.parseDecAndDenomFromCoin(coin);
          if (value) {
            price = price.add(new Dec(parsed.amount).mul(value.value));
          }
        }
      }

      setFeeFiat(price);
    }, [fee, priceStore]);

    return (
      <div className={styleDetailsTab.container}>
        <div
          className={classnames(
            styleDetailsTab.section,
            styleDetailsTab.messages
          )}
        >
          <div className={styleDetailsTab.title}>Messages</div>
          {msgs.map((msg, i) => {
            const msgContent = renderMessage(msg);
            return (
              <React.Fragment key={i.toString()}>
                <Msg icon={msgContent.icon} title={msgContent.title}>
                  {msgContent.content}
                </Msg>
                <hr />
              </React.Fragment>
            );
          })}
        </div>
        <div className={styleDetailsTab.section}>
          <div className={styleDetailsTab.title}>Fee</div>
          <div className={styleDetailsTab.fee}>
            <div>
              {fee
                .map(fee => {
                  const parsed = CoinUtils.parseDecAndDenomFromCoin(fee);
                  return `${DecUtils.removeTrailingZerosFromDecStr(
                    parsed.amount
                  )} ${parsed.denom}`;
                })
                .join(",")}
            </div>
            <div
              className={styleDetailsTab.fiat}
            >{`$${DecUtils.decToStrWithoutTrailingZeros(feeFiat)}`}</div>
          </div>
        </div>
        {memo ? (
          <div className={styleDetailsTab.section}>
            <div className={styleDetailsTab.title}>Memo</div>
            <div className={styleDetailsTab.memo}>{memo}</div>
          </div>
        ) : null}
      </div>
    );
  }
);

const Msg: FunctionComponent<{
  icon?: string;
  title: string;
}> = ({ icon = "fas fa-question", title, children }) => {
  return (
    <div className={styleDetailsTab.msg}>
      <div className={styleDetailsTab.icon}>
        <div style={{ flex: 1 }} />
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
