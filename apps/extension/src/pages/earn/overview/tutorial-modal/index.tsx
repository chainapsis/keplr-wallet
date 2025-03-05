import { FunctionComponent, useState } from "react";
import React from "react";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import { ManageEarnContent } from "./manage-earn-content";
import { EarnClaimContent } from "./earn-claim-content";
import { AppCurrency } from "@keplr-wallet/types";
import { useTheme } from "styled-components";
import { XAxis, YAxis } from "../../../../components/axis";
import { CancelIcon } from "../../../../components/button";

export const EarnOverviewTutorialModal: FunctionComponent<{
  holdingCurrency: AppCurrency;
  rewardDenom: string;
  onClose: () => void;
}> = ({ holdingCurrency, rewardDenom, onClose }) => {
  const theme = useTheme();

  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleNext = () => {
    setCarouselIndex((prevIndex) => prevIndex + 1);
  };

  const handlePrev = () => {
    setCarouselIndex((prevIndex) => prevIndex - 1);
  };

  const Contents = [
    <ManageEarnContent
      denom={holdingCurrency.coinDenom}
      coinImageUrl={holdingCurrency.coinImageUrl ?? ""}
      key="manage-earn"
      onNext={handleNext}
      isLightMode={theme.mode === "light"}
    />,
    <EarnClaimContent
      tokenName={rewardDenom}
      moveToNext={onClose}
      moveToPrev={handlePrev}
      key="earn-claim"
      isLightMode={theme.mode === "light"}
    />,
  ];

  return (
    <YAxis alignX="center">
      <Box
        borderRadius="1.25rem"
        backgroundColor={
          theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
        }
        padding="1.25rem"
        width="95%"
        maxWidth="18.75rem"
      >
        <Box
          style={{ marginLeft: "auto", cursor: "pointer" }}
          onClick={onClose}
        >
          <CancelIcon
            width="1.25rem"
            height="1.25rem"
            color={
              theme.mode === "light"
                ? ColorPalette["gray-200"]
                : ColorPalette["gray-300"]
            }
          />
        </Box>
        <YAxis alignX="center">
          <XAxis>
            {Contents.map((_, index) => (
              <DotIndicator
                key={index}
                isActive={index === carouselIndex}
                isLast={index === Contents.length - 1}
                isLightMode={theme.mode === "light"}
              />
            ))}
          </XAxis>
        </YAxis>
        <Box>{Contents[carouselIndex]}</Box>
      </Box>
    </YAxis>
  );
};

const DotIndicator: FunctionComponent<{
  isActive: boolean;
  isLast: boolean;
  isLightMode: boolean;
}> = ({ isActive, isLast, isLightMode }) => (
  <Box
    width="5px"
    height="5px"
    borderRadius="50%"
    backgroundColor={
      isLightMode
        ? isActive
          ? ColorPalette["blue-400"]
          : ColorPalette["gray-100"]
        : isActive
        ? ColorPalette["gray-100"]
        : ColorPalette["gray-400"]
    }
    marginRight={isLast ? "0" : "0.5rem"}
  />
);
