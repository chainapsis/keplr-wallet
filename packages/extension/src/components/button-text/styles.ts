import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { ButtonColor, TextButtonProps } from "./types";
import { ColorPalette } from "../../styles";
import { ButtonTheme, makeTextAndSvgColor } from "../button";

const buttonStyleFromColorAndMode: Record<
  ButtonColor,
  Record<
    ButtonTheme,
    Record<"enabled" | "disabled", FlattenSimpleInterpolation>
  >
> = {
  default: {
    light: {
      enabled: css`
        color: ${ColorPalette["gray-300"]};
        ${makeTextAndSvgColor(ColorPalette["gray-300"])}

        :hover {
          color: ${ColorPalette["gray-200"]};
          ${makeTextAndSvgColor(ColorPalette["gray-200"])}
        }
      `,
      disabled: css`
        color: ${ColorPalette["gray-300"]};
        ${makeTextAndSvgColor(ColorPalette["gray-300"])}
      `,
    },
    dark: {
      enabled: css`
        color: ${ColorPalette["gray-50"]};
        ${makeTextAndSvgColor(ColorPalette["gray-50"])}

        :hover {
          color: ${ColorPalette["gray-200"]};
          ${makeTextAndSvgColor(ColorPalette["gray-200"])}
        }
      `,
      disabled: css`
        color: ${ColorPalette["gray-200"]};
        ${makeTextAndSvgColor(ColorPalette["gray-200"])}
      `,
    },
  },
  faint: {
    light: {
      enabled: css`
        color: ${ColorPalette["gray-200"]};
        ${makeTextAndSvgColor(ColorPalette["gray-200"])}

        :hover {
          color: ${ColorPalette["gray-300"]};
          ${makeTextAndSvgColor(ColorPalette["gray-300"])}
        }
      `,
      disabled: css`
        color: ${ColorPalette["gray-200"]};
        ${makeTextAndSvgColor(ColorPalette["gray-200"])}
      `,
    },
    dark: {
      enabled: css`
        color: ${ColorPalette["gray-200"]};
        ${makeTextAndSvgColor(ColorPalette["gray-200"])}

        :hover {
          color: ${ColorPalette["gray-300"]};
          ${makeTextAndSvgColor(ColorPalette["gray-300"])}
        }
      `,
      disabled: css`
        color: ${ColorPalette["gray-300"]};
        ${makeTextAndSvgColor(ColorPalette["gray-300"])}
      `,
    },
  },
};

export const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  Button: styled.button<Omit<TextButtonProps, "onClick">>`
    width: 100%;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.375rem;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    overflow: hidden;

    // Default font style.
    // Override these in "buttonStyleFromColorAndMode" if needed.
    font-weight: 500;
    font-size: ${({ size }) => {
      switch (size) {
        case "large":
          return "1rem";
        default:
          return "0.875rem";
      }
    }};
    letter-spacing: 0.2px;

    white-space: nowrap;

    border: 0;
    padding: 0 1rem;

    ${({ color, disabled, theme }) =>
      buttonStyleFromColorAndMode[color || "default"][theme.mode || "dark"][
        disabled ? "disabled" : "enabled"
      ]}
    background-color: transparent;

    // For hovering.
    position: relative;
    ::after {
      content: "";

      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
  `,
  Right: styled.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 0.25rem;
  `,
};
