import React, { FunctionComponent, useEffect, useState } from "react";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import { CoinUtils } from "../../../../common/coin-utils";

import { Dec } from "@chainapsis/cosmosjs/common/decimal";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { getFiatCurrencyFromLanguage } from "../../../../common/currency";

import styleDetailsTab from "./details-tab.module.scss";
import classnames from "classnames";

import { DecUtils } from "../../../../common/dec-utils";
import { useIntl } from "react-intl";
import { useLanguage } from "../../language";
import { SignDocWrapper } from "./wrapper";

const Buffer = require("buffer/").Buffer;

export const DetailsTab: FunctionComponent<{ messageHex: string }> = observer(
  ({ messageHex }) => {
    const { chainStore, priceStore } = useStore();

    const intl = useIntl();

    const [wrapper, setWapper] = useState<SignDocWrapper | undefined>(
      undefined
    );

    const [fee, setFee] = useState<Coin[]>([]);
    const [feeFiat, setFeeFiat] = useState(new Dec(0));
    const [memo, setMemo] = useState("");

    useEffect(() => {
      if (messageHex) {
        const wrapper = new SignDocWrapper(Buffer.from(messageHex, "hex"));
        setWapper(wrapper);
        setMemo(wrapper.memo);
        setFee(wrapper.fees);
      }
    }, [messageHex]);

    const language = useLanguage();
    const fiatCurrency = getFiatCurrencyFromLanguage(language.language);

    // Set true if all fees have the coingecko id.
    const [hasCoinGeckoId, setHasCoinGeckoId] = useState(false);

    useEffect(() => {
      let price = new Dec(0);
      // Set true if all fees have the coingecko id.
      let hasCoinGeckoId = true;

      for (const coin of fee) {
        const currency = chainStore.allCurrencies.find(currency => {
          return currency.coinMinimalDenom === coin.denom;
        });
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
          const parsed = CoinUtils.parseDecAndDenomFromCoin(
            chainStore.allCurrencies,
            coin
          );
          if (value) {
            price = price.add(new Dec(parsed.amount).mul(value.value));
          }
        } else {
          hasCoinGeckoId = false;
          price = new Dec(0);
        }
      }

      setHasCoinGeckoId(hasCoinGeckoId);
      setFeeFiat(price);
    }, [chainStore.allCurrencies, fee, fiatCurrency.currency, priceStore]);

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
          {wrapper ? wrapper.renderMsgs(chainStore.allCurrencies, intl) : null}
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
                  const find = chainStore.allCurrencies.find(
                    cur => cur.coinMinimalDenom === fee.denom
                  );
                  if (!find) {
                    return `${fee.amount.toString()} ${fee.denom}`;
                  }

                  const parsed = CoinUtils.parseDecAndDenomFromCoin(
                    chainStore.allCurrencies,
                    fee
                  );
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
