import styled, { css } from "styled-components";
import { ColorPalette } from "../../../styles";
import { TextInputProps } from "./types";
import { Caption2 } from "../../typography";

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
    position: relative;
    ::after {
      // Border를 그리기 위해 사용하는 부분임
      // 이 부분 없이 Container 자체에 border를 그리면
      // border가 자리를 차지해서 Container의 크기를 늘리게 됨
      // 이 문제를 해결하기 위해서 이런 트릭을 사용함
      content: "";

      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;

      border-width: 1px;
      border-style: solid;
      border-color: ${(props) => {
        if (props.error || props.errorBorder) {
          return props.theme.mode === "light"
            ? ColorPalette["orange-400"]
            : ColorPalette["yellow-400"];
        }

        return props.theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-400"];
      }};
      border-radius: 0.5rem;

      pointer-events: none;
    }
    :focus-within {
      ${({ error, errorBorder }) => {
        if (error || errorBorder) {
          return css`
            ::after {
              border-color: ${(props) =>
                props.theme.mode === "light"
                  ? ColorPalette["orange-400"]
                  : ColorPalette["yellow-400"]};
            }
          `;
        } else {
          return css`
            ::after {
              border-color: ${(props) =>
                props.theme.mode === "light"
                  ? ColorPalette["blue-400"]
                  : ColorPalette["gray-200"]};
            }
          `;
        }
      }}
    }

    border-radius: 0.5rem;
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["white"]
        : ColorPalette["gray-700"]};

    ${({ disabled }) => {
      if (disabled) {
        return DisableStyle;
      }
    }}
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
