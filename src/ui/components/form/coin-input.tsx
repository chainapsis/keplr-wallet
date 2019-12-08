import React, { FunctionComponent, useEffect, useState } from "react";

import classnames from "classnames";

import style from "./input.module.scss";
import { FieldName, FieldValues } from "react-hook-form/dist/types";
import { Currency } from "../../../chain-info";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";

export interface CoinInputProps<FormValues extends FieldValues = FieldValues> {
  currencies: Currency[];

  className?: string;
  color?: "primary" | "info" | "success" | "warning" | "danger";
  label?: string;
  error?: string;

  name?: string;
  setValue?: <Name extends FieldName<FormValues>>(
    name: Name,
    value: FormValues[Name],
    shouldValidate?: boolean | undefined
  ) => void | Promise<boolean>;
  setError?: (
    name: FieldName<FormValues>,
    type: string,
    message?: string | undefined,
    ref?: any
  ) => void;
  shouldValidate?: boolean | undefined;
}

export const CoinInput: FunctionComponent<CoinInputProps> = props => {
  const {
    currencies,
    className,
    color,
    label,
    error,
    name,
    setValue,
    setError,
    shouldValidate
  } = props;

  const [amount, setAmount] = useState("");
  const [currencyType, setCurrencyType] = useState("");
  const [currency, setCurrency] = useState<Currency | undefined>();

  useEffect(() => {
    try {
      if (currency) {
        if (amount) {
          let amountDec = new Dec(amount);
          let precision = new Dec(1);
          for (let i = 0; i < currency.coinDecimals; i++) {
            precision = precision.mul(new Dec(10));
          }
          amountDec = amountDec.mul(precision);
          if (!amountDec.equals(new Dec(amountDec.roundUp()))) {
            throw new Error("Can't divide anymore");
          }

          if (name && setValue) {
            setValue(name, amountDec.truncate() + currency.coinMinimalDenom);
          }
        }

        if (name && setError) {
          // Clear error.
          setError(name, "invalid");
        }
      } else if (amount) {
        throw new Error("Currency not set");
      }

      if (name && setError) {
        setError(name, "invalid");
      }
    } catch (e) {
      if (name && setError) {
        setError(name, "invalid", e.message);
      }
    }
    /**
     * XXX: Adding setError in deps will make re-render every time.
     * I don't know why this happens. It seems to be not memorized function or new setError is delivered whenever using setError.
     * It might be the bug(?) in react-hook-form.
     * Anyway, don't add `setError` in deps until this problem can be solved.
     */
  }, [amount, currency, name, setValue, shouldValidate]);

  useEffect(() => {
    let find = false;
    for (const currency of currencies) {
      if (currency.coinDenom === currencyType) {
        setCurrency(currency);
        find = true;
        break;
      }
    }
    if (!find && currencies.length > 0) {
      setCurrencyType(currencies[0].coinDenom);
    }
  }, [currencies, currencyType]);

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
            type="text"
            className={classnames(
              className,
              "input",
              style.input,
              color ? `is-${color}` : undefined,
              !color && error ? "is-danger" : undefined
            )}
            value={amount}
            onChange={(e: any) => {
              setAmount(e.target.value);
            }}
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
              value={currencyType}
              onChange={(e: any) => {
                setCurrencyType(e.target.value);
              }}
            >
              {currencies.map((currency, i) => {
                return <option key={i.toString()}>{currency.coinDenom}</option>;
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
