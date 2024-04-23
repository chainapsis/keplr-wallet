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

    border: ${(props) =>
      props.theme.mode === "light"
        ? "none"
        : `2px solid ${ColorPalette["gray-500"]}`};

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-10"]
        : ColorPalette["gray-500"]};

    opacity: ${({ isSelected }) => (isSelected ? 1 : 0.5)};
  `,
};
