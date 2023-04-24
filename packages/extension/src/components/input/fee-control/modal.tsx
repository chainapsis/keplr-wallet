import React, { FunctionComponent, useState } from "react";
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
import { IFeeConfig, IGasConfig } from "@keplr-wallet/hooks";

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
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
}> = observer(({ feeConfig, gasConfig }) => {
  const [isAuto, setIsAuto] = useState<boolean>(true);

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

          <Columns sum={1} gutter="0.5rem" alignY="center">
            <Subtitle3>Auto</Subtitle3>
            <Toggle isOpen={isAuto} setIsOpen={() => setIsAuto(!isAuto)} />
          </Columns>
        </Columns>

        <TextInput
          label="Gas Amount"
          value={gasConfig.value}
          onChange={(e) => {
            e.preventDefault();

            gasConfig.setValue(e.target.value);
          }}
        />

        <Button text="Confirm" color="secondary" size="large" />
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

    background-color: ${({ selected }) =>
      selected ? ColorPalette["blue-400"] : ColorPalette["gray-500"]}};
  `,
  Title: styled(H5)<{ selected: boolean }>`
    color: ${({ selected }) =>
      selected ? ColorPalette["white"] : ColorPalette["gray-50"]}};
  `,
  Price: styled(Caption2)<{ selected: boolean }>`
    color: ${({ selected }) =>
      selected ? ColorPalette["blue-200"] : ColorPalette["gray-300"]}};
  `,
  Amount: styled(Caption1)<{ selected: boolean }>`
    color: ${({ selected }) =>
      selected ? ColorPalette["blue-100"] : ColorPalette["gray-200"]}};
  `,
};

const FeeSelector: FunctionComponent<{
  feeConfig: IFeeConfig;
}> = observer(({ feeConfig }) => {
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
          <FeeSelectorStyle.Price selected={feeConfig.type === "low"}>
            $TODO
          </FeeSelectorStyle.Price>
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
          <FeeSelectorStyle.Price selected={feeConfig.type === "average"}>
            $TODO
          </FeeSelectorStyle.Price>
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
          <FeeSelectorStyle.Price selected={feeConfig.type === "high"}>
            $TODO
          </FeeSelectorStyle.Price>
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
