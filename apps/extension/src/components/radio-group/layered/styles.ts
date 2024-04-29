import styled, { css } from "styled-components";
import { ColorPalette } from "../../../styles";

export const LayeredStyles = {
  Container: styled.div<{
    size: "default" | "large";
    isNotReady: boolean;
  }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};

    box-shadow: ${(props) =>
      props.theme.mode === "light" && !props.isNotReady
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none"};

    ${({ size }) => {
      switch (size) {
        case "large": {
          return css`
            height: 2.375rem;
            border-radius: 1.1875rem;
            padding: 0 0.15625rem;
          `;
        }
        default: {
          return css`
            height: 1.875rem;
            border-radius: 0.9375rem;
            padding: 0 0.125rem;
          `;
        }
      }
    }};
  `,
  Button: styled.button<{
    size: "default" | "large";
    selected: boolean;
    itemMinWidth?: string;
    isNotReady: boolean;
  }>`
    position: relative;
    ${({ selected, isNotReady }) => {
      if (selected && isNotReady) {
        return css`
          ::after {
            content: "";

            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;

            border-radius: 999999px;
            background-color: ${(props) => {
              return props.theme.mode === "light"
                ? ColorPalette["skeleton-layer-1"]
                : ColorPalette["gray-500"];
            }};

            z-index: 999999;
          }
        `;
      }
    }}

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
              ? ColorPalette["blue-50"]
              : ColorPalette["gray-400"]};
          color: ${(props) =>
            props.theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette.white};
          font-weight: 500;
        `;
      }
      return css`
        cursor: pointer;
        background-color: ${(props) =>
          props.theme.mode === "light"
            ? ColorPalette.white
            : ColorPalette["gray-600"]};
        color: ${ColorPalette["gray-300"]};
        font-weight: 400;
      `;
    }}

    ${({ size }) => {
      switch (size) {
        case "large": {
          return css`
            height: 2.0625rem;
            border-radius: 1.03125rem;
            font-size: 0.75rem;

            padding: 0 0.625rem;
          `;
        }
        default: {
          return css`
            height: 1.625rem;
            border-radius: 0.8125rem;
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
