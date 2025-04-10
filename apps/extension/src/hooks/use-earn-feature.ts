import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { useGetEarnApy } from "./use-get-apy";
import { NOBLE_CHAIN_ID } from "../config.ui";
import { ColorPalette } from "../styles";
import { BottomTagType } from "../pages/main/components/token/index";

export const useEarnFeature = (
  bottomTagType?: BottomTagType,
  earnedAssetPrice?: string
) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const theme = useTheme();
  const { apy } = useGetEarnApy(NOBLE_CHAIN_ID);
  const isLightMode = theme.mode === "light";
  const isNudgeEarn = bottomTagType === "nudgeEarn";

  const message = isNudgeEarn
    ? intl.formatMessage(
        { id: "page.main.components.token-item.earn-nudge-button" },
        { apy: apy }
      )
    : intl.formatMessage(
        { id: "page.main.components.token-item.earn-savings-button" },
        { balance: earnedAssetPrice }
      );

  const handleClick = () => {
    if (isNudgeEarn) {
      navigate(`/earn/intro?chainId=${NOBLE_CHAIN_ID}`);
    } else {
      navigate(`/earn/overview?chainId=${NOBLE_CHAIN_ID}`);
    }
  };

  const textColor = isLightMode
    ? ColorPalette["green-600"]
    : ColorPalette["green-400"];

  return {
    message,
    handleClick,
    textColor,
    isLightMode,
  };
};
