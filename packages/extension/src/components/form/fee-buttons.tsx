import React, {
  FunctionComponent,
  MouseEvent,
  useEffect,
  useState,
} from "react";

import styleFeeButtons from "./fee-buttons.module.scss";

import {
  Button,
  ButtonGroup,
  FormFeedback,
  FormGroup,
  Label,
} from "reactstrap";

import classnames from "classnames";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@keplr/hooks";
import { CoinGeckoPriceStore } from "@keplr/stores";
import { useLanguage } from "../../languages";
import { useIntl } from "react-intl";

export interface FeeButtonsProps {
  feeConfig: IFeeConfig;
  priceStore: CoinGeckoPriceStore;

  className?: string;
  label?: string;
  feeSelectLabels?: {
    low: string;
    average: string;
    high: string;
  };
}

export const FeeButtons: FunctionComponent<FeeButtonsProps> = observer(
  ({
    feeConfig,
    priceStore,
    label,
    feeSelectLabels = { low: "Low", average: "Average", high: "High" },
  }) => {
    return (
      <React.Fragment>
        {feeConfig.feeCurrency ? (
          <FeeButtonsInner
            feeConfig={feeConfig}
            priceStore={priceStore}
            label={label}
            feeSelectLabels={feeSelectLabels}
          />
        ) : null}
      </React.Fragment>
    );
  }
);

export const FeeButtonsInner: FunctionComponent<FeeButtonsProps> = observer(
  ({
    feeConfig,
    priceStore,
    label,
    feeSelectLabels = { low: "Low", average: "Average", high: "High" },
  }) => {
    useEffect(() => {
      if (feeConfig.feeCurrency && !feeConfig.fee) {
        feeConfig.setFeeType("average");
      }
    }, [feeConfig, feeConfig.feeCurrency, feeConfig.fee]);

    const intl = useIntl();

    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });

    const language = useLanguage();

    const fiatCurrency = language.fiatCurrency;

    const lowFee = feeConfig.getFeeTypePretty("low");
    const lowFeePrice = priceStore.calculatePrice(fiatCurrency, lowFee);

    const averageFee = feeConfig.getFeeTypePretty("average");
    const averageFeePrice = priceStore.calculatePrice(fiatCurrency, averageFee);

    const highFee = feeConfig.getFeeTypePretty("high");
    const highFeePrice = priceStore.calculatePrice(fiatCurrency, highFee);

    let isFeeLoading = false;

    const error = feeConfig.getError();
    const errorText: string | undefined = (() => {
      if (error) {
        switch (error.constructor) {
          case InsufficientFeeError:
            return intl.formatMessage({
              id: "input.fee.error.insufficient",
            });
          case NotLoadedFeeError:
            isFeeLoading = true;
            return undefined;
          default:
            return intl.formatMessage({ id: "input.fee.error.unknown" });
        }
      }
    })();

    return (
      <FormGroup>
        {label ? (
          <Label for={inputId} className="form-control-label">
            {label}
          </Label>
        ) : null}
        <ButtonGroup id={inputId} className={styleFeeButtons.buttons}>
          <Button
            type="button"
            className={styleFeeButtons.button}
            color={feeConfig.feeType === "low" ? "primary" : undefined}
            onClick={(e: MouseEvent) => {
              feeConfig.setFeeType("low");
              e.preventDefault();
            }}
          >
            <div className={styleFeeButtons.title}>{feeSelectLabels.low}</div>
            {lowFeePrice ? (
              <div
                className={classnames(styleFeeButtons.fiat, {
                  "text-muted": feeConfig.feeType !== "low",
                })}
              >
                {lowFeePrice.toString()}
              </div>
            ) : null}
            <div
              className={classnames(styleFeeButtons.coin, {
                "text-muted": feeConfig.feeType !== "low",
              })}
            >
              {lowFee.trim(true).toString()}
            </div>
          </Button>
          <Button
            type="button"
            className={styleFeeButtons.button}
            color={feeConfig.feeType === "average" ? "primary" : undefined}
            onClick={(e: MouseEvent) => {
              feeConfig.setFeeType("average");
              e.preventDefault();
            }}
          >
            <div className={styleFeeButtons.title}>
              {feeSelectLabels.average}
            </div>
            {averageFeePrice ? (
              <div
                className={classnames(styleFeeButtons.fiat, {
                  "text-muted": feeConfig.feeType !== "average",
                })}
              >
                {averageFeePrice.toString()}
              </div>
            ) : null}
            <div
              className={classnames(styleFeeButtons.coin, {
                "text-muted": feeConfig.feeType !== "average",
              })}
            >
              {feeConfig.getFeeTypePretty("average").trim(true).toString()}
            </div>
          </Button>
          <Button
            type="button"
            className={styleFeeButtons.button}
            color={feeConfig.feeType === "high" ? "primary" : undefined}
            onClick={(e: MouseEvent) => {
              feeConfig.setFeeType("high");
              e.preventDefault();
            }}
          >
            <div className={styleFeeButtons.title}>{feeSelectLabels.high}</div>
            {highFeePrice ? (
              <div
                className={classnames(styleFeeButtons.fiat, {
                  "text-muted": feeConfig.feeType !== "high",
                })}
              >
                {highFeePrice.toString()}
              </div>
            ) : null}
            <div
              className={classnames(styleFeeButtons.coin, {
                "text-muted": feeConfig.feeType !== "high",
              })}
            >
              {feeConfig.getFeeTypePretty("high").trim(true).toString()}
            </div>
          </Button>
        </ButtonGroup>
        {isFeeLoading ? (
          <FormFeedback style={{ display: "block" }}>
            <i className="fa fa-spinner fa-spin fa-fw text-gray" />
          </FormFeedback>
        ) : null}
        {errorText != null ? (
          <FormFeedback style={{ display: "block" }}>{errorText}</FormFeedback>
        ) : null}
      </FormGroup>
    );
  }
);
