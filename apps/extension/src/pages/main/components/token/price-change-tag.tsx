import React, { FunctionComponent } from "react";
import { DecUtils, RatePretty } from "@keplr-wallet/unit";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { Body2 } from "../../../../components/typography";

const PriceChangeTag: FunctionComponent<{
  rate: RatePretty;
}> = ({ rate }) => {
  const info: {
    text: string;
    isNeg: boolean;
    isZero: boolean;
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
        isZero: true,
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
        isZero: false,
      };
    }
  })();

  return (
    <Box
      alignY="center"
      color={
        info.isZero
          ? ColorPalette["gray-300"]
          : info.isNeg
          ? ColorPalette["orange-500"]
          : ColorPalette["green-500"]
      }
    >
      <XAxis alignY="center">
        {info.isNeg ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="7"
            height="6"
            viewBox="0 0 7 6"
            fill="none"
          >
            <path
              d="M2.6603 5.43792C3.0538 6.05132 3.9502 6.05132 4.3437 5.43792L6.84425 1.53995C7.27121 0.874393 6.79329 0 6.00255 0H1.00145C0.210719 0 -0.267203 0.874392 0.159753 1.53995L2.6603 5.43792Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="7"
            height="6"
            viewBox="0 0 7 6"
            fill="none"
          >
            <path
              d="M2.6603 0.460027C3.0538 -0.153374 3.9502 -0.153375 4.3437 0.460026L6.84425 4.358C7.27121 5.02356 6.79329 5.89795 6.00255 5.89795H1.00145C0.210719 5.89795 -0.267203 5.02356 0.159753 4.358L2.6603 0.460027Z"
              fill="currentColor"
            />
          </svg>
        )}
        <Gutter size="0.125rem" />
        <Body2 style={{ lineHeight: "120%" }}>{info.text}</Body2>
      </XAxis>
    </Box>
  );
};

export { PriceChangeTag };
