import React from "react";
import styled, { useTheme } from "styled-components";
import { COMMON_HOVER_OPACITY } from "../../../../styles/constant";
import { ColorPalette } from "../../../../styles";
import { useIntl } from "react-intl";
import { Gutter } from "../../../../components/gutter";
import { H5 } from "../../../../components/typography";
import { CreditCardIcon } from "../../../../components/icon/credit-card";
import { Box } from "../../../../components/box";

const StyledButton = styled.button`
  width: 100%;
  height: 100%;
  background-color: ${(props) =>
    props.theme.mode === "light"
      ? ColorPalette["gray-50"]
      : ColorPalette["gray-600"]};
  color: ${(props) =>
    props.theme.mode === "light"
      ? ColorPalette["gray-300"]
      : ColorPalette["gray-100"]};
  border-radius: 1.25rem;
  padding: 0.75rem;
  border: none;
  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  height: 5.125rem;

  &:hover {
    opacity: ${COMMON_HOVER_OPACITY};
  }
`;
interface BuyButtonWhenFirstTimeProps {
  onClick: () => void;
}
export const BuyButtonWhenFirstTime = ({
  onClick,
}: BuyButtonWhenFirstTimeProps) => {
  const theme = useTheme();
  const intl = useIntl();
  return (
    <StyledButton onClick={onClick}>
      <Box width="2rem" height="2rem" alignX="center" alignY="center">
        <CreditCardIcon
          width="1.25rem"
          height="1.25rem"
          color={
            theme.mode === "light"
              ? ColorPalette["gray-500"]
              : ColorPalette["gray-10"]
          }
        />
      </Box>
      <Gutter size="0.25rem" />
      <H5>
        {intl.formatMessage({
          id: "button.buy",
        })}
      </H5>
    </StyledButton>
  );
};
