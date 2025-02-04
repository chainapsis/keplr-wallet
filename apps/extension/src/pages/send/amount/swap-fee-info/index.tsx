import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { IntPretty, PricePretty } from "@keplr-wallet/unit";
import { useStore } from "../../../../stores";
import { IBCSwapAmountConfig } from "@keplr-wallet/hooks-internal";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { XAxis, YAxis } from "../../../../components/axis";
import { Body3, Subtitle4 } from "../../../../components/typography";
import { LoadingIcon } from "../../../../components/icon";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { Tooltip } from "../../../../components/tooltip";

export const SwapFeeInfoForBridgeOnSend: FunctionComponent<{
  amountConfig: IBCSwapAmountConfig;
}> = observer(({ amountConfig }) => {
  const { priceStore } = useStore();

  const theme = useTheme();

  const intl = useIntl();

  return (
    <React.Fragment>
      <Box
        marginTop="0.5rem"
        padding="1rem"
        backgroundColor={
          theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
        }
        style={{
          boxShadow:
            theme.mode === "light"
              ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
              : undefined,
        }}
        borderRadius="0.375rem"
        borderWidth="1px"
        borderColor={"transparent"}
      >
        <XAxis alignY="center">
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-300"]
            }
          >
            <FormattedMessage id="page.ibc-swap.components.swap-fee-info.button.service-fee" />
          </Subtitle4>
          <Gutter size="0.2rem" />
          <Tooltip
            content={intl.formatMessage(
              {
                id: "page.ibc-swap.components.swap-fee-info.button.service-fee.paragraph",
              },
              {
                rate: (() => {
                  const feeRatioPretty = new IntPretty(
                    amountConfig.swapFeeBps
                  ).moveDecimalPointLeft(2);
                  return feeRatioPretty
                    .trim(true)
                    .maxDecimals(4)
                    .inequalitySymbol(true)
                    .toString();
                })(),
              }
            )}
          >
            <InfoIcon
              width="1rem"
              height="1rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
            />
          </Tooltip>
          {amountConfig.isFetching ? (
            <Box
              height="1px"
              alignX="center"
              alignY="center"
              marginLeft="0.2rem"
            >
              {/* 로딩 아이콘이 부모의 height에 영향을 끼치지 않게 하기 위한 트릭 구조임 */}
              <Box width="1rem" height="1rem">
                <LoadingIcon
                  width="1rem"
                  height="1rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-300"]
                  }
                />
              </Box>
            </Box>
          ) : null}

          <div style={{ flex: 1 }} />

          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-300"]
            }
          >
            {amountConfig.swapFee
              .map((fee) =>
                fee
                  .maxDecimals(6)
                  .trim(true)
                  .shrink(true)
                  .inequalitySymbol(true)
                  .hideIBCMetadata(true)
                  .toString()
              )
              .join(", ")}
          </Subtitle4>
        </XAxis>

        {amountConfig.otherFees.length > 0 ? (
          <React.Fragment>
            <Gutter size="0.62rem" />
            <XAxis alignY="center">
              <Box>
                <Subtitle4
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-300"]
                  }
                >
                  Bridge Fee
                </Subtitle4>
              </Box>
              <div
                style={{
                  flex: 1,
                }}
              />

              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-300"]
                }
              >
                {(() => {
                  let totalPrice: PricePretty | undefined;
                  if (amountConfig.otherFees.length > 0) {
                    for (const fee of amountConfig.otherFees) {
                      const price = priceStore.calculatePrice(fee);
                      if (price) {
                        if (totalPrice) {
                          totalPrice = totalPrice.add(price);
                        } else {
                          totalPrice = price;
                        }
                      } else {
                        return "-";
                      }
                    }
                  }

                  if (totalPrice) {
                    return totalPrice.toString();
                  }
                  return "-";
                })()}
              </Body3>

              <Gutter size="0.25rem" />
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-600"]
                    : ColorPalette["gray-100"]
                }
              >
                =
              </Body3>
              <Gutter size="0.25rem" />
              <YAxis>
                {amountConfig.otherFees.map((fee) => {
                  return (
                    <Body3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-600"]
                          : ColorPalette["gray-100"]
                      }
                      key={fee.currency.coinMinimalDenom}
                    >
                      {fee
                        .maxDecimals(6)
                        .trim(true)
                        .shrink(true)
                        .inequalitySymbol(true)
                        .hideIBCMetadata(true)
                        .toString()}
                    </Body3>
                  );
                })}
              </YAxis>
            </XAxis>
          </React.Fragment>
        ) : null}
      </Box>
    </React.Fragment>
  );
});

const InfoIcon: FunctionComponent<{
  width: string;
  height: string;
  color: string;
}> = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      stroke="none"
    >
      <path
        d="M7.33325 4.66665H8.66659V5.99998H7.33325V4.66665ZM7.33325 7.33331H8.66659V11.3333H7.33325V7.33331ZM7.99992 1.33331C4.31992 1.33331 1.33325 4.31998 1.33325 7.99998C1.33325 11.68 4.31992 14.6666 7.99992 14.6666C11.6799 14.6666 14.6666 11.68 14.6666 7.99998C14.6666 4.31998 11.6799 1.33331 7.99992 1.33331ZM7.99992 13.3333C5.05992 13.3333 2.66659 10.94 2.66659 7.99998C2.66659 5.05998 5.05992 2.66665 7.99992 2.66665C10.9399 2.66665 13.3333 5.05998 13.3333 7.99998C13.3333 10.94 10.9399 13.3333 7.99992 13.3333Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
