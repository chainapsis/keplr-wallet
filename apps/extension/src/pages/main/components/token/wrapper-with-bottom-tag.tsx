import Color from "color";
import React, { Fragment, PropsWithChildren } from "react";
import { Box } from "../../../../components/box";
import { ArrowRightIcon } from "../../../../components/icon";
import { Body2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { observer } from "mobx-react-lite";
import { useTheme } from "styled-components";
import { BottomTagType } from "./index";
import { useEarnFeature } from "../../../../hooks/use-earn-feature";

export const WrapperwithBottomTag = observer(function ({
  children,
  bottomTagType,
  earnedAssetPrice,
}: PropsWithChildren<{
  bottomTagType?: BottomTagType;
  earnedAssetPrice?: string;
}>) {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";
  const { message, handleClick, textColor } = useEarnFeature(
    bottomTagType,
    earnedAssetPrice
  );

  if (!bottomTagType) {
    return <Fragment>{children}</Fragment>;
  }

  return (
    <Box position="relative" style={{ cursor: "pointer" }}>
      <Box zIndex={1}>{children}</Box>
      <Box
        onClick={handleClick}
        zIndex={0}
        position="relative"
        style={{
          top: "-0.5rem",
          left: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
        paddingTop="0.875rem"
        paddingBottom="0.375rem"
        backgroundColor={
          isLightMode
            ? ColorPalette["green-100"]
            : Color(ColorPalette["green-600"]).alpha(0.2).toString()
        }
        hover={
          isLightMode
            ? {
                backgroundColor: Color(ColorPalette["green-200"])
                  .alpha(0.5)
                  .toString(),
              }
            : {
                backgroundColor: Color(ColorPalette["green-600"])
                  .alpha(0.15)
                  .toString(),
              }
        }
        borderRadius="0 0 0.5rem 0.5rem"
      >
        <Body2 color={textColor} style={{ textAlign: "center" }}>
          {message}
        </Body2>
        <ArrowRightIcon width="1rem" height="1rem" color={textColor} />
      </Box>
    </Box>
  );
});
