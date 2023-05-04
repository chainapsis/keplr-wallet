import React, { FunctionComponent } from "react";
import { Caption1, Caption2, H5, Subtitle1, Subtitle3 } from "../../typography";
import { ColorPalette } from "../../../styles";
import styled from "styled-components";
import { Stack } from "../../stack";
import { Dropdown } from "../../dropdown";
import { Column, Columns } from "../../column";
import { Toggle } from "../../toggle";
import { TextInput } from "..";
import { Button } from "../../button";
import { observer } from "mobx-react-lite";
import { IFeeConfig, IGasConfig, IGasSimulator } from "@keplr-wallet/hooks";
import { useStore } from "../../../stores";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem;
    gap: 0.75rem;

    background-color: ${ColorPalette["gray-600"]};
  `,
  Divider: styled.div`
    border: 1px solid ${ColorPalette["gray-500"]};
  `,
};

export const TransactionFeeModal: FunctionComponent<{
  close: () => void;

  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;
}> = observer(({ close, feeConfig, gasConfig, gasSimulator }) => {
  return (
    <Styles.Container>
      <Subtitle1 style={{ marginBottom: "1.5rem" }}>Fee Set</Subtitle1>

      <Stack gutter="0.75rem">
        <Stack gutter="0.375rem">
          <Subtitle3>Fee</Subtitle3>
          <FeeSelector feeConfig={feeConfig} />
        </Stack>

        <Stack gutter="0.375rem">
          <Subtitle3>Fee Token</Subtitle3>
          <Dropdown
            items={feeConfig.selectableFeeCurrencies.map((cur) => {
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
                }
              }
            }}
            size="large"
          />
        </Stack>

        <Styles.Divider />

        <Columns sum={1} alignY="center">
          <Subtitle3 style={{ color: ColorPalette["gray-200"] }}>Gas</Subtitle3>

          <Column weight={1} />

          {gasSimulator ? (
            <Columns sum={1} gutter="0.5rem" alignY="center">
              <Subtitle3>Auto</Subtitle3>
              <Toggle
                isOpen={gasSimulator.enabled}
                setIsOpen={(isOpen) => {
                  gasSimulator?.setEnabled(isOpen);
                }}
              />
            </Columns>
          ) : null}
        </Columns>

        {gasSimulator?.enabled ? (
          <React.Fragment>
            <Columns sum={2}>
              <Column weight={1}>
                <TextInput
                  label="Gas Adjustment"
                  value={gasSimulator.gasAdjustmentValue}
                  onChange={(e) => {
                    e.preventDefault();

                    gasSimulator?.setGasAdjustmentValue(e.target.value);
                  }}
                />
              </Column>
              <Column weight={1}>
                <TextInput
                  label="Estimated"
                  value={gasSimulator.gasEstimated || "-"}
                  readOnly={true}
                />
              </Column>
            </Columns>
            <TextInput
              label="Gas Amount"
              value={gasConfig.value}
              readOnly={true}
            />
          </React.Fragment>
        ) : (
          <TextInput
            label="Gas Amount"
            value={gasConfig.value}
            onChange={(e) => {
              e.preventDefault();

              gasConfig.setValue(e.target.value);
            }}
          />
        )}

        <Button
          type="button"
          text="Confirm"
          color="secondary"
          size="large"
          onClick={() => {
            close();
          }}
        />
      </Stack>
    </Styles.Container>
  );
});

const FeeSelectorStyle = {
  Item: styled.div<{ selected: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem;

    gap: 0.125rem;

    cursor: pointer;

    background-color: ${({ selected }) =>
      selected ? ColorPalette["blue-400"] : ColorPalette["gray-500"]};
  `,
  Title: styled(H5)<{ selected: boolean }>`
    color: ${({ selected }) =>
      selected ? ColorPalette["white"] : ColorPalette["gray-50"]};
  `,
  Price: styled(Caption2)<{ selected: boolean }>`
    white-space: nowrap;
    margin-top: 2px;
    color: ${({ selected }) =>
      selected ? ColorPalette["blue-200"] : ColorPalette["gray-300"]};
  `,
  Amount: styled(Caption1)<{ selected: boolean }>`
    white-space: nowrap;
    margin-top: 2px;
    color: ${({ selected }) =>
      selected ? ColorPalette["blue-100"] : ColorPalette["gray-200"]};
  `,
};

const FeeSelector: FunctionComponent<{
  feeConfig: IFeeConfig;
}> = observer(({ feeConfig }) => {
  const { priceStore } = useStore();

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
            borderRight: `1px solid ${ColorPalette["gray-400"]}`,
          }}
          onClick={() => {
            feeConfig.setFee({
              type: "low",
              currency: feeCurrency,
            });
          }}
          selected={feeConfig.type === "low"}
        >
          <FeeSelectorStyle.Title selected={feeConfig.type === "low"}>
            Low
          </FeeSelectorStyle.Title>
          {feeCurrency.coinGeckoId ? (
            <FeeSelectorStyle.Price selected={feeConfig.type === "low"}>
              {priceStore
                .calculatePrice(
                  feeConfig.getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
                )
                ?.toString() || "-"}
            </FeeSelectorStyle.Price>
          ) : null}
          <FeeSelectorStyle.Amount selected={feeConfig.type === "low"}>
            {feeConfig
              .getFeeTypePrettyForFeeCurrency(feeCurrency, "low")
              .maxDecimals(6)
              .inequalitySymbol(true)
              .trim(true)
              .toString()}
          </FeeSelectorStyle.Amount>
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
          <FeeSelectorStyle.Title selected={feeConfig.type === "average"}>
            Average
          </FeeSelectorStyle.Title>
          {feeCurrency.coinGeckoId ? (
            <FeeSelectorStyle.Price selected={feeConfig.type === "average"}>
              {priceStore
                .calculatePrice(
                  feeConfig.getFeeTypePrettyForFeeCurrency(
                    feeCurrency,
                    "average"
                  )
                )
                ?.toString() || "-"}
            </FeeSelectorStyle.Price>
          ) : null}
          <FeeSelectorStyle.Amount selected={feeConfig.type === "average"}>
            {feeConfig
              .getFeeTypePrettyForFeeCurrency(feeCurrency, "average")
              .maxDecimals(6)
              .inequalitySymbol(true)
              .trim(true)
              .toString()}
          </FeeSelectorStyle.Amount>
        </FeeSelectorStyle.Item>
      </Column>

      <Column weight={1}>
        <FeeSelectorStyle.Item
          style={{
            borderRadius: "0 0.5rem 0.5rem 0",
            borderLeft: `1px solid ${ColorPalette["gray-400"]}`,
          }}
          onClick={() => {
            feeConfig.setFee({
              type: "high",
              currency: feeCurrency,
            });
          }}
          selected={feeConfig.type === "high"}
        >
          <FeeSelectorStyle.Title selected={feeConfig.type === "high"}>
            High
          </FeeSelectorStyle.Title>
          {feeCurrency.coinGeckoId ? (
            <FeeSelectorStyle.Price selected={feeConfig.type === "high"}>
              {priceStore
                .calculatePrice(
                  feeConfig.getFeeTypePrettyForFeeCurrency(feeCurrency, "high")
                )
                ?.toString() || "-"}
            </FeeSelectorStyle.Price>
          ) : null}
          <FeeSelectorStyle.Amount selected={feeConfig.type === "high"}>
            {feeConfig
              .getFeeTypePrettyForFeeCurrency(feeCurrency, "high")
              .maxDecimals(6)
              .inequalitySymbol(true)
              .trim(true)
              .toString()}
          </FeeSelectorStyle.Amount>
        </FeeSelectorStyle.Item>
      </Column>
    </Columns>
  );
});
