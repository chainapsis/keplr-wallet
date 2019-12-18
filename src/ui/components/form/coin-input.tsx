import React, { FunctionComponent, useEffect, useState } from "react";

import { Currency } from "../../../chain-info";

import classnames from "classnames";
import style from "./input.module.scss";

import { getCurrencyFromDenom } from "../../../common/currency";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { ElementLike } from "react-hook-form/dist/types";

export interface CoinInputProps {
  currencies: Currency[];

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
}

export const CoinInput: FunctionComponent<CoinInputProps> = props => {
  const { currencies, className, color, label, error, input, select } = props;

  const [currency, setCurrency] = useState<Currency | undefined>();
  const [step, setStep] = useState<string | undefined>();

  useEffect(() => {
    if (currencies.length > 0) {
      setCurrency(currencies[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="fields">
      {label ? (
        <div className="field for-label">
          <label className="label">{label}</label>
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
              value={currency ? currency.coinDenom : ""}
              onChange={e => {
                const currency = getCurrencyFromDenom(e.target.value);
                if (currency) {
                  setCurrency(currency);
                }
              }}
              name={select.name}
              ref={select.ref as any}
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
