import styled from "styled-components";
import { ColorPalette } from "../../../styles";

export const Styles = {
  PathItemList: styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 0.75rem;
  `,
  ItemContainer: styled.div<{ isSelected: boolean }>`
    padding: 1.2rem;
    border-radius: 0.5rem;
    cursor: pointer;

    border: 2px solid ${ColorPalette["gray-500"]};

    background-color: ${ColorPalette["gray-500"]};

    opacity: ${({ isSelected }) => (isSelected ? 1 : 0.5)};
  `,
};
