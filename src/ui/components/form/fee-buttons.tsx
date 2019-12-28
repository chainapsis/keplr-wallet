import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";

import classnames from "classnames";
import styleFeeButtons from "./fee-buttons.module.scss";
import "./input.module.scss";
import { getColorClass } from "../../popup/styles/type";
import { Currency } from "../../../chain-info";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { CoinUtils } from "../../../common/coin-utils";
import { useFormContext } from "react-hook-form";
import { DecUtils } from "../../../common/dec-utils";

export type GasPriceStep = {
  low: Dec;
  average: Dec;
  high: Dec;
};

export const DefaultGasPriceStep: GasPriceStep = {
  low: new Dec("0.01"),
  average: new Dec("0.025"),
  high: new Dec("0.04")
};

export interface FeeButtonsProps {
  className?: string;
  color?: "primary" | "info" | "success" | "warning" | "danger";
  label?: string;
  error?: string;

  // TODO: handle muliple fees.
  currency: Currency;
  price: Dec;
  gas: number;
  gasPriceStep: GasPriceStep;

  name: string;
}

enum FeeSelect {
  LOW,
  AVERAGE,
  HIGH
}

export const FeeButtons: FunctionComponent<FeeButtonsProps> = ({
  color = "primary",
  label,
  error,
  currency,
  price,
  gas,
  gasPriceStep,
  name
}) => {
  const { setValue } = useFormContext();

  const [feeSelect, setFeeSelect] = useState(FeeSelect.AVERAGE);
  const [feeLow, setFeeLow] = useState<Coin | undefined>();
  const [feeAverage, setFeeAverage] = useState<Coin | undefined>();
  const [feeHigh, setFeeHigh] = useState<Coin | undefined>();

  useEffect(() => {
    if (price.gt(new Dec(0))) {
      let precision = new Dec(1);
      for (let i = 0; i < currency.coinDecimals; i++) {
        precision = precision.mul(new Dec(10));
      }

      const feeLow = new Coin(
        currency.coinMinimalDenom,
        gasPriceStep.low.mul(new Dec(gas.toString())).truncate()
      );
      setFeeLow(feeLow);

      const feeAverage = new Coin(
        currency.coinMinimalDenom,
        gasPriceStep.average.mul(new Dec(gas.toString())).truncate()
      );
      setFeeAverage(feeAverage);

      const feeHigh = new Coin(
        currency.coinMinimalDenom,
        gasPriceStep.high.mul(new Dec(gas.toString())).truncate()
      );
      setFeeHigh(feeHigh);
    } else {
      setFeeLow(undefined);
      setFeeAverage(undefined);
      setFeeHigh(undefined);
    }
  }, [
    currency.coinDecimals,
    currency.coinMinimalDenom,
    gas,
    gasPriceStep.average,
    gasPriceStep.high,
    gasPriceStep.low,
    price
  ]);

  useEffect(() => {
    if (feeSelect === FeeSelect.LOW) {
      setValue(name, feeLow);
    } else if (feeSelect === FeeSelect.AVERAGE) {
      setValue(name, feeAverage);
    } else if (feeSelect === FeeSelect.HIGH) {
      setValue(name, feeHigh);
    } else {
      throw new Error("Invalid fee select");
    }
  }, [feeAverage, feeHigh, feeLow, feeSelect, name, setValue]);

  return (
    <div className="fields">
      {label ? (
        <div className="field for-label">
          <label className="label">{label}</label>
        </div>
      ) : null}

      <div
        className={classnames("buttons", "has-addons", styleFeeButtons.buttons)}
      >
        <button
          className={classnames("button", styleFeeButtons.button, {
            [getColorClass(color)]: feeSelect === FeeSelect.LOW
          })}
          type="button"
          onClick={useCallback(() => {
            setFeeSelect(FeeSelect.LOW);
          }, [])}
        >
          <div className={styleFeeButtons.title}>Low</div>
          <div className={styleFeeButtons.fiat}>
            {price.gt(new Dec(0)) && feeLow
              ? `$${DecUtils.decToStrWithoutTrailingZeros(
                  new Dec(feeLow.amount)
                    .quoTruncate(
                      DecUtils.getPrecisionDec(currency.coinDecimals)
                    )
                    .mul(price)
                )}`
              : "?"}
          </div>
          <div className={styleFeeButtons.coin}>
            {feeLow
              ? `${DecUtils.removeTrailingZerosFromDecStr(
                  CoinUtils.parseDecAndDenomFromCoin(feeLow).amount
                )}${currency.coinDenom}`
              : "loading"}
          </div>
        </button>
        <button
          className={classnames("button", styleFeeButtons.button, {
            [getColorClass(color)]: feeSelect === FeeSelect.AVERAGE
          })}
          type="button"
          onClick={useCallback(() => {
            setFeeSelect(FeeSelect.AVERAGE);
          }, [])}
        >
          <div className={styleFeeButtons.title}>Average</div>
          <div className={styleFeeButtons.fiat}>
            {price.gt(new Dec(0)) && feeAverage
              ? `$${DecUtils.decToStrWithoutTrailingZeros(
                  new Dec(feeAverage.amount)
                    .quoTruncate(
                      DecUtils.getPrecisionDec(currency.coinDecimals)
                    )
                    .mul(price)
                )}`
              : "?"}
          </div>
          <div className={styleFeeButtons.coin}>
            {feeAverage
              ? `${DecUtils.removeTrailingZerosFromDecStr(
                  CoinUtils.parseDecAndDenomFromCoin(feeAverage).amount
                )}${currency.coinDenom}`
              : "loading"}
          </div>
        </button>
        <button
          className={classnames("button", styleFeeButtons.button, {
            [getColorClass(color)]: feeSelect === FeeSelect.HIGH
          })}
          type="button"
          onClick={useCallback(() => {
            setFeeSelect(FeeSelect.HIGH);
          }, [])}
        >
          <div className={styleFeeButtons.title}>High</div>
          <div className={styleFeeButtons.fiat}>
            {price.gt(new Dec(0)) && feeHigh
              ? `$${DecUtils.decToStrWithoutTrailingZeros(
                  new Dec(feeHigh.amount)
                    .quoTruncate(
                      DecUtils.getPrecisionDec(currency.coinDecimals)
                    )
                    .mul(price)
                )}`
              : "?"}
          </div>
          <div className={styleFeeButtons.coin}>
            {feeHigh
              ? `${DecUtils.removeTrailingZerosFromDecStr(
                  CoinUtils.parseDecAndDenomFromCoin(feeHigh).amount
                )}${currency.coinDenom}`
              : "loading"}
          </div>
        </button>
      </div>

      {error ? (
        <div className="field for-label">
          <p className="help is-danger">{error}</p>
        </div>
      ) : null}
    </div>
  );
};
