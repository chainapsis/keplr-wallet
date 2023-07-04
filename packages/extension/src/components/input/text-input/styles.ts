import styled, { css } from "styled-components";
import { ColorPalette } from "../../../styles";
import { TextInputProps } from "./types";
import { Caption2 } from "../../typography";

const getTextInputStyleForErrorOrParagraph = (
  error?: string,
  paragraph?: string,
  errorBorder?: boolean
) => {
  if (error || errorBorder) {
    return css`
      border-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["orange-400"]
          : ColorPalette["yellow-400"]};

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
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["orange-400"]
          : ColorPalette["yellow-400"]};
    `;
  }

  if (paragraph) {
    return css`
      color: ${ColorPalette["platinum-200"]};
    `;
  }
};

const DisableStyle = css`
  background-color: ${(props) =>
    props.theme.mode === "light"
      ? ColorPalette["white"]
      : ColorPalette["gray-600"]};
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
  TextInputContainer: styled.div<
    Pick<TextInputProps, "error" | "disabled" | "paragraph" | "errorBorder"> & {
      isTextarea?: boolean;
    }
  >`
    border: 1px solid
      ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-400"]};
    border-radius: 0.5rem;
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["white"]
        : ColorPalette["gray-700"]};

    :focus-within {
      ${({ error }) => {
        if (error) {
          return css`
            border-color: ${(props) =>
              props.theme.mode === "light"
                ? ColorPalette["orange-400"]
                : ColorPalette["yellow-400"]};
          `;
        } else {
          return css`
            border-color: ${(props) =>
              props.theme.mode === "light"
                ? ColorPalette["blue-400"]
                : ColorPalette["gray-200"]};
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
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["white"]
        : ColorPalette["gray-700"]};
    border: 0;
    border-radius: 0.5rem;

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette["gray-50"]};

    ::placeholder {
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-200"]
          : ColorPalette["gray-400"]};
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
