import styled from "styled-components";
import { ColorPalette } from "../../../../styles";

export const Styles = {
  Container: styled.div`
    background-color: ${ColorPalette["gray-600"]};
    padding: 1rem;
    border-radius: 0.375rem;
    cursor: ${({ onClick }) => (onClick ? "pointer" : "auto")};
  `,
};
