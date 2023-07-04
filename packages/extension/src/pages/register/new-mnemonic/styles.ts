import styled from "styled-components";
import { ColorPalette } from "../../../styles";

export const Styles = {
  WordsGridContainer: styled.div<{
    columns: number;
  }>`
    display: grid;
    grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
    gap: 0.75rem 0;
  `,

  IndexText: styled.div`
    font-weight: 500;
    font-size: 0.875rem;
    text-align: right;
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-100"]};

    min-width: 1.875rem;
    margin-right: 0.375rem;
  `,
};
