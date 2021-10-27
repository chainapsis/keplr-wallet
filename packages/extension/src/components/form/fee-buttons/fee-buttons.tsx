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
  FormText,
  Label,
} from "reactstrap";

import classnames from "classnames";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  IGasConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@keplr-wallet/hooks";
import { CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { useLanguage } from "../../../languages";
import { useIntl } from "react-intl";
import { GasInput } from "../gas-input";
import { action, makeObservable, observable } from "mobx";

export interface FeeButtonsProps {
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  priceStore: CoinGeckoPriceStore;

  className?: string;
  label?: string;
  feeSelectLabels?: {
    low: string;
    average: string;
    high: string;
  };

  gasLabel?: string;
}

class FeeButtonState {
  @observable
  protected _isGasInputOpen: boolean = false;

  constructor() {
    makeObservable(this);
  }

  get isGasInputOpen(): boolean {
    return this._isGasInputOpen;
  }

  @action
  setIsGasInputOpen(open: boolean) {
    this._isGasInputOpen = open;
  }
}

export const FeeButtons: FunctionComponent<FeeButtonsProps> = observer(
  ({
    feeConfig,
    gasConfig,
    priceStore,
    label,
    feeSelectLabels = { low: "Low", average: "Average", high: "High" },
    gasLabel,
  }) => {
    // This may be not the good way to handle the states across the components.
    // But, rather than using the context API with boilerplate code, just use the mobx state to simplify the logic.
    const [feeButtonState] = useState(() => new FeeButtonState());

    return (
      <React.Fragment>
        {feeConfig.feeCurrency ? (
          <FeeButtonsInner
            feeConfig={feeConfig}
            priceStore={priceStore}
            label={label}
            feeSelectLabels={feeSelectLabels}
            feeButtonState={feeButtonState}
          />
        ) : null}
        {feeButtonState.isGasInputOpen || !feeConfig.feeCurrency ? (
          <GasInput label={gasLabel} gasConfig={gasConfig} />
        ) : null}
      </React.Fragment>
    );
  }
);

export const FeeButtonsInner: FunctionComponent<
  Pick<
    FeeButtonsProps,
    "feeConfig" | "priceStore" | "label" | "feeSelectLabels"
  > & { feeButtonState: FeeButtonState }
> = observer(
  ({
    feeConfig,
    priceStore,
    label,
    feeSelectLabels = { low: "Low", average: "Average", high: "High" },
    feeButtonState,
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

    // For chains without feeCurrencies, Keplr assumes tx doesn’t need to include information about the fee and the fee button does not have to be rendered.
    // The architecture is designed so that fee button is not rendered if the parental component doesn’t have a feeCurrency.
    // However, because there may be situations where the fee buttons is rendered before the chain information is changed,
    // and the fee button is an observer, and the sequence of rendering the observer may not appear stabilized,
    // so only handling the rendering in the parent component may not be sufficient
    // Therefore, this line double checks to ensure that the fee buttons is not rendered if fee currency doesn’t exist.
    // But because this component uses hooks, using a hook in the line below can cause an error.
    // Note that hooks should be used above this line, and only rendering-related logic should exist below this line.
    if (!feeConfig.feeCurrency) {
      return <React.Fragment />;
    }

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
      <FormGroup style={{ position: "relative" }}>
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
                {lowFeePrice.trim(true).toString()}
              </div>
            ) : null}
            <div
              className={classnames(styleFeeButtons.coin, {
                "text-muted": feeConfig.feeType !== "low",
              })}
            >
              {lowFee.trim(true).toMetricPrefix()}
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
              {feeConfig
                .getFeeTypePretty("average")
                .trim(true)
                .toMetricPrefix()}
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
              {feeConfig.getFeeTypePretty("high").trim(true).toMetricPrefix()}
            </div>
          </Button>
        </ButtonGroup>
        {isFeeLoading ? (
          <FormText>
            <i className="fa fa-spinner fa-spin fa-fw" />
          </FormText>
        ) : null}
        {errorText != null ? (
          <FormFeedback style={{ display: "block" }}>{errorText}</FormFeedback>
        ) : null}
        <div style={{ position: "absolute", right: 0 }}>
          <Button
            size="sm"
            color="link"
            onClick={(e) => {
              e.preventDefault();
              feeButtonState.setIsGasInputOpen(!feeButtonState.isGasInputOpen);
            }}
          >
            {!feeButtonState.isGasInputOpen
              ? intl.formatMessage({
                  id: "input.fee.toggle.set-gas",
                })
              : intl.formatMessage({
                  id: "input.fee.toggle.set-gas.close",
                })}
          </Button>
        </div>
      </FormGroup>
    );
  }
);
