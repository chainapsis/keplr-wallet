import styled from "styled-components";
import { ColorPalette } from "../../styles";

export const ContextMenuStyles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    background-color: ${({ theme }) =>
      theme.mode === "light"
        ? "rgba(254, 254, 254, 0.80)"
        : "rgba(46, 46, 50, 0.5)"};
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);

    filter: drop-shadow(0 10px 50px rgba(43, 39, 55, 0.05))
      drop-shadow(0 5px 30px rgba(43, 39, 55, 0.05))
      drop-shadow(0 1px 3px rgba(43, 39, 55, 0.1));

    border-radius: 0.5rem;
    overflow: hidden;
  `,
  Item: styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;

    color: ${({ theme }) =>
      theme.mode === "light" ? ColorPalette["gray-700"] : ColorPalette.white};

    &:hover {
      background-color: ${({ theme }) =>
        theme.mode === "light"
          ? "rgba(242, 242, 246, 0.80)"
          : "rgba(53, 53, 57, 0.50)"};
    }
  `,
};
