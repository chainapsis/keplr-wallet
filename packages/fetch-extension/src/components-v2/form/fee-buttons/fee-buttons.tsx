import React, {
  FunctionComponent,
  MouseEvent,
  useEffect,
  useState,
} from "react";

import styleFeeButtons from "./fee-buttons.module.scss";

import { Button, ButtonGroup, FormFeedback, FormGroup } from "reactstrap";

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
import { useIntl } from "react-intl";
import { GasInput } from "../gas-input";
import { action, autorun, makeObservable, observable } from "mobx";
import { GasContainer } from "../gas-form";
import { useStore } from "../../../stores";
import { Card } from "@components-v2/card";
import { FeeCurrencySelector } from "./fee-currency-selector";

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
    const { queriesStore } = useStore();

    // This may be not the good way to handle the states across the components.
    // But, rather than using the context API with boilerplate code, just use the mobx state to simplify the logic.
    const [feeButtonState] = useState(() => new FeeButtonState());

    useEffect(() => {
      // Try to find other fee currency if the account doesn't have enough fee to pay.
      // This logic can be slightly complex, so use mobx's `autorun`.
      // This part fairly different with the approach of react's hook.
      let skip = false;
      // Try until 500ms to avoid the confusion to user.
      const timeoutId = setTimeout(() => {
        skip = true;
      }, 500);

      const disposer = autorun(() => {
        if (
          !skip &&
          !feeConfig.isManual &&
          feeConfig.feeCurrencies.length > 1 &&
          feeConfig.feeCurrency &&
          feeConfig.feeCurrencies[0].coinMinimalDenom ===
            feeConfig.feeCurrency.coinMinimalDenom
        ) {
          const queryBalances = queriesStore
            .get(feeConfig.chainId)
            .queryBalances.getQueryBech32Address(feeConfig.sender);

          // Basically, `FeeConfig` implementation select the first fee currency as default.
          // So, let's put the priority to first fee currency.
          const firstFeeCurrency = feeConfig.feeCurrencies[0];
          const firstFeeCurrencyBal =
            queryBalances.getBalanceFromCurrency(firstFeeCurrency);

          if (feeConfig.feeType) {
            const fee = feeConfig.getFeeTypePrettyForFeeCurrency(
              firstFeeCurrency,
              feeConfig.feeType
            );
            if (firstFeeCurrencyBal.toDec().lt(fee.toDec())) {
              // Not enough balances for fee.
              // Try to find other fee currency to send.
              for (const feeCurrency of feeConfig.feeCurrencies) {
                const feeCurrencyBal =
                  queryBalances.getBalanceFromCurrency(feeCurrency);
                const fee = feeConfig.getFeeTypePrettyForFeeCurrency(
                  feeCurrency,
                  feeConfig.feeType
                );

                if (feeCurrencyBal.toDec().gte(fee.toDec())) {
                  feeConfig.setAutoFeeCoinMinimalDenom(
                    feeCurrency.coinMinimalDenom
                  );
                  skip = true;
                  return;
                }
              }
            }
          }
        }
      });

      return () => {
        clearTimeout(timeoutId);
        disposer();
      };
    }, [feeConfig, queriesStore]);

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
            feeConfig.feeCurrencies.length > 1 &&
            showFeeCurrencySelectorUnderSetGas ? (
              <React.Fragment>
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
          ) : feeConfig.feeCurrencies.length > 1 &&
            showFeeCurrencySelectorUnderSetGas ? (
            <React.Fragment>
              <Card
                style={{ background: "rgba(255, 255, 255, 0.10)" }}
                heading={<FeeCurrencySelector feeConfig={feeConfig} />}
                rightContent={
                  <GasInput label={gasLabel} gasConfig={gasConfig} />
                }
              />
            </React.Fragment>
          ) : (
            <Card
              style={{ background: "rgba(255, 255, 255, 0.10)" }}
              heading={""}
              rightContent={<GasInput label={gasLabel} gasConfig={gasConfig} />}
            />
          )
        ) : null}
      </React.Fragment>
    );
  }
);

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
  }) => {
    useEffect(() => {
      if (feeConfig.feeCurrency && !feeConfig.fee) {
        feeConfig.setFeeType("average");
      }
    }, [feeConfig, feeConfig.feeCurrency, feeConfig.fee]);

    const { chainStore } = useStore();

    const intl = useIntl();
    const isEvm = chainStore.current.features?.includes("evm") ?? false;

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

    const error = feeConfig.error;
    const errorText: string | undefined = (() => {
      if (error) {
        switch (error.constructor) {
          case InsufficientFeeError:
            return intl.formatMessage({
              id: "input.fee.error.insufficient",
            });
          case NotLoadedFeeError:
            return undefined;
          default:
            return (
              error.message ||
              intl.formatMessage({ id: "input.fee.error.unknown" })
            );
        }
      }
    })();

    return (
      <FormGroup>
        <ButtonGroup id={inputId} className={styleFeeButtons["buttons"]}>
          {label ? (
            <div
              style={{
                marginTop: "0px",
                marginBottom: "12px",
                color: "white",
                fontSize: "14px",
              }}
            >
              {label}
            </div>
          ) : null}
          <Card
            onClick={(e: MouseEvent) => {
              feeConfig.setFeeType("low");
              e.preventDefault();
            }}
            style={{
              padding: "18px 16px",
              height: "48px",
            }}
            heading={
              <div>
                {feeSelectLabels.low}
                <span
                  style={{
                    opacity: "0.6",
                    fontWeight: 400,
                    color: "var(--grey-white, #FFF)",
                    fontSize: "12px",
                    marginLeft: "5px",
                  }}
                >
                  {lowFeePrice && lowFeePrice.trim(true).toString()}
                </span>
              </div>
            }
            isActive={feeConfig.feeType === "low"}
            rightContent={
              <div
                style={{ fontSize: "12px", fontWeight: 400, opacity: "0.6" }}
              >
                {lowFee.hideIBCMetadata(true).trim(true).toMetricPrefix(isEvm)}
              </div>
            }
            inActiveBackground={"transparent"}
          />
          <Card
            isActive={feeConfig.feeType === "average"}
            heading={
              <div>
                {feeSelectLabels.average}{" "}
                <span
                  style={{
                    opacity: "0.6",
                    fontWeight: 400,
                    color: "var(--grey-white, #FFF)",
                    fontSize: "12px",
                    marginLeft: "5px",
                  }}
                >
                  {averageFeePrice && averageFeePrice.trim(true).toString()}
                </span>
              </div>
            }
            onClick={(e: MouseEvent) => {
              feeConfig.setFeeType("average");
              e.preventDefault();
            }}
            style={{
              padding: "18px 16px",
              height: "48px",
            }}
            rightContent={
              <div
                style={{ fontSize: "12px", fontWeight: 400, opacity: "0.6" }}
              >
                {averageFee
                  .hideIBCMetadata(true)
                  .trim(true)
                  .toMetricPrefix(isEvm)}
              </div>
            }
            inActiveBackground={"transparent"}
          />
          <Card
            isActive={feeConfig.feeType === "high"}
            heading={
              <div>
                {feeSelectLabels.high}{" "}
                <span
                  style={{
                    opacity: "0.6",
                    fontWeight: 400,
                    color: "var(--grey-white, #FFF)",
                    fontSize: "12px",
                    marginLeft: "5px",
                  }}
                >
                  {highFeePrice && highFeePrice.trim(true).toString()}
                </span>
              </div>
            }
            onClick={(e: MouseEvent) => {
              feeConfig.setFeeType("high");
              e.preventDefault();
            }}
            style={{
              padding: "18px 16px",
              height: "48px",
            }}
            rightContent={
              <div
                style={{ fontSize: "12px", fontWeight: 400, opacity: "0.6" }}
              >
                {highFee.hideIBCMetadata(true).trim(true).toMetricPrefix(isEvm)}
              </div>
            }
            inActiveBackground={"transparent"}
          />
        </ButtonGroup>
        {errorText != null ? (
          <FormFeedback style={{ display: "block", position: "relative" }}>
            {errorText}
          </FormFeedback>
        ) : null}
        <div>
          <Button
            className={styleFeeButtons["advanced-button"]}
            size="sm"
            color="link"
            style={
              feeButtonState.isGasInputOpen
                ? {
                    border: "1px solid var(--Indigo---Fetch, #5F38FB)",
                    background: "rgba(255, 255, 255, 0.15)",
                  }
                : {
                    border: "1px solid rgba(255, 255, 255, 0.40)",
                    backdropFilter: "blur(10px)",
                    background: "transparent",
                  }
            }
            onClick={(e) => {
              e.preventDefault();
              feeButtonState.setIsGasInputOpen(!feeButtonState.isGasInputOpen);
            }}
          >
            {/* XXX: In fact, it is not only set gas, but fee currency can also be set depending on the option. */}
            Advanced settings
          </Button>
        </div>
      </FormGroup>
    );
  }
);
