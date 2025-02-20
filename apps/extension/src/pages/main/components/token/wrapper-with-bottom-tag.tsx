import Color from "color";
import React, { Fragment, PropsWithChildren } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { Box } from "../../../../components/box";
import { ArrowRightIcon } from "../../../../components/icon";
import { Body3 } from "../../../../components/typography";
import { useGetEarnApy } from "../../../../hooks/use-get-apy";
import { ColorPalette } from "../../../../styles";
import { observer } from "mobx-react-lite";

type BottomTagType = "nudgeEarn" | "showEarnSavings";
const NOBLE_CHAIN_ID = "noble-1";

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
        backgroundColor={Color(ColorPalette["green-700"]).alpha(0.2).toString()}
        borderRadius="0 0 0.5rem 0.5rem"
      >
        <Body3
          color={ColorPalette["green-400"]}
          style={{ textAlign: "center" }}
        >
          {message}
        </Body3>
        <ArrowRightIcon
          width="1rem"
          height="1rem"
          color={ColorPalette["green-400"]}
        />
      </Box>
    </Box>
  );
});
