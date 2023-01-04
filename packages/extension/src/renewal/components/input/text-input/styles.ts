import styled, { css } from "styled-components";
import { ColorPalette } from "../../../styles";
import { TextInputProps } from "./types";

const getTextInputStyleForErrorOrParagraph = (
  error?: string,
  paragraph?: string
) => {
  if (error) {
    return css`
      border-color: ${ColorPalette["red-200"]};

      :focus-visible {
        border-color: ${ColorPalette["red-200"]};
      }
    `;
  }

  if (paragraph) {
    return;
  }
};

const getSubTextStyleForErrorOrParagraph = (
  error?: string,
  paragraph?: string
) => {
  if (error) {
    return css`
      color: ${ColorPalette["red-400"]};
    `;
  }

  if (paragraph) {
    return css`
      color: ${ColorPalette["platinum-200"]};
    `;
  }
};

export const Styles = {
  Container: styled.div`
    // Used for making button fill parent horizontally.
    margin-bottom: 1.5rem;
  `,
  TextInput: styled.input<TextInputProps & { isTextarea?: boolean }>`
    width: 100%;
    height: ${({ isTextarea }) => (isTextarea ? undefined : "3rem")};
    margin: 0;
    padding: ${({ isTextarea }) =>
      isTextarea ? "0.75rem 0.75rem" : "0 0.75rem"};
    background-color: ${ColorPalette["white"]};
    border: 1px solid ${ColorPalette["gray-100"]};
    border-radius: 0.5rem;

    :focus-visible {
      border-color: ${ColorPalette["blue-400"]};
    }

    // Remove normalized css properties
    outline: none;

    font-size: 1rem;
    font-weight: 400;
    color: ${ColorPalette["black"]};

    ${({ error, paragraph }) =>
      getTextInputStyleForErrorOrParagraph(error, paragraph)}
  `,
  Label: styled.div`
    margin-bottom: 3px;

    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5;
    color: ${ColorPalette["platinum-300"]};
  `,
  SubText: styled.div<Pick<TextInputProps, "error" | "paragraph">>`
    position: absolute;

    top: 4px;
    left: 0.5rem;

    font-weight: 400;
    font-size: 0.75rem;
    line-height: 1.15;

    ${({ error, paragraph }) =>
      getSubTextStyleForErrorOrParagraph(error, paragraph)}
  `,
};
