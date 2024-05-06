import styled from "styled-components";

type BaseTypographyProps = {
  color?: string;
};

export const BaseHafferTypography = styled.div<BaseTypographyProps>`
  font-family: "Haffer", "Inter", sans-serif;

  color: ${({ color }) => (color ? color : "inherit")};
`;
