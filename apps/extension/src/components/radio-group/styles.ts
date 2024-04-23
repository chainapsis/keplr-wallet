import styled, { css } from "styled-components";
import { ColorPalette } from "../../styles";

export const Styles = {
  Container: styled.div<{
    size: "default" | "large";
  }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-50"]
        : ColorPalette["gray-700"]};

    ${({ size }) => {
      switch (size) {
        case "large": {
          return css`
            height: 2.625rem;
            border-radius: 1.3125rem;
          `;
        }
        default: {
          return css`
            height: 2.25rem;
            border-radius: 1.125rem;
          `;
        }
      }
    }}
  `,
  Button: styled.button<{
    size: "default" | "large";
    selected: boolean;
    itemMinWidth?: string;
  }>`
    flex: ${({ itemMinWidth }) => (itemMinWidth ? undefined : 1)};

    display: flex;
    align-items: center;
    justify-content: center;

    min-width: ${({ itemMinWidth }) => itemMinWidth};

    ${({ selected }) => {
      if (selected) {
        return css`
          cursor: auto;
          background-color: ${(props) =>
            props.theme.mode === "light"
              ? ColorPalette["white"]
              : ColorPalette["gray-600"]};
          color: ${(props) =>
            props.theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-50"]};
          font-weight: 500;
        `;
      }
      return css`
        cursor: pointer;
        background-color: ${(props) =>
          props.theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-700"]};
        color: ${ColorPalette["gray-300"]};
        font-weight: 400;
      `;
    }}

    ${({ size }) => {
      switch (size) {
        case "large": {
          return css`
            height: 2.125rem;
            border-radius: 1.0625rem;
            font-size: 0.875rem;

            padding: 0 0.75rem;
          `;
        }
        default: {
          return css`
            height: 1.75rem;
            border-radius: 0.875rem;
            font-size: 0.75rem;

            padding: 0 0.625rem;
          `;
        }
      }
    }}
    
    
    white-space: nowrap;

    // Remove normalized css properties.
    border-width: 0;
    border-style: none;
    border-image: none;
  `,
};
