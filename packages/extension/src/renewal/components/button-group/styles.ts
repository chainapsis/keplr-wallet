import styled, { css } from "styled-components";
import { ColorPalette } from "../../styles";

export const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;

    height: 2rem;
  `,
  Button: styled.button<{
    selected: boolean;
    buttonMinWidth?: string;
  }>`
    flex: 1;

    display: flex;
    align-items: center;
    justify-content: center;

    height: 100%;
    padding: 0 0.75rem;
    min-width: ${({ buttonMinWidth }) => buttonMinWidth};

    ${({ selected }) => {
      if (selected) {
        return css`
          cursor: auto;
        `;
      }
      return css`
        cursor: pointer;
      `;
    }}

    background-color: ${ColorPalette["white"]};

    font-weight: 600;
    font-size: 0.875rem;
    line-height: 125%;
    letter-spacing: -0.1px;
    color: ${ColorPalette["gray-300"]};

    white-space: nowrap;

    ${({ selected }) => {
      if (selected) {
        return css`
          background-color: ${ColorPalette["blue-100"]};

          color: ${ColorPalette["blue-400"]};
        `;
      }
    }}

    border-width: 1px;
    border-style: solid;
    border-color: ${({ selected }) =>
      selected ? ColorPalette["blue-100"] : ColorPalette["gray-50"]};
    border-left-style: none;
    border-right-style: none;

    :first-child {
      border-radius: 0.5rem 0 0 0.5rem;
      border-left-style: solid;
    }

    :last-child {
      border-radius: 0 0.5rem 0.5rem 0;
      border-right-style: solid;
    }

    // Remove normalized css properties.
    border-image: none;
  `,
  Divider: styled.div<{
    besideSelected: boolean;
  }>`
    height: 100%;
    width: 1px;
    background-color: ${({ besideSelected }) =>
      besideSelected ? ColorPalette["blue-100"] : ColorPalette["gray-50"]};
  `,
};
