import Color from "color";
import React, { Fragment, PropsWithChildren } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { Box } from "../../../../components/box";
import { ArrowRightIcon } from "../../../../components/icon";
import { Body2 } from "../../../../components/typography";
import { useGetEarnApy } from "../../../../hooks/use-get-apy";
import { ColorPalette } from "../../../../styles";
import { observer } from "mobx-react-lite";
import { NOBLE_CHAIN_ID } from "../../../../config.ui";
import { useTheme } from "styled-components";

type BottomTagType = "nudgeEarn" | "showEarnSavings";

export const WrapperwithBottomTag = observer(function ({
  children,
  bottomTagType,
  earnedAssetPrice,
}: PropsWithChildren<{
  bottomTagType?: BottomTagType;
  earnedAssetPrice?: string;
}>) {
  const isNudgeEarn = bottomTagType === "nudgeEarn";

  const intl = useIntl();
  const navigate = useNavigate();
  const { apy } = useGetEarnApy(NOBLE_CHAIN_ID);

  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  function onClick() {
    if (isNudgeEarn) {
      navigate(`/earn/intro?chainId=${NOBLE_CHAIN_ID}`);
    } else {
      navigate(`/earn/overview?chainId=${NOBLE_CHAIN_ID}`);
    }
  }

  if (!bottomTagType) {
    return <Fragment>{children}</Fragment>;
  }

  const message =
    bottomTagType === "nudgeEarn"
      ? intl.formatMessage(
          { id: "page.main.components.token-item.earn-nudge-button" },
          { apy: apy }
        )
      : intl.formatMessage(
          { id: "page.main.components.token-item.earn-savings-button" },
          { balance: earnedAssetPrice }
        );

  return (
    <Box position="relative" style={{ cursor: "pointer" }}>
      {children}
      <Box
        onClick={onClick}
        zIndex={1}
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
        <Body2
          color={
            isLightMode ? ColorPalette["green-600"] : ColorPalette["green-400"]
          }
          style={{ textAlign: "center" }}
        >
          {message}
        </Body2>
        <ArrowRightIcon
          width="1rem"
          height="1rem"
          color={
            isLightMode ? ColorPalette["green-600"] : ColorPalette["green-400"]
          }
        />
      </Box>
    </Box>
  );
});
