import styled from "styled-components";

type BaseTypographyProps = {
  color?: string;
};

export const BaseTypography = styled.div<BaseTypographyProps>`
  font-family: "Inter", sans-serif;

  color: ${({ color }) => (color ? color : "inherit")};
`;
