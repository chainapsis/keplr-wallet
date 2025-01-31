import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import {
  Body3,
  Caption1,
  Caption2,
  H5,
  Subtitle1,
  Subtitle3,
} from "../../typography";
import { ColorPalette } from "../../../styles";
import styled, { useTheme } from "styled-components";
import { Stack } from "../../stack";
import { Dropdown } from "../../dropdown";
import { Column, Columns } from "../../column";
import { Toggle } from "../../toggle";
import { TextInput } from "..";
import { Button } from "../../button";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  ISenderConfig,
} from "@keplr-wallet/hooks";
import { useStore } from "../../../stores";
import { GuideBox } from "../../guide-box";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { Box } from "../../box";
import { FormattedMessage, useIntl } from "react-intl";
import { XAxis } from "../../axis";
import { Gutter } from "../../gutter";
import { VerticalCollapseTransition } from "../../transition/vertical-collapse";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 0.75rem;
    padding-top: 0.88rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  `,
};

export const TransactionFeeModal: FunctionComponent<{
  close: () => void;

  senderConfig: ISenderConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;
  disableAutomaticFeeSet?: boolean;
  isForEVMTx?: boolean;
}> = observer(
  ({
    close,
    senderConfig,
    feeConfig,
    gasConfig,
    gasSimulator,
    disableAutomaticFeeSet,
    isForEVMTx,
  }) => {
    const { queriesStore, uiConfigStore, priceStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();

    const isGasSimulatorUsable = (() => {
      if (!gasSimulator) {
        return false;
      }

      if (
        gasSimulator.gasEstimated == null &&
        gasSimulator.uiProperties.error
      ) {
        return false;
      }

      return true;
    })();
    const isGasSimulatorEnabled = (() => {
      if (!isGasSimulatorUsable) {
        return false;
      }
      return gasSimulator?.enabled;
    })();

    useEffect(() => {
      if (uiConfigStore.rememberLastFeeOption) {
        if (feeConfig.type !== "manual") {
          uiConfigStore.setLastFeeOption(feeConfig.type);
        }
      } else {
        uiConfigStore.setLastFeeOption(false);
      }
    }, [feeConfig.type, uiConfigStore, uiConfigStore.rememberLastFeeOption]);

    const [showChangesApplied, setShowChangesApplied] = useState(false);
    const feeConfigCurrencyString = feeConfig
      .toStdFee()
      .amount.map((x) => x.denom)
      .join(",");
    const prevFeeConfigType = useRef(feeConfig.type);
    const prevFeeConfigCurrency = useRef(feeConfigCurrencyString);
    const prevGasConfigGas = useRef(gasConfig.gas);
    const prevGasSimulatorEnabled = useRef(isGasSimulatorEnabled);
    const lastShowChangesAppliedTimeout = useRef<NodeJS.Timeout | undefined>(
      undefined
    );
    useEffect(() => {
      if (
        prevFeeConfigType.current !== feeConfig.type ||
        prevFeeConfigCurrency.current !== feeConfigCurrencyString ||
        prevGasConfigGas.current !== gasConfig.gas ||
        prevGasSimulatorEnabled.current !== isGasSimulatorEnabled
      ) {
        if (lastShowChangesAppliedTimeout.current) {
          clearTimeout(lastShowChangesAppliedTimeout.current);
          lastShowChangesAppliedTimeout.current = undefined;
        }
        setShowChangesApplied(true);
        lastShowChangesAppliedTimeout.current = setTimeout(() => {
          setShowChangesApplied(false);
          lastShowChangesAppliedTimeout.current = undefined;
        }, 2500);
      }

      prevFeeConfigType.current = feeConfig.type;
      prevFeeConfigCurrency.current = feeConfigCurrencyString;
      prevGasConfigGas.current = gasConfig.gas;
      prevGasSimulatorEnabled.current = isGasSimulatorEnabled;
    }, [
      feeConfig.type,
      feeConfigCurrencyString,
      gasConfig.gas,
      isGasSimulatorEnabled,
    ]);

    const isShowingMaxFee = isForEVMTx;
    const isFeeSetByUser = isForEVMTx && feeConfig.type !== "manual";
    const isShowingFeeWithGasEstimated =
      !!isGasSimulatorEnabled && !!gasSimulator?.gasEstimated && isFeeSetByUser;

    return (
      <Styles.Container>
        <Box marginBottom="1.25rem" marginLeft="0.5rem" paddingY="0.4rem">
          <Subtitle1>
            <FormattedMessage id="components.input.fee-control.modal.title" />
          </Subtitle1>
        </Box>

        <Stack gutter="0.75rem">
          <Stack gutter="0.375rem">
            <Box marginLeft="0.5rem">
              <XAxis alignY="center">
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-400"]
                      : ColorPalette["gray-100"]
                  }
                >
                  <FormattedMessage id="components.input.fee-control.modal.fee-title" />
                </Subtitle3>

                <div style={{ flex: 1 }} />
                {!disableAutomaticFeeSet ? (
                  <React.Fragment>
                    <div
                      style={{
                        width: "0.375rem",
                        height: "0.375rem",
                        borderRadius: "99999px",
                        backgroundColor:
                          theme.mode === "light"
                            ? ColorPalette["blue-400"]
                            : ColorPalette["blue-400"],
                        marginRight: "0.3rem",
                      }}
                    />
                    <Body3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-300"]
                          : ColorPalette["gray-200"]
                      }
                    >
                      <FormattedMessage id="components.input.fee-control.modal.remember-last-fee-option" />
                    </Body3>
                    <Gutter size="0.5rem" />
                    <Toggle
                      isOpen={uiConfigStore.rememberLastFeeOption}
                      setIsOpen={(v) =>
                        uiConfigStore.setRememberLastFeeOption(v)
                      }
                    />
                  </React.Fragment>
                ) : null}
              </XAxis>
            </Box>

            <FeeSelector
              feeConfig={feeConfig}
              gasConfig={gasConfig}
              gasSimulator={gasSimulator}
              isShowingFeeWithGasEstimated={isShowingFeeWithGasEstimated}
            />
          </Stack>

          {isShowingMaxFee && (
            <React.Fragment>
              <Gutter size="0.5rem" />
              <XAxis>
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-400"]
                      : ColorPalette["gray-100"]
                  }
                >
                  <b>
                    <FormattedMessage id="components.input.fee-control.modal.max-fee" />
                  </b>
                  {`: ${feeConfig.fees[0]
                    .sub(
                      isFeeSetByUser
                        ? new Dec(feeConfig.l1DataFee?.toString() || "0")
                        : new Dec(0)
                    )
                    .maxDecimals(6)
                    .inequalitySymbol(true)
                    .trim(true)
                    .shrink(true)
                    .hideIBCMetadata(true)
                    .toString()}`}
                </Body3>
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-300"]
                  }
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {` ${(() => {
                    let total: PricePretty | undefined;
                    let hasUnknown = false;
                    const maxFee = feeConfig.fees[0].sub(
                      isFeeSetByUser
                        ? new Dec(feeConfig.l1DataFee?.toString() || "0")
                        : new Dec(0)
                    );
                    if (!maxFee.currency.coinGeckoId) {
                      hasUnknown = true;
                    } else {
                      const price = priceStore.calculatePrice(maxFee);
                      if (price) {
                        if (!total) {
                          total = price;
                        } else {
                          total = total.add(price);
                        }
                      }
                    }

                    if (hasUnknown || !total) {
                      return "";
                    }
                    return `(${total.toString()})`;
                  })()}`}
                </Body3>
              </XAxis>
              <Gutter size="1rem" />
            </React.Fragment>
          )}

          <Dropdown
            label={intl.formatMessage({
              id: "components.input.fee-control.modal.fee-token-dropdown-label",
            })}
            menuContainerMaxHeight="10rem"
            items={feeConfig.selectableFeeCurrencies
              .filter((cur, i) => {
                if (i === 0) {
                  return true;
                }

                const balance = queriesStore
                  .get(feeConfig.chainId)
                  .queryBalances.getQueryBech32Address(senderConfig.sender)
                  .getBalanceFromCurrency(cur);

                return balance.toDec().gt(new Dec(0));
              })
              .map((cur) => {
                return {
                  key: cur.coinMinimalDenom,
                  label: cur.coinDenom,
                };
              })}
            selectedItemKey={feeConfig.fees[0]?.currency.coinMinimalDenom}
            onSelect={(key) => {
              const currency = feeConfig.selectableFeeCurrencies.find(
                (cur) => cur.coinMinimalDenom === key
              );
              if (currency) {
                if (feeConfig.type !== "manual") {
                  feeConfig.setFee({
                    type: feeConfig.type,
                    currency: currency,
                  });
                } else {
                  feeConfig.setFee({
                    type: "average",
                    currency: currency,
                  });
                }
              }
            }}
            size="large"
          />

          {(() => {
            if (gasSimulator) {
              if (gasSimulator.uiProperties.error) {
                return (
                  <GuideBox
                    color="danger"
                    title={intl.formatMessage({
                      id: "components.input.fee-control.modal.guide-title",
                    })}
                    paragraph={
                      gasSimulator.uiProperties.error.message ||
                      gasSimulator.uiProperties.error.toString()
                    }
                  />
                );
              }

              if (gasSimulator.uiProperties.warning) {
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: "components.input.fee-control.modal.guide-title",
                    })}
                    paragraph={
                      gasSimulator.uiProperties.warning.message ||
                      gasSimulator.uiProperties.warning.toString()
                    }
                  />
                );
              }
            }
          })()}

          {isGasSimulatorEnabled ? (
            <TextInput
              label={intl.formatMessage({
                id: "components.input.fee-control.modal.gas-adjustment-label",
              })}
              value={gasSimulator?.gasAdjustmentValue}
              onChange={(e) => {
                e.preventDefault();

                gasSimulator?.setGasAdjustmentValue(e.target.value);
              }}
              rightLabel={
                isGasSimulatorUsable && gasSimulator ? (
                  <Box marginBottom="0.375rem">
                    <XAxis alignY="center">
                      <Subtitle3 color={ColorPalette["gray-200"]}>
                        <FormattedMessage id="components.input.fee-control.modal.auto-title" />
                      </Subtitle3>
                      <Gutter size="0.5rem" />
                      <Toggle
                        isOpen={gasSimulator.enabled}
                        setIsOpen={(isOpen) => {
                          gasSimulator?.setEnabled(isOpen);
                        }}
                      />
                    </XAxis>
                  </Box>
                ) : null
              }
            />
          ) : (
            <TextInput
              label={intl.formatMessage({
                id: "components.input.fee-control.modal.gas-amount-label",
              })}
              value={gasConfig.value}
              onChange={(e) => {
                e.preventDefault();

                gasConfig.setValue(e.target.value);
              }}
              rightLabel={
                isGasSimulatorUsable && gasSimulator ? (
                  <Box marginBottom="0.375rem">
                    <XAxis alignY="center">
                      <Subtitle3 color={ColorPalette["gray-200"]}>
                        <FormattedMessage id="components.input.fee-control.modal.auto-title" />
                      </Subtitle3>
                      <Gutter size="0.5rem" />
                      <Toggle
                        isOpen={gasSimulator.enabled}
                        setIsOpen={(isOpen) => {
                          gasSimulator?.setEnabled(isOpen);
                        }}
                      />
                    </XAxis>
                  </Box>
                ) : null
              }
            />
          )}

          {disableAutomaticFeeSet ? (
            <GuideBox
              title={intl.formatMessage({
                id: "components.input.fee-control.modal.guide.external-fee-set",
              })}
              backgroundColor={
                theme.mode === "light" ? undefined : ColorPalette["gray-500"]
              }
            />
          ) : null}

          <VerticalCollapseTransition collapsed={!showChangesApplied}>
            <GuideBox
              color="safe"
              title={intl.formatMessage({
                id: "components.input.fee-control.modal.notification.changes-applied",
              })}
            />
            <Gutter size="0.75rem" />
          </VerticalCollapseTransition>
          <Gutter size="0" />

          <Button
            type="button"
            text={intl.formatMessage({
              id: "button.close",
            })}
            color="secondary"
            size="large"
            onClick={() => {
              close();
            }}
          />
        </Stack>
      </Styles.Container>
    );
  }
);

const FeeSelectorStyle = {
  Item: styled.div<{ selected: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem;

    cursor: pointer;

    background-color: ${({ selected, theme }) =>
      selected
        ? ColorPalette["blue-400"]
        : theme.mode === "light"
        ? ColorPalette["blue-50"]
        : ColorPalette["gray-500"]};
  `,
  Title: styled(H5)<{ selected: boolean }>`
    color: ${({ selected, theme }) =>
      selected
        ? theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-50"]
        : theme.mode === "light"
        ? ColorPalette["blue-400"]
        : ColorPalette["gray-50"]};
  `,
  Price: styled(Caption2)<{ selected: boolean }>`
    white-space: nowrap;
    margin-top: 0.25rem;
    color: ${({ selected, theme }) =>
      selected
        ? ColorPalette["blue-200"]
        : theme.mode === "light"
        ? ColorPalette["blue-500"]
        : ColorPalette["gray-300"]};
  `,
  Amount: styled(Caption1)<{ selected: boolean }>`
    white-space: nowrap;
    margin-top: 0.25rem;
    color: ${({ selected }) =>
      selected ? ColorPalette["blue-100"] : ColorPalette["gray-200"]};
  `,
};

const FeeSelector: FunctionComponent<{
  feeConfig: IFeeConfig;
  gasConfig?: IGasConfig;
  gasSimulator?: IGasSimulator;
  isShowingFeeWithGasEstimated?: boolean;
}> = observer(
  ({ feeConfig, gasConfig, gasSimulator, isShowingFeeWithGasEstimated }) => {
    const { priceStore } = useStore();
    const theme = useTheme();

    const feeCurrency =
      feeConfig.fees.length > 0
        ? feeConfig.fees[0].currency
        : feeConfig.selectableFeeCurrencies[0];

    if (!feeCurrency) {
      return null;
    }

    return (
      <Columns sum={3}>
        <Column weight={1}>
          <FeeSelectorStyle.Item
            style={{
              borderRadius: "0.5rem 0 0 0.5rem",
              borderRight: `1px solid ${
                theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-400"]
              }`,
            }}
            onClick={() => {
              feeConfig.setFee({
                type: "low",
                currency: feeCurrency,
              });
            }}
            selected={feeConfig.type === "low"}
          >
            {/* 텍스트의 길이 등에 의해서 레이아웃이 변하는걸 막기 위해서 가라로 1px의 너비르 가지는 Box로 감싸준다. */}
            <Box width="1px" alignX="center">
              <FeeSelectorStyle.Title selected={feeConfig.type === "low"}>
                <FormattedMessage id="components.input.fee-control.modal.fee-selector.low" />
              </FeeSelectorStyle.Title>
              {feeCurrency.coinGeckoId ? (
                <FeeSelectorStyle.Price selected={feeConfig.type === "low"}>
                  {priceStore
                    .calculatePrice(
                      feeConfig
                        .getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
                        .sub(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                        .quo(
                          new Dec(
                            isShowingFeeWithGasEstimated
                              ? gasConfig?.gas || 1
                              : 1
                          )
                        )
                        .mul(
                          new Dec(
                            isShowingFeeWithGasEstimated
                              ? gasSimulator?.gasAdjustment || 1
                              : 1
                          )
                        )
                        .mul(
                          new Dec(
                            isShowingFeeWithGasEstimated
                              ? gasSimulator?.gasEstimated || 1
                              : 1
                          )
                        )
                        .add(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                    )
                    ?.toString() || "-"}
                </FeeSelectorStyle.Price>
              ) : null}
              <FeeSelectorStyle.Amount selected={feeConfig.type === "low"}>
                {feeConfig
                  .getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
                  .sub(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                  .quo(
                    new Dec(
                      isShowingFeeWithGasEstimated ? gasConfig?.gas || 1 : 1
                    )
                  )
                  .mul(
                    new Dec(
                      isShowingFeeWithGasEstimated
                        ? gasSimulator?.gasAdjustment || 1
                        : 1
                    )
                  )
                  .mul(
                    new Dec(
                      isShowingFeeWithGasEstimated
                        ? gasSimulator?.gasEstimated || 1
                        : 1
                    )
                  )
                  .add(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                  .maxDecimals(6)
                  .inequalitySymbol(true)
                  .trim(true)
                  .shrink(true)
                  .hideIBCMetadata(true)
                  .toString()}
              </FeeSelectorStyle.Amount>
            </Box>
          </FeeSelectorStyle.Item>
        </Column>

        <Column weight={1}>
          <FeeSelectorStyle.Item
            onClick={() => {
              feeConfig.setFee({
                type: "average",
                currency: feeCurrency,
              });
            }}
            selected={feeConfig.type === "average"}
          >
            {/* 텍스트의 길이 등에 의해서 레이아웃이 변하는걸 막기 위해서 가라로 1px의 너비르 가지는 Box로 감싸준다. */}
            <Box width="1px" alignX="center">
              <FeeSelectorStyle.Title selected={feeConfig.type === "average"}>
                <FormattedMessage id="components.input.fee-control.modal.fee-selector.average" />
              </FeeSelectorStyle.Title>
              {feeCurrency.coinGeckoId ? (
                <FeeSelectorStyle.Price selected={feeConfig.type === "average"}>
                  {priceStore
                    .calculatePrice(
                      feeConfig
                        .getFeeTypePrettyForFeeCurrency(feeCurrency, "average")
                        .sub(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                        .quo(
                          new Dec(
                            isShowingFeeWithGasEstimated
                              ? gasConfig?.gas || 1
                              : 1
                          )
                        )
                        .mul(
                          new Dec(
                            isShowingFeeWithGasEstimated
                              ? gasSimulator?.gasAdjustment || 1
                              : 1
                          )
                        )
                        .mul(
                          new Dec(
                            isShowingFeeWithGasEstimated
                              ? gasSimulator?.gasEstimated || 1
                              : 1
                          )
                        )
                        .add(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                    )
                    ?.toString() || "-"}
                </FeeSelectorStyle.Price>
              ) : null}
              <FeeSelectorStyle.Amount selected={feeConfig.type === "average"}>
                {feeConfig
                  .getFeeTypePrettyForFeeCurrency(feeCurrency, "average")
                  .sub(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                  .quo(
                    new Dec(
                      isShowingFeeWithGasEstimated ? gasConfig?.gas || 1 : 1
                    )
                  )
                  .mul(
                    new Dec(
                      isShowingFeeWithGasEstimated
                        ? gasSimulator?.gasAdjustment || 1
                        : 1
                    )
                  )
                  .mul(
                    new Dec(
                      isShowingFeeWithGasEstimated
                        ? gasSimulator?.gasEstimated || 1
                        : 1
                    )
                  )
                  .add(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                  .maxDecimals(6)
                  .inequalitySymbol(true)
                  .trim(true)
                  .shrink(true)
                  .hideIBCMetadata(true)
                  .toString()}
              </FeeSelectorStyle.Amount>
            </Box>
          </FeeSelectorStyle.Item>
        </Column>

        <Column weight={1}>
          <FeeSelectorStyle.Item
            style={{
              borderRadius: "0 0.5rem 0.5rem 0",
              borderLeft: `1px solid ${
                theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-400"]
              }`,
            }}
            onClick={() => {
              feeConfig.setFee({
                type: "high",
                currency: feeCurrency,
              });
            }}
            selected={feeConfig.type === "high"}
          >
            {/* 텍스트의 길이 등에 의해서 레이아웃이 변하는걸 막기 위해서 가라로 1px의 너비르 가지는 Box로 감싸준다. */}
            <Box width="1px" alignX="center">
              <FeeSelectorStyle.Title selected={feeConfig.type === "high"}>
                <FormattedMessage id="components.input.fee-control.modal.fee-selector.high" />
              </FeeSelectorStyle.Title>
              {feeCurrency.coinGeckoId ? (
                <FeeSelectorStyle.Price selected={feeConfig.type === "high"}>
                  {priceStore
                    .calculatePrice(
                      feeConfig
                        .getFeeTypePrettyForFeeCurrency(feeCurrency, "high")
                        .sub(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                        .quo(
                          new Dec(
                            isShowingFeeWithGasEstimated
                              ? gasConfig?.gas || 1
                              : 1
                          )
                        )
                        .mul(
                          new Dec(
                            isShowingFeeWithGasEstimated
                              ? gasSimulator?.gasAdjustment || 1
                              : 1
                          )
                        )
                        .mul(
                          new Dec(
                            isShowingFeeWithGasEstimated
                              ? gasSimulator?.gasEstimated || 1
                              : 1
                          )
                        )
                        .add(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                    )
                    ?.toString() || "-"}
                </FeeSelectorStyle.Price>
              ) : null}
              <FeeSelectorStyle.Amount selected={feeConfig.type === "high"}>
                {feeConfig
                  .getFeeTypePrettyForFeeCurrency(feeCurrency, "high")
                  .sub(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                  .quo(
                    new Dec(
                      isShowingFeeWithGasEstimated ? gasConfig?.gas || 1 : 1
                    )
                  )
                  .mul(
                    new Dec(
                      isShowingFeeWithGasEstimated
                        ? gasSimulator?.gasAdjustment || 1
                        : 1
                    )
                  )
                  .mul(
                    new Dec(
                      isShowingFeeWithGasEstimated
                        ? gasSimulator?.gasEstimated || 1
                        : 1
                    )
                  )
                  .add(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                  .maxDecimals(6)
                  .inequalitySymbol(true)
                  .trim(true)
                  .shrink(true)
                  .hideIBCMetadata(true)
                  .toString()}
              </FeeSelectorStyle.Amount>
            </Box>
          </FeeSelectorStyle.Item>
        </Column>
      </Columns>
    );
  }
);
