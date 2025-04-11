import React, { FunctionComponent } from "react";
import { DecUtils, RatePretty } from "@keplr-wallet/unit";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { ColorPalette } from "../../../../styles";
import Color from "color";
import { Gutter } from "../../../../components/gutter";
import { Caption2 } from "../../../../components/typography";

const PriceChangeTag: FunctionComponent<{
  rate: RatePretty;
}> = ({ rate }) => {
  const info: {
    text: string;
    isNeg: boolean;
  } = (() => {
    // Max decimals가 2인데 이 경우 숫자가 0.00123%같은 경우면 +0.00% 같은식으로 표시될 수 있다.
    // 이 경우는 오차를 무시하고 0.00%로 생각한다.
    if (
      rate
        .toDec()
        .abs()
        // 백분율을 고려해야되기 때문에 -2가 아니라 -4임
        .lte(DecUtils.getTenExponentN(-4))
    ) {
      return {
        text: "0.00%",
        isNeg: false,
      };
    } else {
      const res = rate
        .maxDecimals(2)
        .trim(false)
        .shrink(true)
        .inequalitySymbol(false)
        .toString();

      const isNeg = res.startsWith("-");
      return {
        text: isNeg ? res.replace("-", "") : res,
        isNeg,
      };
    }
  })();

  const theme = useTheme();

  return (
    <Box
      height="1.125rem"
      minHeight="1.125rem"
      borderRadius="0.375rem"
      paddingX="0.25rem"
      alignY="center"
      backgroundColor={(() => {
        if (theme.mode === "light") {
          return info.isNeg
            ? ColorPalette["orange-50"]
            : ColorPalette["green-50"];
        }

        return info.isNeg
          ? Color(ColorPalette["orange-700"]).alpha(0.4).toString()
          : Color(ColorPalette["green-700"]).alpha(0.2).toString();
      })()}
      color={(() => {
        if (theme.mode === "light") {
          return info.isNeg
            ? ColorPalette["orange-400"]
            : ColorPalette["green-500"];
        }

        return info.isNeg
          ? ColorPalette["orange-400"]
          : ColorPalette["green-400"];
      })()}
    >
      <XAxis alignY="center">
        {info.isNeg ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="10"
            fill="none"
            viewBox="0 0 12 10"
          >
            <path stroke="currentColor" d="M1 1l4 5.5 2.667-3L11 9" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="10"
            fill="none"
            viewBox="0 0 12 10"
          >
            <path stroke="currentColor" d="M1 9l4-5.5 2.667 3L11 1" />
          </svg>
        )}
        <Gutter size="0.25rem" />
        <Caption2>{info.text}</Caption2>
      </XAxis>
    </Box>
  );
};

export { PriceChangeTag };
