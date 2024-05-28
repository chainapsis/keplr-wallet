import React, { FunctionComponent, useEffect, useMemo, useState } from "react";

import classnames from "classnames";
import styleCoinInput from "./coin-input.module.scss";

import { FormGroup, Label } from "reactstrap";
import { observer } from "mobx-react-lite";
import {
  EmptyAmountError,
  InvalidNumberAmountError,
  ZeroAmountError,
  NegativeAmountError,
  InsufficientAmountError,
  IAmountConfig,
  BridgeAmountError,
} from "@keplr-wallet/hooks";
import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { useIntl } from "react-intl";
import { useStore } from "../../stores";
import { AppCurrency } from "@keplr-wallet/types";
import { useLanguage } from "../../languages";
import { Card } from "../card";
import { Dropdown } from "../dropdown";
import { parseDollarAmount, parseExponential } from "@utils/format";

export interface CoinInputProps {
  amountConfig: IAmountConfig;
  balanceText?: string;
  className?: string;
  label?: string;
  disableAllBalance?: boolean;
  overrideSelectableCurrencies?: AppCurrency[];
  dropdownDisabled?: boolean;
}

export const CoinInput: FunctionComponent<CoinInputProps> = observer(
  ({ amountConfig, disableAllBalance }) => {
    const intl = useIntl();
    const [inputInUsd, setInputInUsd] = useState<string | undefined>("");
    const [isToggleClicked, setIsToggleClicked] = useState<boolean>(false);

    const { priceStore } = useStore();

    const language = useLanguage();
    const fiatCurrency = language.fiatCurrency;
    const convertToUsd = (currency: any) => {
      const value = priceStore.calculatePrice(currency, fiatCurrency);
      const inUsd = value && value.shrink(true).maxDecimals(6).toString();
      return inUsd;
    };

    useEffect(() => {
      const currencyDecimals = amountConfig.sendCurrency.coinDecimals;

      let dec = new Dec(amountConfig.amount ? amountConfig.amount : "0");
      dec = dec.mul(DecUtils.getTenExponentNInPrecisionRange(currencyDecimals));
      const amountInNumber = dec.truncate().toString();
      const inputValue = new CoinPretty(
        amountConfig.sendCurrency,
        new Int(amountInNumber)
      );
      const inputValueInUsd = convertToUsd(inputValue);
      setInputInUsd(inputValueInUsd);
    }, [amountConfig.amount]);

    const [randomId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return Buffer.from(bytes).toString("hex");
    });

    const error = amountConfig.error;
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAmountError:
            // No need to show the error to the user.
            return;
          case InvalidNumberAmountError:
            return intl.formatMessage({
              id: "input.amount.error.invalid-number",
            });
          case ZeroAmountError:
            return intl.formatMessage({
              id: "input.amount.error.is-zero",
            });
          case NegativeAmountError:
            return intl.formatMessage({
              id: "input.amount.error.is-negative",
            });
          case InsufficientAmountError:
            return intl.formatMessage({
              id: "input.amount.error.insufficient",
            });
          case BridgeAmountError:
            return error.message;
          default:
            return intl.formatMessage({ id: "input.amount.error.unknown" });
        }
      }
    }, [intl, error]);

    const resizable = (el: any) => {
      const int = 17.7;
      const resize = () => {
        el.style.width = `${(el.value.length + 1) * int}px`;
      };
      const events = ["keyup", "keypress", "focus", "blur", "change"];
      for (const event of events) {
        el.addEventListener(event, resize, false);
      }
      resize();
    };
    useEffect(() => {
      const inputElement = document.getElementById(`input-${randomId}`);
      if (inputElement) {
        resizable(inputElement);
      }
    }, [randomId]);

    const isClicked = () => {
      setIsToggleClicked(!isToggleClicked);
    };
    console.log(inputInUsd, isToggleClicked);

    return (
      <React.Fragment>
        <FormGroup className={styleCoinInput["input-size"]}>
          <div className={styleCoinInput["input-container"]}>
            <div className={styleCoinInput["amount-label"]}>
              <div>Amount</div>
            </div>
            <div className={styleCoinInput["input-wrapper"]}>
              <input
                placeholder={`0.00`}
                className={classnames(
                  "form-control-alternative",
                  styleCoinInput["input"],
                  { [styleCoinInput["input-error"]]: errorText != null }
                )}
                id={`input-${randomId}`}
                type="number"
                value={
                  isToggleClicked === true
                    ? parseDollarAmount(inputInUsd)
                    : parseExponential(
                        amountConfig.amount,
                        amountConfig.sendCurrency.coinDecimals
                      )
                }
                onChange={(e: any) => {
                  e.preventDefault();
                  isToggleClicked === true
                    ? parseDollarAmount(inputInUsd)
                    : amountConfig.setAmount(e.target.value);
                }}
                min={0}
                autoComplete="off"
              />

              <span>
                {isToggleClicked === true
                  ? "USD"
                  : amountConfig.sendCurrency.coinDenom}
              </span>
            </div>
            <div className={styleCoinInput["amount-usd"]}>
              {isToggleClicked === true
                ? `${amountConfig.amount} ${amountConfig.sendCurrency.coinDenom}`
                : inputInUsd}
            </div>
            {errorText != null ? (
              <div className={styleCoinInput["errorText"]}>{errorText}</div>
            ) : null}
          </div>
          <div className={styleCoinInput["right-widgets"]}>
            <button
              style={{ margin: "0px" }}
              className={styleCoinInput["widgetButton"]}
              onClick={isClicked}
              disabled
            >
              <img src={require("@assets/svg/wireframe/chevron.svg")} alt="" />
              Change to USD
            </button>
            {!disableAllBalance ? (
              <button
                style={{ margin: "0px" }}
                className={styleCoinInput["widgetButton"]}
                onClick={(e) => {
                  e.preventDefault();
                  amountConfig.toggleIsMax();
                }}
              >
                Use max available
              </button>
            ) : null}
          </div>
        </FormGroup>
      </React.Fragment>
    );
  }
);

export interface TokenDropdownProps {
  dropdownDisabled?: boolean;
  amountConfig: IAmountConfig;
  overrideSelectableCurrencies?: AppCurrency[];
}
export const TokenSelectorDropdown: React.FC<TokenDropdownProps> = ({
  amountConfig,
  overrideSelectableCurrencies,
}) => {
  const [isOpenTokenSelector, setIsOpenTokenSelector] = useState(false);
  const [inputInUsd, setInputInUsd] = useState<string | undefined>("");

  const { queriesStore, priceStore } = useStore();
  const queryBalances = queriesStore
    .get(amountConfig.chainId)
    .queryBalances.getQueryBech32Address(amountConfig.sender);

  const selectableCurrencies = (
    overrideSelectableCurrencies || amountConfig.sendableCurrencies
  )
    .filter((cur) => {
      const bal = queryBalances.getBalanceFromCurrency(cur);
      return !bal.toDec().isZero();
    })
    .sort((a, b) => {
      return a.coinDenom < b.coinDenom ? -1 : 1;
    });

  const queryBalance = queryBalances.balances.find(
    (bal) =>
      amountConfig.sendCurrency.coinMinimalDenom ===
      bal.currency.coinMinimalDenom
  );
  const balance = queryBalance
    ? queryBalance.balance
    : new CoinPretty(amountConfig.sendCurrency, new Int(0));

  const language = useLanguage();
  const fiatCurrency = language.fiatCurrency;
  const convertToUsd = (currency: any) => {
    const value = priceStore.calculatePrice(currency, fiatCurrency);
    const inUsd = value && value.shrink(true).maxDecimals(6).toString();
    return inUsd;
  };
  useEffect(() => {
    const valueInUsd = convertToUsd(balance);
    setInputInUsd(valueInUsd);
  }, [amountConfig.sendCurrency]);

  const balancesMap = new Map(
    queryBalances.balances.map((bal) => [
      bal.currency.coinMinimalDenom,
      bal.balance,
    ])
  );
  return (
    <React.Fragment>
      <Label style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
        Asset
      </Label>
      <Card
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          padding: "12px 18px",
          marginBottom: "0px",
        }}
        onClick={() => setIsOpenTokenSelector(!isOpenTokenSelector)}
        heading={<div>{amountConfig.sendCurrency.coinDenom}</div>}
        rightContent={require("@assets/svg/wireframe/chevron-down.svg")}
        subheading={
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "12px",
            }}
          >
            {" "}
            {`Available: ${balance.shrink(true).maxDecimals(6).toString()} `}
            {inputInUsd && `(${inputInUsd} USD)`}
          </div>
        }
      />
      <Dropdown
        setIsOpen={setIsOpenTokenSelector}
        isOpen={isOpenTokenSelector}
        title="Asset"
        closeClicked={() => setIsOpenTokenSelector(false)}
      >
        {selectableCurrencies.map((currency) => {
          const currencyBalance =
            balancesMap.get(currency.coinMinimalDenom) ||
            new CoinPretty(currency, new Int(0));

          return (
            <Card
              heading={currency.coinDenom}
              key={currency.coinMinimalDenom}
              isActive={
                currency.coinMinimalDenom ===
                amountConfig.sendCurrency.coinMinimalDenom
              }
              onClick={async (e: any) => {
                e.preventDefault();
                amountConfig.setSendCurrency(currency);
              }}
              rightContent={`${currencyBalance
                .shrink(true)
                .maxDecimals(6)
                .toString()}`}
            />
          );
        })}
      </Dropdown>
    </React.Fragment>
  );
};
