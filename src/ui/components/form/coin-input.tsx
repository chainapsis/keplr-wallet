import React, { FunctionComponent, useEffect, useState } from "react";

import { Currency } from "../../../chain-info";

import classnames from "classnames";
import style from "./input.module.scss";
import styleCoinInput from "./coin-input.module.scss";

import { getCurrencyFromDenom } from "../../../common/currency";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { ElementLike } from "react-hook-form/dist/types";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";

export interface CoinInputProps {
  currencies: Currency[];
  balances?: Coin[];
  balanceText?: string;

  className?: string;
  color?: "primary" | "info" | "success" | "warning" | "danger";
  label?: string;
  error?: string;

  input: {
    name: string;
    ref: React.RefObject<HTMLInputElement> | ElementLike | null;
  };

  select: {
    name: string;
    ref: React.RefObject<HTMLSelectElement> | ElementLike | null;
  };

  onChangeAllBanace?: (allBalance: boolean) => void;
}

interface DecCoin {
  dec: Dec;
  decimals: number;
  denom: string;
}

export const CoinInput: FunctionComponent<CoinInputProps> = props => {
  const {
    currencies,
    balances,
    balanceText,
    className,
    color,
    label,
    error,
    input,
    select,
    onChangeAllBanace
  } = props;

  const [currency, setCurrency] = useState<Currency | undefined>();
  const [step, setStep] = useState<string | undefined>();
  const [balance, setBalance] = useState<DecCoin | undefined>();

  const [allBalance, setAllBalance] = useState(false);

  useEffect(() => {
    // If curreny currency is undefined, or new currencies don't have the matched current currency,
    // set currency as the first of new currencies.
    if (!currency) {
      if (currencies.length > 0) {
        setCurrency(currencies[0]);
      }
    } else {
      const find = currencies.find(c => {
        return c.coinMinimalDenom === currency.coinMinimalDenom;
      });
      if (!find) {
        if (currencies.length > 0) {
          setCurrency(currencies[0]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencies]);

  useEffect(() => {
    if (balances && currency) {
      const decCoin: DecCoin = {
        dec: new Dec(0),
        decimals: currency.coinDecimals,
        denom: currency.coinDenom
      };

      for (const coin of balances) {
        if (coin.denom === currency.coinMinimalDenom) {
          let precision = new Dec(1);
          for (let i = 0; i < currency.coinDecimals; i++) {
            precision = precision.mul(new Dec(10));
          }

          let dec = new Dec(coin.amount);
          dec = dec.quoTruncate(precision);

          decCoin.dec = dec;
          break;
        }
      }

      setBalance(decCoin);
    }
  }, [currency, balances]);

  useEffect(() => {
    if (currency) {
      let dec = new Dec(1);
      for (let i = 0; i < currency.coinDecimals; i++) {
        dec = dec.quoTruncate(new Dec(10));
      }
      setStep(dec.toString(currency.coinDecimals));
    } else {
      setStep(undefined);
    }
  }, [currency]);

  const canAllBalance =
    onChangeAllBanace && balance && balance.dec.gt(new Dec(0));

  return (
    <div className="fields">
      {label ? (
        <div className="field for-label">
          <label className="label">
            {label}
            {balances ? (
              <div
                className={classnames(styleCoinInput.balance, {
                  [styleCoinInput.clickable]: canAllBalance,
                  [styleCoinInput.clicked]: allBalance
                })}
                onClick={() => {
                  if (canAllBalance && onChangeAllBanace) {
                    const prev = allBalance;
                    setAllBalance(!prev);
                    onChangeAllBanace(!prev);
                  }
                }}
              >
                {balance
                  ? balanceText
                    ? // TODO: Can use api in react-intl?
                      `${balanceText}: 
                        ${balance.dec.toString(balance.decimals)} ${
                        balance.denom
                      }`
                    : `Balance: ${balance.dec.toString(balance.decimals)} ${
                        balance.denom
                      }`
                  : "?"}
              </div>
            ) : null}
          </label>
        </div>
      ) : null}

      <div className="field has-addons">
        <p
          className={classnames("control", "is-expanded", {
            "has-icons-right": error != null
          })}
        >
          <input
            type="number"
            step={step}
            className={classnames(
              className,
              "input",
              style.input,
              color ? `is-${color}` : undefined,
              !color && error ? "is-danger" : undefined
            )}
            name={input.name}
            ref={input.ref as any}
            disabled={allBalance}
          />
          {error ? (
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle has-text-danger" />
            </span>
          ) : null}
        </p>
        <p className="control">
          <span className="select">
            <select
              className={styleCoinInput.select}
              value={currency ? currency.coinDenom : ""}
              onChange={e => {
                const currency = getCurrencyFromDenom(e.target.value);
                if (currency) {
                  setCurrency(currency);
                }
              }}
              name={select.name}
              ref={select.ref as any}
              disabled={allBalance}
            >
              {currencies.map((currency, i) => {
                return (
                  <option key={i.toString()} value={currency.coinDenom}>
                    {currency.coinDenom}
                  </option>
                );
              })}
            </select>
          </span>
        </p>
      </div>

      {error ? (
        <div className="field for-label">
          <p className="help is-danger">{error}</p>
        </div>
      ) : null}
    </div>
  );
};
