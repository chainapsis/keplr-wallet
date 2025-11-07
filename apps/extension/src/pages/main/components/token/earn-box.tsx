import React, { FunctionComponent } from "react";
import { BottomTagType } from ".";
import { observer } from "mobx-react-lite";
import { useEarnFeature } from "../../../../hooks/use-earn-feature";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import Color from "color";
import { Body2 } from "../../../../components/typography";
import { ArrowRightIcon } from "../../../../components/icon";

export const EarnBox: FunctionComponent<{
  bottomTagType?: BottomTagType;
  earnedAssetPrice?: string;
}> = observer(({ bottomTagType, earnedAssetPrice }) => {
  const { message, handleClick } = useEarnFeature(
    bottomTagType,
    earnedAssetPrice
  );

  const theme = useTheme();

  const textColor =
    theme.mode === "light"
      ? ColorPalette["green-600"]
      : ColorPalette["green-400"];

  return (
    <StyledEarningsBox onClick={handleClick}>
      <Body2 color={textColor} style={{ textAlign: "center" }}>
        {message}
      </Body2>
      <ArrowRightIcon width="1rem" height="1rem" color={textColor} />
    </StyledEarningsBox>
  );
});

const StyledEarningsBox = styled.div`
  display: flex;
  height: 2.375rem;
  padding: 0.375rem 0rem;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  align-self: stretch;
  border-radius: 0.375rem;
  background: ${({ theme }) =>
    theme.mode === "light"
      ? ColorPalette["green-100"]
      : Color(ColorPalette["green-600"]).alpha(0.2).toString()};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) =>
      theme.mode === "light"
        ? Color(ColorPalette["green-200"]).alpha(0.5).toString()
        : Color(ColorPalette["green-600"]).alpha(0.15).toString()};
  }
`;
