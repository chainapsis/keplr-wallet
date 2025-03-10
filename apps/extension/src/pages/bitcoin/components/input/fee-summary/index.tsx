import React, { FunctionComponent } from "react";
import { IFeeConfig, InsufficientFeeError } from "@keplr-wallet/hooks-bitcoin";
import { observer } from "mobx-react-lite";
import { useTheme } from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";
import { useStore } from "../../../../../stores";
import { Box } from "../../../../../components/box";
import { ColorPalette } from "../../../../../styles";
import { XAxis } from "../../../../../components/axis";
import { Subtitle3, Subtitle4 } from "../../../../../components/typography";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { VerticalResizeTransition } from "../../../../../components/transition";
import { Gutter } from "../../../../../components/gutter";

export const FeeSummary: FunctionComponent<{
  feeConfig: IFeeConfig;
  isValidating: boolean;
}> = observer(({ feeConfig, isValidating }) => {
  const { priceStore, chainStore } = useStore();

  const intl = useIntl();

  const theme = useTheme();

  const modularChainInfo = chainStore.getModularChain(feeConfig.chainId);
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error("This chain doesn't support bitcoin");
  }

  const fee = (() => {
    if (!feeConfig.fee) {
      return new CoinPretty(modularChainInfo.bitcoin.currencies[0], new Dec(0));
    }

    return feeConfig.fee;
  })();
  const price = priceStore.calculatePrice(fee);

  return (
    <Box>
      <Box
        padding="1rem"
        borderRadius="0.375rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"]
        }
        // light theme에서 box shadow가 있어도 sign page가 overflow: auto라서 box shadow가 보이지 않는다.
        // 그렇다고 sign page에 overflow: visible을 주면 다른 부분에서 더 큰 문제가 생기기 때문에
        // light theme에서는 일단 margin bottom을 준다.
        marginBottom={theme.mode === "light" ? "4px" : undefined}
        style={{
          boxShadow:
            theme.mode === "light"
              ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
              : undefined,
        }}
      >
        <XAxis alignY="center">
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["gray-200"]
            }
          >
            <FormattedMessage id="page.sign.components.fee-summary.fee" />
          </Subtitle3>

          <div style={{ flex: 1 }} />

          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-600"]
                : ColorPalette["gray-50"]
            }
          >
            {fee
              .maxDecimals(6)
              .inequalitySymbol(true)
              .trim(true)
              .shrink(true)
              .hideIBCMetadata(true)
              .toString()}
          </Subtitle3>
          <Gutter size="0.25rem" />
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-300"]
            }
          >
            {price ? price.toString() : "(-)"}
          </Subtitle3>
        </XAxis>
      </Box>

      <VerticalResizeTransition transitionAlign="top">
        {!isValidating &&
        (feeConfig.uiProperties.error || feeConfig.uiProperties.warning) ? (
          <Box
            marginTop="0.75rem"
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
              {(() => {
                if (feeConfig.uiProperties.error) {
                  if (
                    feeConfig.uiProperties.error instanceof InsufficientFeeError
                  ) {
                    return intl.formatMessage({
                      id: "components.input.fee-control.error.insufficient-fee",
                    });
                  }

                  return (
                    feeConfig.uiProperties.error.message ||
                    feeConfig.uiProperties.error.toString()
                  );
                }

                if (feeConfig.uiProperties.warning) {
                  return (
                    feeConfig.uiProperties.warning.message ||
                    feeConfig.uiProperties.warning.toString()
                  );
                }
              })()}
            </Subtitle4>
          </Box>
        ) : null}
      </VerticalResizeTransition>
    </Box>
  );
});
