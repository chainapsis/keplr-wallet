import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { CheckBoxProps, CheckBoxSize } from "./types";

const makeCheckBoxSize = (size?: CheckBoxSize) => {
  switch (size) {
    case "extra-small":
      return "0.75rem";
    case "small":
      return "1rem";
    default:
      return "1.5rem";
  }
};

export const Styles = {
  CheckBoxContainer: styled.div<Omit<CheckBoxProps, "onChange">>`
    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    width: ${({ size }) => makeCheckBoxSize(size)};
    height: ${({ size }) => makeCheckBoxSize(size)};

    color: ${({ disabled }) => {
      if (disabled) {
        return ColorPalette["gray-300"];
      }
      return ColorPalette["white"];
    }};

    background-color: ${({ checked, disabled, theme }) =>
      disabled
        ? theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-400"]
        : checked
        ? ColorPalette["blue-400"]
        : theme.mode === "light"
        ? ColorPalette["gray-100"]
        : ColorPalette["gray-400"]};
    border-radius: ${({ size }) => {
      switch (size) {
        case "extra-small":
          return "0.2rem";
        case "small":
          return "0.25rem";
        default:
          return "0.4rem";
      }
    }};

    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  `,
  HiddenCheckBox: styled.input.attrs({ type: "checkbox" })`
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  `,
};
