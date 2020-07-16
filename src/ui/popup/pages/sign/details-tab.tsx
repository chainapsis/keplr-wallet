import React, { FunctionComponent, useEffect, useState } from "react";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { CoinUtils } from "../../../../common/coin-utils";

import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import {
  getCurrencyFromMinimalDenom,
  getFiatCurrencyFromLanguage
} from "../../../../common/currency";

import styleDetailsTab from "./details-tab.module.scss";
import classnames from "classnames";

import { MessageObj, renderMessage } from "./messages";
import { DecUtils } from "../../../../common/dec-utils";
import { useIntl } from "react-intl";
import { useLanguage } from "../../language";

export const DetailsTab: FunctionComponent<{ message: string }> = observer(
  ({ message }) => {
    const { priceStore } = useStore();

    const intl = useIntl();

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

    const language = useLanguage();
    const fiatCurrency = getFiatCurrencyFromLanguage(language.language);

    // Set true if all fees have the coingecko id.
    const [hasCoinGeckoId, setHasCoinGeckoId] = useState(false);

    useEffect(() => {
      let price = new Dec(0);
      // Set true if all fees have the coingecko id.
      let hasCoinGeckoId = true;

      for (const coin of fee) {
        const currency = getCurrencyFromMinimalDenom(coin.denom);
        if (currency) {
          if (!currency.coinGeckoId) {
            hasCoinGeckoId = false;
          }
          if (
            !priceStore.hasFiat(fiatCurrency.currency) &&
            currency.coinGeckoId
          ) {
            priceStore.fetchValue(
              [fiatCurrency.currency],
              [currency.coinGeckoId]
            );
          }
          const value = priceStore.getValue(
            fiatCurrency.currency,
            currency.coinGeckoId
          );
          const parsed = CoinUtils.parseDecAndDenomFromCoin(coin);
          if (value) {
            price = price.add(new Dec(parsed.amount).mul(value.value));
          }
        }
      }

      setHasCoinGeckoId(hasCoinGeckoId);
      setFeeFiat(price);
    }, [fee, fiatCurrency.currency, priceStore]);

    return (
      <div className={styleDetailsTab.container}>
        <div
          className={classnames(
            styleDetailsTab.section,
            styleDetailsTab.messages
          )}
        >
          <div className={styleDetailsTab.title}>
            {intl.formatMessage({
              id: "sign.list.messages.label"
            })}
          </div>
          {msgs.map((msg, i) => {
            const msgContent = renderMessage(msg, intl);
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
          <div className={styleDetailsTab.title}>
            {intl.formatMessage({
              id: "sign.info.fee"
            })}
          </div>
          <div className={styleDetailsTab.fee}>
            <div>
              {fee
                .map(fee => {
                  const parsed = CoinUtils.parseDecAndDenomFromCoin(fee);
                  return `${DecUtils.trim(parsed.amount)} ${parsed.denom}`;
                })
                .join(",")}
            </div>
            <div className={styleDetailsTab.fiat}>
              {!feeFiat.equals(new Dec(0))
                ? fiatCurrency.symbol +
                  DecUtils.trim(
                    fiatCurrency.parse(parseFloat(feeFiat.toString()))
                  )
                : hasCoinGeckoId
                ? "?"
                : ""}
            </div>
          </div>
        </div>
        {memo ? (
          <div className={styleDetailsTab.section}>
            <div className={styleDetailsTab.title}>
              {intl.formatMessage({
                id: "sign.info.memo"
              })}
            </div>
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
