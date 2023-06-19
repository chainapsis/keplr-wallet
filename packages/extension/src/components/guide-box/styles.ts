import styled, { css } from "styled-components";
import { Stack } from "../stack";
import { ColorPalette } from "../../styles";
import { Body3, Subtitle4 } from "../typography";
import { GuideBoxProps } from "./types";
import Color from "color";

export const Styles = {
  Container: styled(Stack)<Pick<GuideBoxProps, "color">>`
    border-radius: 0.5rem;
    padding: 1.125rem;

    ${({ color }) => {
      switch (color) {
        case "warning":
          return css`
            background-color: rgba(210, 156, 17, 0.2);
            svg {
              color: ${ColorPalette["yellow-400"]};
            }
          `;
        case "danger":
          return css`
            background-color: ${Color(ColorPalette["red-400"])
              .alpha(0.1)
              .string()};
            svg {
              color: ${ColorPalette["red-300"]};
            }
          `;
        default:
          return css`
            background-color: ${ColorPalette["gray-600"]};
            svg {
              color: ${ColorPalette["gray-100"]};
            }
          `;
      }
    }};
  `,
  Title: styled(Subtitle4)<Pick<GuideBoxProps, "color">>`
    color: ${({ color }) => {
      switch (color) {
        case "warning":
          return ColorPalette["yellow-400"];
        case "danger":
          return ColorPalette["red-300"];
        default:
          return ColorPalette["gray-100"];
      }
    }};
  `,
  Paragraph: styled(Body3)<Pick<GuideBoxProps, "color">>`
    color: ${({ color }) => {
      switch (color) {
        case "warning":
          return ColorPalette["yellow-500"];
        case "danger":
          return ColorPalette["red-300"];
        default:
          return ColorPalette["gray-300"];
      }
    }};
  `,
};
