import styled from "styled-components";
import { ColorPalette } from "../../styles";

export const Styles = {
  CheckBoxContainer: styled.div<{ checked: boolean; disabled: boolean }>`
    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    width: 1.5rem;
    height: 1.5rem;

    color: ${({ disabled }) => {
      if (disabled) {
        return ColorPalette["gray-300"];
      }
      return ColorPalette["white"];
    }};

    background-color: ${({ checked, disabled }) =>
      disabled
        ? ColorPalette["gray-400"]
        : checked
        ? ColorPalette["blue-400"]
        : ColorPalette["gray-400"]};
    border-radius: 0.4rem;
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
