import styled, { css } from "styled-components";
import { ColorPalette } from "../../styles";
import { DropdownProps } from "./types";
import { Body2 } from "../typography";
import SimpleBar from "simplebar-react";

export const Styles = {
  Container: styled.div`
    position: relative;
  `,

  SelectedContainer: styled.div<{ isOpen: boolean; size: string }>`
    display: flex;
    flex-direction: column;
    justify-content: center;

    position: relative;

    width: 100%;
    height: ${({ size }) => (size === "small" ? "2.5rem" : "3.5rem")};

    padding: 0 1rem;

    border: 1px solid
      ${({ isOpen }) =>
        isOpen ? ColorPalette["gray-200"] : ColorPalette["gray-500"]};
    border-radius: 0.5rem;
    background-color: ${ColorPalette["gray-700"]};

    cursor: pointer;
  `,
  Text: styled(Body2)<Pick<DropdownProps, "selectedItemKey">>`
    color: ${({ selectedItemKey }) =>
      selectedItemKey ? ColorPalette["gray-50"] : ColorPalette["gray-300"]};
  `,
  MenuContainer: styled(SimpleBar)<{ isOpen: boolean }>`
    position: absolute;

    width: 100%;
    max-height: 13rem;
    overflow: auto;

    margin-top: 0.375rem;

    border: 1px solid ${ColorPalette["gray-500"]};
    border-radius: 0.375rem;

    z-index: 1;

    ${({ isOpen }) => {
      if (isOpen) {
        return css`
          display: block;
        `;
      } else {
        return css`
          display: none;
        `;
      }
    }};
  `,
  MenuItem: styled(Body2)`
    display: flex;
    flex-direction: column;
    justify-content: center;

    height: 2.875rem;

    padding: 0 1.5rem;

    background-color: ${ColorPalette["gray-600"]};
    :hover {
      background-color: ${ColorPalette["gray-500"]};
    }

    cursor: pointer;
    user-select: none;
  `,
};
