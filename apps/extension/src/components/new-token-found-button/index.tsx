import styled from "styled-components";
import { ColorPalette } from "../../styles";

export const NewTokenFoundButtonContainer = styled.div`
  background-color: ${(props) =>
    props.theme.mode === "light"
      ? ColorPalette.white
      : ColorPalette["gray-650"]};

  box-shadow: ${(props) =>
    props.theme.mode === "light"
      ? "0 1px 4px 0 rgba(43, 39, 55, 0.10)"
      : "none"};

  padding: 1rem 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;

  &:hover {
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-10"]
        : ColorPalette["gray-600"]};
  }
`;
