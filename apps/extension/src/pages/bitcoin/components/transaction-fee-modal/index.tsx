import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import {
  Caption1,
  Caption2,
  H5,
  Subtitle1,
  Subtitle3,
  Subtitle4,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import styled, { useTheme } from "styled-components";
import { Stack } from "../../../../components/stack";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { GuideBox } from "../../../../components/guide-box";
import { Box } from "../../../../components/box";
import { FormattedMessage, useIntl } from "react-intl";
import { Gutter } from "../../../../components/gutter";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import {
  ISenderConfig,
  IFeeConfig,
  IFeeRateConfig,
  MaximumFeeRateReachedError,
} from "@keplr-wallet/hooks-bitcoin";
import { TextInput } from "../../../../components/input";
import { VerticalResizeTransition } from "../../../../components/transition";

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
  feeRateConfig: IFeeRateConfig;
  disableAutomaticFeeSet?: boolean;
}> = observer(({ close, senderConfig, feeConfig, feeRateConfig }) => {
  const { chainStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const modularChainInfo = chainStore.getModularChain(senderConfig.chainId);
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error("This chain doesn't support bitcoin");
  }

  const [showChangesApplied, setShowChangesApplied] = useState(false);
  const prevFeeRateType = useRef(feeRateConfig.feeRateType);
  const prevFeeRate = useRef(feeRateConfig.feeRate);
  const lastShowChangesAppliedTimeout = useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  useEffect(() => {
    if (
      prevFeeRateType.current !== feeRateConfig.feeRateType ||
      prevFeeRate.current !== feeRateConfig.feeRate
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

    prevFeeRateType.current = feeRateConfig.feeRateType;
    prevFeeRate.current = feeRateConfig.feeRate;
  }, [feeRateConfig.feeRate, feeRateConfig.feeRateType]);

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
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-100"]
              }
            >
              <FormattedMessage id="components.input.fee-control.modal.fee-title" />
            </Subtitle3>
          </Box>

          <FeeSelector feeConfig={feeConfig} feeRateConfig={feeRateConfig} />
        </Stack>

        {feeRateConfig.feeRateType === "manual" ? (
          <React.Fragment>
            <TextInput
              label={intl.formatMessage({
                id: "components.input.fee-control.modal.fee-rate-label",
              })}
              disabled={feeRateConfig.feeRateType !== "manual"}
              value={feeRateConfig.value}
              onKeyDown={(e) => {
                const error = feeRateConfig.uiProperties.error;
                if (error && error instanceof MaximumFeeRateReachedError) {
                  if (e.key !== "Backspace") {
                    e.preventDefault();
                  }
                }
              }}
              onChange={(e) => {
                e.preventDefault();
                feeRateConfig.setValue(e.target.value);
              }}
            />
            <VerticalResizeTransition transitionAlign="top">
              {feeRateConfig.uiProperties.error ? (
                <Box
                  marginTop="1.04rem"
                  borderRadius="0.5rem"
                  alignX="center"
                  alignY="center"
                  paddingY="1.125rem"
                  backgroundColor={
                    theme.mode === "light"
                      ? ColorPalette["orange-50"]
                      : ColorPalette["yellow-800"]
                  }
                >
                  <Subtitle4
                    color={
                      theme.mode === "light"
                        ? ColorPalette["orange-400"]
                        : ColorPalette["yellow-400"]
                    }
                  >
                    {feeRateConfig.uiProperties.error.message}
                  </Subtitle4>
                </Box>
              ) : null}
            </VerticalResizeTransition>
          </React.Fragment>
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
});

const FeeRateSelectorStyle = {
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
  Description: styled(Caption2)<{ selected: boolean }>`
    white-space: nowrap;
    margin-top: 0.25rem;
    color: ${({ selected, theme }) =>
      selected
        ? ColorPalette["blue-200"]
        : theme.mode === "light"
        ? ColorPalette["blue-500"]
        : ColorPalette["gray-300"]};
  `,
  FeeRate: styled(Caption1)<{ selected: boolean }>`
    white-space: nowrap;
    margin-top: 0.25rem;
    color: ${({ selected }) =>
      selected ? ColorPalette["blue-100"] : ColorPalette["gray-200"]};
  `,
};

const FeeSelector: FunctionComponent<{
  feeConfig: IFeeConfig;
  feeRateConfig: IFeeRateConfig;
}> = observer(({ feeConfig, feeRateConfig }) => {
  const { bitcoinQueriesStore } = useStore();
  const theme = useTheme();

  const feeRate = bitcoinQueriesStore.get(feeRateConfig.chainId)
    .queryBitcoinFeeEstimates.fees;

  const feeCurrency = feeConfig.fee?.currency;
  if (!feeCurrency) {
    return null;
  }

  return (
    <Columns sum={3}>
      <Column weight={1}>
        <FeeRateSelectorStyle.Item
          style={{
            borderRadius: "0.5rem 0 0 0.5rem",
            borderRight: `1px solid ${
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-400"]
            }`,
          }}
          onClick={() => {
            feeRateConfig.setFeeRateType("low");
          }}
          selected={feeRateConfig.feeRateType === "low"}
        >
          {/* 텍스트의 길이 등에 의해서 레이아웃이 변하는걸 막기 위해서 가라로 1px의 너비르 가지는 Box로 감싸준다. */}
          <Box width="1px" alignX="center">
            <FeeRateSelectorStyle.Title
              selected={feeRateConfig.feeRateType === "low"}
            >
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.low" />
            </FeeRateSelectorStyle.Title>
            <FeeRateSelectorStyle.FeeRate
              selected={feeRateConfig.feeRateType === "low"}
            >
              {`${feeRate.hourFee.toFixed(3)} sat/vB`}
            </FeeRateSelectorStyle.FeeRate>
            <FeeRateSelectorStyle.Description
              selected={feeRateConfig.feeRateType === "low"}
            >
              1 hour
            </FeeRateSelectorStyle.Description>
          </Box>
        </FeeRateSelectorStyle.Item>
      </Column>

      <Column weight={1}>
        <FeeRateSelectorStyle.Item
          style={{
            borderRight: `1px solid ${
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-400"]
            }`,
          }}
          onClick={() => {
            feeRateConfig.setFeeRateType("average");
          }}
          selected={feeRateConfig.feeRateType === "average"}
        >
          {/* 텍스트의 길이 등에 의해서 레이아웃이 변하는걸 막기 위해서 가라로 1px의 너비르 가지는 Box로 감싸준다. */}
          <Box width="1px" alignX="center">
            <FeeRateSelectorStyle.Title
              selected={feeRateConfig.feeRateType === "average"}
            >
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.average" />
            </FeeRateSelectorStyle.Title>
            <FeeRateSelectorStyle.FeeRate
              selected={feeRateConfig.feeRateType === "average"}
            >
              {`${feeRate.halfHourFee.toFixed(3)} sat/vB`}
            </FeeRateSelectorStyle.FeeRate>
            <FeeRateSelectorStyle.Description
              selected={feeRateConfig.feeRateType === "average"}
            >
              30 mins
            </FeeRateSelectorStyle.Description>
          </Box>
        </FeeRateSelectorStyle.Item>
      </Column>

      <Column weight={1}>
        <FeeRateSelectorStyle.Item
          onClick={() => {
            feeRateConfig.setFeeRateType("high");
          }}
          selected={feeRateConfig.feeRateType === "high"}
        >
          {/* 텍스트의 길이 등에 의해서 레이아웃이 변하는걸 막기 위해서 가라로 1px의 너비르 가지는 Box로 감싸준다. */}
          <Box width="1px" alignX="center">
            <FeeRateSelectorStyle.Title
              selected={feeRateConfig.feeRateType === "high"}
            >
              <FormattedMessage id="components.input.fee-control.modal.fee-selector.high" />
            </FeeRateSelectorStyle.Title>
            <FeeRateSelectorStyle.FeeRate
              selected={feeRateConfig.feeRateType === "high"}
            >
              {`${feeRate.fastestFee.toFixed(3)} sat/vB`}
            </FeeRateSelectorStyle.FeeRate>
            <FeeRateSelectorStyle.Description
              selected={feeRateConfig.feeRateType === "high"}
            >
              10 mins
            </FeeRateSelectorStyle.Description>
          </Box>
        </FeeRateSelectorStyle.Item>
      </Column>
      <Column weight={1}>
        <FeeRateSelectorStyle.Item
          style={{
            borderRadius: "0 0.5rem 0.5rem 0",
            borderLeft: `1px solid ${
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-400"]
            }`,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            feeRateConfig.setFeeRateType("manual");
          }}
          selected={feeRateConfig.feeRateType === "manual"}
        >
          <FeeRateSelectorStyle.Title
            selected={feeRateConfig.feeRateType === "manual"}
          >
            <FormattedMessage id="components.input.fee-control.modal.fee-selector.manual" />
          </FeeRateSelectorStyle.Title>
        </FeeRateSelectorStyle.Item>
      </Column>
    </Columns>
  );
});
