import React, { FunctionComponent, useEffect, useState } from "react";

import classnames from "classnames";
import styleCoinInput from "./coin-input.module.scss";

import { Currency } from "../../../common/currency";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { ElementLike } from "react-hook-form/dist/types";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { FormFeedback, FormGroup, Input, InputGroup, Label } from "reactstrap";

export interface CoinInputProps {
  currencies: Currency[];
  balances?: Coin[];
  balanceText?: string;

  className?: string;
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

  denom: string;
  setDenom: (denom: string) => void;

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
    label,
    error,
    input,
    select,
    denom,
    setDenom,
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
        setDenom(currencies[0].coinMinimalDenom);
      }
    } else {
      const find = currencies.find(c => {
        return c.coinMinimalDenom === currency.coinMinimalDenom;
      });
      if (!find) {
        if (currencies.length > 0) {
          setCurrency(currencies[0]);
          setDenom(currencies[0].coinMinimalDenom);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencies]);

  useEffect(() => {
    const currency = currencies.find(
      currency => currency.coinMinimalDenom === denom
    );
    setCurrency(currency);
  }, [currencies, denom]);

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

  const [inputId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `input-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <FormGroup className={className}>
      {label ? (
        <Label
          for={inputId}
          className="form-control-label"
          style={{ width: "100%" }}
        >
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
        </Label>
      ) : null}
      <InputGroup
        id={inputId}
        className={classnames(styleCoinInput.selectContainer, {
          disabled: allBalance
        })}
      >
        <Input
          className={classnames(
            "form-control-alternative",
            styleCoinInput.input
          )}
          type="number"
          step={step}
          name={input.name}
          innerRef={input.ref as any}
          disabled={allBalance}
          autoComplete="off"
        />
        <Input
          type="select"
          className={classnames(
            "form-control-alternative",
            styleCoinInput.select
          )}
          name={select.name}
          innerRef={select.ref as any}
          disabled={allBalance}
        >
          {currencies.map((currency, i) => {
            return (
              <option key={i.toString()} value={currency.coinMinimalDenom}>
                {currency.coinDenom}
              </option>
            );
          })}
        </Input>
      </InputGroup>
      {error ? (
        <FormFeedback style={{ display: "block" }}>{error}</FormFeedback>
      ) : null}
    </FormGroup>
  );
};
