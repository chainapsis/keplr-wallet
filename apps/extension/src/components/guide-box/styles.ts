import styled, { css } from "styled-components";
import { Stack } from "../stack";
import { ColorPalette } from "../../styles";
import { GuideBoxColor, GuideBoxProps } from "./types";
import Color from "color";

export const getTitleColor = (
  theme: { mode: "dark" | "light" },
  color: GuideBoxColor | undefined
) => {
  switch (color) {
    case "safe":
      return theme.mode === "light"
        ? ColorPalette["green-500"]
        : ColorPalette["green-400"];
    case "warning":
      return theme.mode === "light"
        ? ColorPalette["orange-400"]
        : ColorPalette["yellow-400"];
    case "danger":
      return theme.mode === "light"
        ? ColorPalette["red-400"]
        : ColorPalette["red-300"];
    default:
      return theme.mode === "light"
        ? ColorPalette["gray-500"]
        : ColorPalette["gray-100"];
  }
};

export const getParagraphColor = (
  theme: { mode: "dark" | "light" },
  color: GuideBoxColor | undefined
) => {
  switch (color) {
    case "safe":
      return theme.mode === "light"
        ? Color(ColorPalette["green-500"]).alpha(0.7).string()
        : ColorPalette["green-400"];
    case "warning":
      return theme.mode === "light"
        ? Color(ColorPalette["orange-400"]).alpha(0.7).string()
        : Color(ColorPalette["yellow-500"]).alpha(0.7).string();
    case "danger":
      return theme.mode === "light"
        ? Color(ColorPalette["red-400"]).alpha(0.7).string()
        : ColorPalette["red-300"];
    default:
      return ColorPalette["gray-300"];
  }
};

export const Styles = {
  Container: styled(Stack)<Pick<GuideBoxProps, "color" | "backgroundColor">>`
    border-radius: 0.5rem;
    padding: 1.125rem;

    ${({ color }) => {
      switch (color) {
        case "safe":
          return css`
            background-color: ${(props) =>
              props.theme.mode === "light"
                ? ColorPalette["green-50"]
                : ColorPalette["green-800"]};
          }
          svg {
            color: ${(props) => getTitleColor(props.theme, "safe")};
          }
          `;
        case "warning":
          return css`
            background-color: ${(props) =>
              props.theme.mode === "light"
                ? ColorPalette["orange-50"]
                : ColorPalette["yellow-800"]};
            }
            svg {
              color: ${(props) => getTitleColor(props.theme, "warning")};
            }
          `;
        case "danger":
          return css`
            background-color: ${(props) =>
              props.theme.mode === "light"
                ? ColorPalette["red-50"]
                : ColorPalette["red-800"]};
            svg {
              color: ${(props) => getTitleColor(props.theme, "danger")};
            }
          `;
        default:
          return css`
            background-color: ${(props) =>
              props.theme.mode === "light"
                ? ColorPalette["gray-50"]
                : ColorPalette["gray-600"]};
            svg {
              color: ${(props) => getTitleColor(props.theme, "default")};
            }
          `;
      }
    }};

    ${({ backgroundColor }) => {
      if (backgroundColor) {
        return css`
          background-color: ${backgroundColor};
        `;
      }
    }};
  `,
};
