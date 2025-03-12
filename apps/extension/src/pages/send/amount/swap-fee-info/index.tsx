import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { useStore } from "../../../../stores";
import { IBCSwapAmountConfig } from "@keplr-wallet/hooks-internal";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { XAxis } from "../../../../components/axis";
import { Body3, Subtitle3, Subtitle4 } from "../../../../components/typography";
import { ArticleOutlineIcon, LoadingIcon } from "../../../../components/icon";
import { useTheme } from "styled-components";
import { FormattedMessage } from "react-intl";

export const SwapFeeInfoForBridgeOnSend: FunctionComponent<{
  amountConfig: IBCSwapAmountConfig;
}> = observer(({ amountConfig }) => {
  const { priceStore } = useStore();

  const theme = useTheme();

  const expectedAmountRatio = (() => {
    const inputDec = amountConfig.amount[0].toDec();
    const outputDec = amountConfig.outAmount.toDec();
    const ratioOutputByInput = (() => {
      if (inputDec.isZero()) {
        return "0";
      }

      const feeAmount = inputDec.sub(outputDec);
      const ratio = feeAmount.quo(inputDec).mul(DecUtils.getTenExponentN(2));
      //ratio는 input에 대한 수수료의 비율이기 때문에 보여줄때는 부호를 반대로 해야함
      return ratio.lt(new Dec(0)) ? ratio.toString(2) : `-${ratio.toString(2)}`;
    })();

    return ratioOutputByInput;
  })();

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
            <FormattedMessage id="components.fee-info.bridge-fee" />
          </Subtitle4>
          <Gutter size="0.2rem" />

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
          <div
            style={{
              flex: 1,
            }}
          />

          {amountConfig.otherFees.length > 0 && (
            <React.Fragment>
              <Body3 color={ColorPalette["gray-300"]}>
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

              <Body3 color={ColorPalette["gray-300"]}>=</Body3>
              <Gutter size="0.25rem" />
              {amountConfig.otherFees.map((fee) => {
                return (
                  <Body3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["white"]
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
            </React.Fragment>
          )}
        </XAxis>
        <Gutter size="0.625rem" />

        <XAxis alignY="center">
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-400"]
                : ColorPalette["gray-200"]
            }
          >
            <FormattedMessage id="page.send.amount.bridge-fee-info.expected-amount" />
          </Subtitle3>
          <Gutter size="0.25rem" />
          <ArticleOutlineIcon
            width="1rem"
            height="1rem"
            color={
              theme.mode === "light"
                ? ColorPalette["gray-400"]
                : ColorPalette["gray-200"]
            }
          />
          <div style={{ flex: 1 }} />
          {expectedAmountRatio !== "0" && (
            <Body3 color={ColorPalette["gray-300"]}>
              ({expectedAmountRatio}%)
            </Body3>
          )}

          <Gutter size="0.25rem" />

          {(() => {
            if (theme.mode === "light") {
              return (
                <Body3 color={ColorPalette["gray-600"]}>
                  {amountConfig.outAmount
                    .maxDecimals(6)
                    .trim(true)
                    .shrink(true)
                    .inequalitySymbol(true)
                    .hideIBCMetadata(true)
                    .toString()}
                </Body3>
              );
            }
            return (
              <Subtitle4>
                {amountConfig.outAmount
                  .maxDecimals(6)
                  .trim(true)
                  .shrink(true)
                  .inequalitySymbol(true)
                  .hideIBCMetadata(true)
                  .toString()}
              </Subtitle4>
            );
          })()}
        </XAxis>
      </Box>
    </React.Fragment>
  );
});
