import React from "react";
import styled, { useTheme } from "styled-components";
import { COMMON_HOVER_OPACITY } from "../../../../styles/constant";
import { ColorPalette } from "../../../../styles";
import { useIntl } from "react-intl";
import { Gutter } from "../../../../components/gutter";
import { H5 } from "../../../../components/typography";
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
interface ReceiveButtonWhenFirstTimeProps {
  onClick: () => void;
}
export const ReceiveButtonWhenFirstTime = ({
  onClick,
}: ReceiveButtonWhenFirstTimeProps) => {
  const theme = useTheme();
  const intl = useIntl();
  return (
    <StyledButton onClick={onClick}>
      <Box width="2rem" height="2rem" alignX="center" alignY="center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
          viewBox="0 0 17 17"
          fill="none"
        >
          <path
            d="M15.375 1L1 15.375M1 15.375L11.7813 15.375M1 15.375L1 4.59375"
            stroke={
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["gray-10"]
            }
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
      <Gutter size="0.25rem" />
      <H5>
        {intl.formatMessage({
          id: "button.receive",
        })}
      </H5>
    </StyledButton>
  );
};
