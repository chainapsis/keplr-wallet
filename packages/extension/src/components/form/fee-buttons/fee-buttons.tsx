import React, {
  FunctionComponent,
  MouseEvent,
  useEffect,
  useState,
} from "react";

import styleFeeButtons from "./fee-buttons.module.scss";

import {
  Button,
  ButtonDropdown,
  ButtonGroup,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
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
  IGasSimulator,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@keplr-wallet/hooks";
import { CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { useLanguage } from "../../../languages";
import { FormattedMessage, useIntl } from "react-intl";
import { GasInput } from "../gas-input";
import { action, makeObservable, observable } from "mobx";
import { GasContainer } from "../gas-form";
import styleCoinInput from "../coin-input.module.scss";
import { useStore } from "../../../stores";

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
  gasSimulator?: IGasSimulator;

  showFeeCurrencySelectorUnderSetGas?: boolean;
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
    gasSimulator,
    showFeeCurrencySelectorUnderSetGas,
  }) => {
    // This may be not the good way to handle the states across the components.
    // But, rather than using the context API with boilerplate code, just use the mobx state to simplify the logic.
    const [feeButtonState] = useState(() => new FeeButtonState());

    return (
      <React.Fragment>
        {feeConfig.feeCurrencies.length > 1 &&
        !showFeeCurrencySelectorUnderSetGas ? (
          <FeeCurrencySelector feeConfig={feeConfig} />
        ) : null}
        {feeConfig.feeCurrency ? (
          <FeeButtonsInner
            feeConfig={feeConfig}
            priceStore={priceStore}
            label={label}
            feeSelectLabels={feeSelectLabels}
            feeButtonState={feeButtonState}
            gasSimulator={gasSimulator}
          />
        ) : null}
        {feeButtonState.isGasInputOpen || !feeConfig.feeCurrency ? (
          gasSimulator ? (
            showFeeCurrencySelectorUnderSetGas ? (
              <React.Fragment>
                <FeeCurrencySelector feeConfig={feeConfig} />
                <GasContainer
                  label={gasLabel}
                  gasConfig={gasConfig}
                  gasSimulator={gasSimulator}
                />
              </React.Fragment>
            ) : (
              <GasContainer
                label={gasLabel}
                gasConfig={gasConfig}
                gasSimulator={gasSimulator}
              />
            )
          ) : showFeeCurrencySelectorUnderSetGas ? (
            <React.Fragment>
              <FeeCurrencySelector feeConfig={feeConfig} />
              <GasInput label={gasLabel} gasConfig={gasConfig} />
            </React.Fragment>
          ) : (
            <GasInput label={gasLabel} gasConfig={gasConfig} />
          )
        ) : null}
      </React.Fragment>
    );
  }
);

export const FeeCurrencySelector: FunctionComponent<{
  feeConfig: IFeeConfig;
}> = observer(({ feeConfig }) => {
  const { queriesStore } = useStore();
  const queryBalances = queriesStore
    .get(feeConfig.chainId)
    .queryBalances.getQueryBech32Address(feeConfig.sender);

  const [randomId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Buffer.from(bytes).toString("hex");
  });

  const [isOpenTokenSelector, setIsOpenTokenSelector] = useState(false);

  const firstFeeCurrencyDenom =
    feeConfig.feeCurrencies.length > 0
      ? feeConfig.feeCurrencies[0].coinMinimalDenom
      : "";

  // Show the fee currencies that account has.
  // But, always show the first fee currency to reduce the confusion to user because first fee currency has priority.
  const selectableCurrencies = feeConfig.feeCurrencies.filter((cur) => {
    if (
      firstFeeCurrencyDenom &&
      cur.coinMinimalDenom === firstFeeCurrencyDenom
    ) {
      return true;
    }

    const bal = queryBalances.getBalanceFromCurrency(cur);
    return !bal.toDec().isZero();
  });

  return (
    <FormGroup>
      <Label
        for={`selector-${randomId}`}
        className="form-control-label"
        style={{ width: "100%" }}
      >
        <FormattedMessage id="Fee Token" />
      </Label>
      <ButtonDropdown
        id={`selector-${randomId}`}
        className={styleCoinInput.tokenSelector}
        isOpen={isOpenTokenSelector}
        toggle={() => setIsOpenTokenSelector((value) => !value)}
      >
        <DropdownToggle caret>
          {feeConfig.feeCurrency?.coinDenom || "Unknown"}
        </DropdownToggle>
        <DropdownMenu>
          {selectableCurrencies.map((currency) => {
            return (
              <DropdownItem
                key={currency.coinMinimalDenom}
                active={
                  currency.coinMinimalDenom === feeConfig.feeCurrency?.coinDenom
                }
                onClick={(e) => {
                  e.preventDefault();

                  feeConfig.setAutoFeeCoinMinimalDenom(
                    currency.coinMinimalDenom
                  );
                }}
              >
                {currency.coinDenom}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </ButtonDropdown>
    </FormGroup>
  );
});

export const FeeButtonsInner: FunctionComponent<
  Pick<
    FeeButtonsProps,
    "feeConfig" | "priceStore" | "label" | "feeSelectLabels" | "gasSimulator"
  > & { feeButtonState: FeeButtonState }
> = observer(
  ({
    feeConfig,
    priceStore,
    label,
    feeSelectLabels = { low: "Low", average: "Average", high: "High" },
    feeButtonState,
    gasSimulator,
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
    const lowFeePrice = priceStore.calculatePrice(lowFee, fiatCurrency);

    const averageFee = feeConfig.getFeeTypePretty("average");
    const averageFeePrice = priceStore.calculatePrice(averageFee, fiatCurrency);

    const highFee = feeConfig.getFeeTypePretty("high");
    const highFeePrice = priceStore.calculatePrice(highFee, fiatCurrency);

    let isFeeLoading = false;

    const error = feeConfig.error;
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
            return (
              error.message ||
              intl.formatMessage({ id: "input.fee.error.unknown" })
            );
        }
      }
    })();

    if (gasSimulator && gasSimulator.isSimulating) {
      isFeeLoading = true;
    }

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
                {lowFeePrice.toString()}
              </div>
            ) : null}
            <div
              className={classnames(styleFeeButtons.coin, {
                "text-muted": feeConfig.feeType !== "low",
              })}
            >
              {
                // Hide ibc metadata because there is no space to display the ibc metadata.
                // Generally, user can distinguish the ibc metadata because the ibc metadata should be shown in the fee currency selector.
                lowFee.hideIBCMetadata(true).trim(true).toString()
              }
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
              {averageFee.hideIBCMetadata(true).trim(true).toString()}
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
              {highFee.hideIBCMetadata(true).trim(true).toString()}
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
            {/* XXX: In fact, it is not only set gas, but fee currency can also be set depending on the option. */}
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
