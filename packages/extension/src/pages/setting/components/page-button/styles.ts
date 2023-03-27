import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Body2, Subtitle2 } from "../../../../components/typography";

export const Styles = {
  Container: styled.div`
    background-color: ${ColorPalette["gray-600"]};
    padding: 1rem;
    border-radius: 0.375rem;
    cursor: ${({ onClick }) => (onClick ? "pointer" : "auto")};
  `,
  Title: styled(Subtitle2)`
    color: ${ColorPalette["gray-10"]};
  `,
  Paragraph: styled(Body2)`
    color: ${ColorPalette["gray-300"]};
    max-width: 16.75rem;
  `,
};
