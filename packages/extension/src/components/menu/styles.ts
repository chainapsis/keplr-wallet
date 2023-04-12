import { ColorPalette } from "../../styles";
import styled from "styled-components";
import { MenuProps } from "./types";

export const Styles = {
  Container: styled.ul<Pick<MenuProps, "isOpen" | "ratio"> & { width: number }>`
    display: ${(props) => (props.isOpen ? "block" : "none")};
    margin: ${(props) => `0 0 0 -${props.width * (props.ratio ?? 1)}px`};
    padding: 0;
    position: absolute;
    list-style: none;
    background-color: ${ColorPalette["gray-400"]};
    border-radius: 0.5rem;
  `,
  Item: styled.li`
    padding: 0.75rem;

    :hover {
      color: ${ColorPalette["gray-200"]};
    }
  `,
};
