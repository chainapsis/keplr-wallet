import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { ColorPalette } from "../../styles";
import { ButtonProps, ButtonColor, ButtonMode } from "./types";

const makeTextAndSvgColor = (color: string) => {
  return css`
    color: ${color};
    svg {
      fill: ${color};
      stroke: ${color};
    }
  `;
};

const buttonStyleFromColorAndMode: Record<
  ButtonColor,
  Record<ButtonMode, Record<"enabled" | "disabled", FlattenSimpleInterpolation>>
> = {
  primary: {
    fill: {
      enabled: css`
        background-color: ${ColorPalette["blue-400"]};

        ${makeTextAndSvgColor(ColorPalette["white"])}

        :hover {
          ::after {
            background-color: ${ColorPalette["gray-500"]};
            opacity: 0.2;
          }
        }
      `,
      disabled: css`
        background-color: ${ColorPalette["blue-200"]};

        ${makeTextAndSvgColor(ColorPalette["white"])}
      `,
    },
    light: {
      enabled: css`
        background-color: ${ColorPalette["blue-10"]};
        border: 1px solid ${ColorPalette["blue-100"]};

        ${makeTextAndSvgColor(ColorPalette["blue-400"])}

        :hover {
          ::after {
            border: 1px solid transparent;

            background-color: ${ColorPalette["gray-500"]};
            opacity: 0.1;
          }
        }
      `,
      disabled: css`
        background-color: ${ColorPalette["blue-10"]};
        border: 1px solid ${ColorPalette["blue-100"]};

        ${makeTextAndSvgColor(ColorPalette["blue-200"])}
      `,
    },
    text: {
      enabled: css`
        background-color: transparent;

        ${makeTextAndSvgColor(ColorPalette["blue-400"])}

        :hover {
          background-color: ${ColorPalette["platinum-500"] + "33"};
        }
      `,
      disabled: css`
        background-color: transparent;

        ${makeTextAndSvgColor(ColorPalette["blue-200"])}
      `,
    },
  },
  danger: {
    fill: {
      enabled: css`
        background-color: ${ColorPalette["red-400"]};

        ${makeTextAndSvgColor(ColorPalette["white"])}

        :hover {
          ::after {
            background-color: ${ColorPalette["platinum-500"]};
            opacity: 0.2;
          }
        }
      `,
      disabled: css`
        background-color: ${ColorPalette["red-200"]};

        ${makeTextAndSvgColor(ColorPalette["red-100"])}
      `,
    },
    light: {
      enabled: css`
        background-color: ${ColorPalette["red-50"]};
        border: 1px solid ${ColorPalette["red-200"]};

        ${makeTextAndSvgColor(ColorPalette["red-400"])}

        :hover {
          ::after {
            background-color: ${ColorPalette["platinum-500"]};
            opacity: 0.1;
          }
        }
      `,
      disabled: css`
        background-color: ${ColorPalette["red-50"]};
        border: 1px solid ${ColorPalette["red-200"]};

        ${makeTextAndSvgColor(ColorPalette["red-200"])}
      `,
    },
    text: {
      enabled: css`
        background-color: transparent;

        ${makeTextAndSvgColor(ColorPalette["red-400"])}

        :hover {
          background-color: ${ColorPalette["platinum-500"] + "33"};
        }
      `,
      disabled: css`
        background-color: transparent;

        ${makeTextAndSvgColor(ColorPalette["red-200"])}
      `,
    },
  },
  info: {
    fill: {
      enabled: css`
        background-color: ${ColorPalette["platinum-200"]};

        ${makeTextAndSvgColor(ColorPalette["white"])}

        :hover {
          ::after {
            background-color: ${ColorPalette["platinum-500"]};
            opacity: 0.2;
          }
        }
      `,
      disabled: css`
        background-color: ${ColorPalette["platinum-100"]};

        ${makeTextAndSvgColor(ColorPalette["white"])}
      `,
    },
    light: {
      enabled: css`
        background-color: ${ColorPalette["platinum-50"]};
        border: 1px solid ${ColorPalette["platinum-200"]};

        ${makeTextAndSvgColor(ColorPalette["platinum-300"])}

        :hover {
          ::after {
            background-color: ${ColorPalette["platinum-500"]};
            opacity: 0.1;
          }
        }
      `,
      disabled: css`
        background-color: ${ColorPalette["platinum-50"]};
        border: 1px solid ${ColorPalette["platinum-200"]};

        ${makeTextAndSvgColor(ColorPalette["platinum-100"])}
      `,
    },
    text: {
      enabled: css`
        background-color: transparent;

        ${makeTextAndSvgColor(ColorPalette["platinum-200"])}

        :hover {
          background-color: ${ColorPalette["platinum-500"] + "33"};
        }
      `,
      disabled: css`
        background-color: transparent;

        ${makeTextAndSvgColor(ColorPalette["platinum-100"])}
      `,
    },
  },
};

export const Styles = {
  Container: styled.div`
    // Used for making button fill parent horizontally.
  `,

  // "onClick" field should be omitted because "onClick" prop already exists on html button component.
  // If not omitted, they are intersected with each other.
  Button: styled.button<Omit<ButtonProps, "onClick">>`
    width: 100%;
    height: ${({ size }) => {
      switch (size) {
        case "small":
          return "2.375rem";
        default:
          return "3.25rem";
      }
    }};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.5rem;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    overflow: hidden;

    // Default font style.
    // Override these in "buttonStyleFromColorAndMode" if needed.
    font-weight: 600;
    font-size: ${({ size }) => {
      switch (size) {
        case "small":
          return "0.875rem";
        default:
          return "1rem";
      }
    }};
    line-height: 110%;
    letter-spacing: 0.2px;

    // Remove normalized css properties.
    border-width: 0;
    border-style: none;
    border-color: transparent;
    border-image: none;
    padding: 0;

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

    ${({ color, mode, disabled }) =>
      buttonStyleFromColorAndMode[color || "primary"][mode || "fill"][
        disabled ? "disabled" : "enabled"
      ]}
  `,
  Text: styled.div``,
};
