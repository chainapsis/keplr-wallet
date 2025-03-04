import styled from "styled-components";
import { ColorPalette } from "../../../styles";
import React, { FunctionComponent } from "react";
import Color from "color";

export const Input: FunctionComponent<
  React.InputHTMLAttributes<HTMLInputElement> & {
    warning?: boolean;
    suffix?: string;
  }
> = ({ warning, suffix, value, ...props }) => {
  return (
    <InputContainer>
      <StyledInput warning={warning} value={value ?? ""} {...props} />
      {suffix && value && <Suffix isWarning={!!warning}>{suffix}</Suffix>}
    </InputContainer>
  );
};

const StyledInput = styled.input<{ warning?: boolean }>`
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 2.25rem;

  width: ${(props) =>
    props.value?.toString().length
      ? `${
          props.value.toString().length +
          (props.value.toString().includes(".") ? 0.2 : 0.5)
        }ch`
      : "100%"};

  background: none;

  border: 0;

  color: ${(props) =>
    props.warning
      ? ColorPalette["red-300"]
      : props.theme.mode === "light"
      ? ColorPalette["gray-700"]
      : ColorPalette.white};

  ::placeholder {
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-200"]
        : ColorPalette["gray-300"]};
  }

  // Remove normalized css properties
  outline: none;

  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const InputContainer = styled.div`
  overflow: scroll;
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;

  margin: 0;
  padding: 0.25rem;
  padding-bottom: 0.75rem;

  border-bottom: 1px solid
    ${(props) =>
      props.theme.mode === "light"
        ? Color(ColorPalette["gray-200"]).alpha(0.5).toString()
        : Color(ColorPalette["gray-300"]).alpha(0.5).toString()};
`;

const Suffix = styled.span<{ isWarning?: boolean }>`
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 2.25rem;

  color: ${(props) =>
    props.isWarning
      ? ColorPalette["red-300"]
      : props.theme.mode === "light"
      ? ColorPalette["gray-700"]
      : ColorPalette.white};
`;
