import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ISenderConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../../../stores";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { Body3, Subtitle2, Subtitle3 } from "../../../../components/typography";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { ChainImageFallback } from "../../../../components/image";
import { AppCurrency } from "@keplr-wallet/types";
import { IBCSwapAmountConfig } from "../../../../hooks/ibc-swap";

const Styles = {
  TextInput: styled.input`
    font-weight: 600;
    font-size: 1.25rem;

    width: 100%;

    background: none;
    margin: 0;
    padding: 0;
    border: 0;

    // Remove normalized css properties
    outline: none;

    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    ::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `,
};

export const SwapAssetInfo: FunctionComponent<{
  type: "from" | "to";

  senderConfig: ISenderConfig;
  amountConfig: IBCSwapAmountConfig;
}> = observer(({ type, amountConfig }) => {
  const { chainStore } = useStore();

  const fromChainInfo = chainStore.getChain(amountConfig.chainId);
  const fromCurrency: AppCurrency | undefined = (() => {
    if (amountConfig.amount.length === 0) {
      return;
    }

    return amountConfig.amount[0].currency;
  })();

  const toChainInfo = chainStore.getChain(amountConfig.outChainId);
  const outCurrency: AppCurrency = amountConfig.outCurrency;

  return (
    <Box
      padding="1rem"
      paddingBottom="0.75rem"
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="0.375rem"
    >
      <XAxis alignY="center">
        <Gutter size="0.25rem" />
        <Subtitle3>{type === "from" ? "From" : "To"}</Subtitle3>
        <div
          style={{
            flex: 1,
          }}
        />
      </XAxis>

      <Gutter size="0.75rem" />

      <XAxis alignY="center">
        <Styles.TextInput
          value={
            type === "from"
              ? amountConfig.value
              : amountConfig.outAmount
                  .maxDecimals(6)
                  .trim(true)
                  .shrink(true)
                  .inequalitySymbol(true)
                  .hideDenom(true)
                  .toString()
          }
          type={type === "from" ? "number" : undefined}
          onChange={(e) => {
            e.preventDefault();

            if (type === "from") {
              amountConfig.setValue(e.target.value);
            }
          }}
          autoComplete="off"
          readOnly={type !== "from"}
        />
        <Gutter size="0.5rem" />
        <Box
          paddingLeft="0.62rem"
          paddingRight="0.75rem"
          paddingY="0.5rem"
          borderRadius="99999999px"
          backgroundColor={ColorPalette["gray-500"]}
        >
          <XAxis alignY="center">
            {(() => {
              const currency = type === "from" ? fromCurrency : outCurrency;

              return (
                <React.Fragment>
                  <ChainImageFallback
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                    }}
                    src={currency?.coinImageUrl}
                    alt={currency?.coinDenom || "coinDenom"}
                  />
                  <Gutter size="0.5rem" />
                  <Subtitle2>{currency?.coinDenom || "Unknown"}</Subtitle2>
                </React.Fragment>
              );
            })()}
          </XAxis>
        </Box>
      </XAxis>

      <Gutter size="0.2rem" />

      <XAxis alignY="center">
        <Gutter size="0.25rem" />
        <Body3>TODO</Body3>
        <div
          style={{
            flex: 1,
          }}
        />
        <Body3>{`on ${(() => {
          const chainInfo = type === "from" ? fromChainInfo : toChainInfo;
          const currency = type === "from" ? fromCurrency : outCurrency;

          if (!currency) {
            return "Unknown";
          }

          // XXX: 타입스크립트의 타입 추론이 먼가 이상함 일단 대충 이렇게 하고 패스.
          const appCurrency: AppCurrency = currency as AppCurrency;
          if ("originChainId" in appCurrency && appCurrency.originChainId) {
            return chainStore.getChain(appCurrency.originChainId).chainName;
          }

          return chainInfo.chainName;
        })()}`}</Body3>
        <Gutter size="0.25rem" />
      </XAxis>
    </Box>
  );
});
