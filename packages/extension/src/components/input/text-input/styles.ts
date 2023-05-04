import styled, { css } from "styled-components";
import { ColorPalette } from "../../../styles";
import { TextInputProps } from "./types";
import { Caption2, Subtitle3 } from "../../typography";

const getTextInputStyleForErrorOrParagraph = (
  error?: string,
  paragraph?: string,
  errorBorder?: boolean
) => {
  if (error || errorBorder) {
    return css`
      border-color: ${ColorPalette["yellow-400"]};

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
      color: ${ColorPalette["yellow-400"]};
    `;
  }

  if (paragraph) {
    return css`
      color: ${ColorPalette["platinum-200"]};
    `;
  }
};

const DisableStyle = css`
  background-color: ${ColorPalette["gray-600"]};
  cursor: not-allowed;

  svg {
    color: ${ColorPalette["gray-300"]};
  }
`;

export const Styles = {
  Container: styled.div<{ isTextarea?: boolean }>`
    // Without this, text-area's height will be expanded slightly.
    // I don't know why yet :(
    line-height: ${({ isTextarea }) => (isTextarea ? 0 : undefined)};
  `,
  TextInputContainer: styled.div<TextInputProps & { isTextarea?: boolean }>`
    border: 1px solid ${ColorPalette["gray-400"]};
    border-radius: 0.5rem;
    background-color: ${ColorPalette["gray-700"]};

    :focus-within {
      ${({ error }) => {
        if (error) {
          return css`
            border-color: ${ColorPalette["yellow-400"]};
          `;
        } else {
          return css`
            border-color: ${ColorPalette["gray-200"]};
          `;
        }
      }}
    }

    ${({ disabled }) => {
      if (disabled) {
        return DisableStyle;
      }
    }}

    ${({ error, paragraph, errorBorder }) =>
      getTextInputStyleForErrorOrParagraph(error, paragraph, errorBorder)}
  `,
  TextInput: styled.input<TextInputProps & { isTextarea?: boolean }>`
    width: 100%;
    height: ${({ isTextarea }) => (isTextarea ? undefined : "3.25rem")};
    margin: 0;
    padding: ${({ isTextarea }) =>
      isTextarea ? "0.75rem 0.75rem" : "0 0.75rem"};
    background-color: ${ColorPalette["gray-700"]};
    border: 0;
    border-radius: 0.5rem;

    color: ${ColorPalette["gray-50"]};

    ::placeholder {
      color: ${ColorPalette["gray-400"]};
    }

    ${({ disabled }) => {
      if (disabled) {
        return DisableStyle;
      }
    }}

    // Remove normalized css properties
    outline: none;

    font-size: 0.875rem;
    font-weight: 400;

    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    ::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `,
  Label: styled(Subtitle3)`
    margin-bottom: 0.375rem;
    color: ${ColorPalette["gray-100"]};
  `,
  SubText: styled(Caption2)<Pick<TextInputProps, "error" | "paragraph">>`
    margin-top: 4px;
    ${({ error, paragraph }) =>
      getSubTextStyleForErrorOrParagraph(error, paragraph)}
  `,
  Icon: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;

    height: 1px;

    color: ${ColorPalette["gray-400"]};
  `,
};
