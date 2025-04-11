import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useGetEarnApy } from "./use-get-apy";
import { NOBLE_CHAIN_ID } from "../config.ui";
import { BottomTagType } from "../pages/main/components/token/index";

export const useEarnFeature = (
  bottomTagType?: BottomTagType,
  earnedAssetPrice?: string
) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { apy } = useGetEarnApy(NOBLE_CHAIN_ID);
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

  return {
    message,
    handleClick,
  };
};
