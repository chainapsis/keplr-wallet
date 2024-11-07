import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { ColorPalette } from "../../styles";
import {
  ButtonProps,
  ButtonColor,
  ButtonMode,
  ButtonSize,
  ButtonTheme,
} from "./types";

export const ButtonRadius = "0.375rem";

export const makeTextAndSvgColor = (color: string) => {
  return css`
    color: ${color};
    svg {
      fill: ${color};
      stroke: ${color};
    }
  `;
};

export const getButtonHeightRem = (size: ButtonSize | undefined): number => {
  switch (size) {
    case "extraSmall":
      return 2;
    case "small":
      return 2.25;
    case "large":
      return 3.25;
    default:
      return 2.75;
  }
};

export const getLoadingColor = (
  buttonColor: ButtonColor | undefined
): string => {
  switch (buttonColor) {
    case "primary":
      return ColorPalette["blue-200"];
    case "secondary":
      return ColorPalette["gray-200"];
    case "danger":
      return ColorPalette["red-400"];
    default:
      return ColorPalette["blue-200"];
  }
};

const buttonStyleFromColorAndMode: Record<
  ButtonColor,
  Record<
    ButtonTheme,
    Record<
      ButtonMode,
      Record<"enabled" | "disabled", FlattenSimpleInterpolation>
    >
  >
> = {
  primary: {
    light: {
      fill: {
        enabled: css`
          background-color: ${ColorPalette["blue-400"]};

          ${makeTextAndSvgColor(ColorPalette["white"])}

          :hover {
            ::after {
              background-color: ${ColorPalette["gray-500"]};
              opacity: 0.1;
            }
          }
        `,
        disabled: css`
          background-color: ${ColorPalette["blue-400"]};

          ::after {
            background-color: ${ColorPalette["gray-300"]};
            opacity: 0.4;
          }

          ${makeTextAndSvgColor(ColorPalette["white"])}
        `,
      },
    },
    dark: {
      fill: {
        enabled: css`
          background-color: ${ColorPalette["blue-400"]};

          ${makeTextAndSvgColor(ColorPalette["white"])}

          :hover {
            ::after {
              background-color: ${ColorPalette["gray-500"]};
              opacity: 0.3;
            }
          }
        `,
        disabled: css`
          background-color: ${ColorPalette["blue-400"]};

          ::after {
            background-color: ${ColorPalette["gray-600"]};
            opacity: 0.7;
          }

          ${makeTextAndSvgColor(ColorPalette["white"])}
        `,
      },
    },
  },
  secondary: {
    light: {
      fill: {
        enabled: css`
          background-color: ${ColorPalette["blue-50"]};

          ${makeTextAndSvgColor(ColorPalette["blue-400"])}

          :hover {
            ::after {
              background-color: ${ColorPalette["gray-500"]};
              opacity: 0.02;
            }
          }
        `,

        disabled: css`
          background-color: ${ColorPalette["blue-50"]};

          ${makeTextAndSvgColor(ColorPalette["blue-200"])}
        `,
      },
    },
    dark: {
      fill: {
        enabled: css`
          background-color: ${ColorPalette["gray-500"]};

          ${makeTextAndSvgColor(ColorPalette["white"])}

          :hover {
            ::after {
              background-color: ${ColorPalette["gray-600"]};
              opacity: 0.2;
            }
          }
        `,

        disabled: css`
          background-color: ${ColorPalette["gray-400"]};

          ::after {
            background-color: ${ColorPalette["gray-600"]};
            opacity: 0.7;
          }

          ${makeTextAndSvgColor(ColorPalette["white"])}
        `,
      },
    },
  },
  danger: {
    light: {
      fill: {
        enabled: css`
          background-color: ${ColorPalette["red-100"]};

          ${makeTextAndSvgColor(ColorPalette["red-400"])}

          :hover {
            ::after {
              background-color: ${ColorPalette["gray-500"]};
              opacity: 0.05;
            }
          }
        `,
        disabled: css`
          background-color: ${ColorPalette["red-100"]};

          ::after {
            background-color: ${ColorPalette["gray-300"]};
            opacity: 0.2;
          }

          ${makeTextAndSvgColor(ColorPalette["red-400"])}
        `,
      },
    },
    dark: {
      fill: {
        enabled: css`
          background-color: ${ColorPalette["red-100"]};

          ${makeTextAndSvgColor(ColorPalette["red-400"])}

          :hover {
            ::after {
              background-color: ${ColorPalette["gray-500"]};
              opacity: 0.2;
            }
          }
        `,

        disabled: css`
          background-color: ${ColorPalette["gray-400"]};

          ::after {
            background-color: ${ColorPalette["gray-600"]};
            opacity: 0.7;
          }

          ${makeTextAndSvgColor(ColorPalette["white"])}
        `,
      },
    },
  },
};

export const Styles = {
  Container: styled.div<Pick<ButtonProps, "mode">>`
    // Used for making button fill parent horizontally.
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  // "onClick" field should be omitted because "onClick" prop already exists on html button component.
  // If not omitted, they are intersected with each other.
  Button: styled.button<Omit<ButtonProps, "onClick">>`
    width: 100%;
    height: ${({ size }) => `${getButtonHeightRem(size)}rem`};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${ButtonRadius};
    cursor: ${({ disabled, isLoading }) =>
      disabled ? "not-allowed" : isLoading ? "progress" : "pointer"};
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

    // Remove normalized css properties.
    border-width: 0;
    border-style: none;
    border-color: transparent;
    border-image: none;
    padding: 0 0.75rem;

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

    ${({ color, theme, mode, disabled }) =>
      buttonStyleFromColorAndMode[color || "primary"][theme.mode || "dark"][
        mode || "fill"
      ][disabled ? "disabled" : "enabled"]}
  `,
  Left: styled.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-right: 0.25rem;
  `,
  Right: styled.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 0.25rem;
  `,
  Loading: styled.div<{ buttonColor: ButtonColor | undefined }>`
    display: flex;
    align-items: center;

    position: absolute;
    color: ${({ buttonColor }) => getLoadingColor(buttonColor)};
  `,
  TextOverrideIcon: styled.div`
    display: flex;
    align-items: center;

    position: absolute;
    svg {
      fill: none;
    }
  `,
};
