import styled from "styled-components";
import { ColorPalette } from "../../../styles";
import React, { FunctionComponent } from "react";

export const Input: FunctionComponent<
  React.InputHTMLAttributes<HTMLInputElement> & { warning?: boolean }
> = ({ warning, ...props }) => {
  return <StyledInput warning={warning} {...props} />;
};

const StyledInput = styled.input<{ warning?: boolean }>`
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 2.25rem;

  width: 100%;

  background: none;
  margin: 0;
  padding: 0.25rem;
  padding-bottom: 0.75rem;

  border: 0;
  border-bottom: 1px solid
    ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-200"]
        : ColorPalette["gray-300"]};

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
