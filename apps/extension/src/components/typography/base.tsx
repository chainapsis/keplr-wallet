import styled, { css } from "styled-components";

type BaseTypographyProps = {
  color?: string;

  hoverColor?: string;
};

export const BaseTypography = styled.div<BaseTypographyProps>`
  color: ${({ color }) => (color ? color : "inherit")};

  ${({ hoverColor }) => {
    if (hoverColor) {
      return css`
        &:hover {
          color: ${hoverColor};
        }
      `;
    }
  }}
`;
