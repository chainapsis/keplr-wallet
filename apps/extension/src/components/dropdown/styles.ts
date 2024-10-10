import styled, { css } from "styled-components";
import { ColorPalette } from "../../styles";
import { DropdownProps } from "./types";
import { Body2 } from "../typography";
import SimpleBar from "simplebar-react";

export const Styles = {
  Container: styled.div`
    position: relative;
  `,

  DropdownContainer: styled.div<{
    direction: "up" | "down";
  }>`
    display: flex;
    flex-direction: ${(props) =>
      props.direction === "down" ? "column" : "column-reverse"};
    position: relative;
  `,

  SelectedContainer: styled.div<{
    isOpen: boolean;
    size: string;
    color: "default" | "text-input";
  }>`
    display: flex;
    flex-direction: column;
    justify-content: center;

    position: relative;

    width: 100%;
    height: ${({ size }) => (size === "small" ? "2.5rem" : "3.25rem")};

    padding: 0 1rem;

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette.white};

    border: 1px solid
      ${({ isOpen, theme, color }) => {
        if (color === "text-input") {
          return isOpen
            ? theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-200"]
            : theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-400"];
        }

        return isOpen
          ? theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
          : theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-500"];
      }};
    border-radius: 0.5rem;
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-700"]};

    cursor: pointer;
  `,
  Text: styled(Body2)<Pick<DropdownProps, "selectedItemKey">>`
    color: ${({ selectedItemKey, theme }) =>
      selectedItemKey
        ? theme.mode === "light"
          ? ColorPalette["gray-400"]
          : ColorPalette["gray-50"]
        : ColorPalette["gray-300"]};
  `,
  MenuContainer: styled.div.withConfig<{
    isOpen: boolean;
    direction: "up" | "down";
    size: string;
  }>({
    shouldForwardProp: (prop) => {
      if (prop === "isOpen") {
        return false;
      }
      return true;
    },
  })`
    position: absolute;
    ${({ direction, size }) =>
      direction === "down"
        ? ""
        : size === "small"
        ? "bottom: 2.5rem;"
        : "bottom: 3.25rem;"}

    width: 100%;

    ${({ direction }) =>
      direction === "down"
        ? "margin-top: 0.375rem"
        : "margin-bottom: 0.375rem"};

    z-index: 1;

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-500"]};

    border: 1px solid
      ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-500"]};
    border-radius: 0.375rem;

    overflow: hidden;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-50"]
        : ColorPalette["gray-600"]};

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

  MenuItemsContainer: styled.div<{ direction: "up" | "down" }>`
    display: flex;
    flex-direction: ${({ direction }) =>
      direction === "down" ? "column" : "column-reverse"};
  `,

  MenuContainerScroll: styled(SimpleBar).withConfig<{
    menuContainerMaxHeight?: string;
  }>({
    shouldForwardProp: (prop) => {
      if (prop === "menuContainerMaxHeight") {
        return false;
      }
      return true;
    },
  })`
    max-height: ${({ menuContainerMaxHeight }) =>
      menuContainerMaxHeight || "13rem"};
    overflow: auto;
  `,
  MenuItem: styled(Body2)`
    display: flex;
    flex-direction: column;
    justify-content: center;

    height: 2.875rem;

    padding: 0 1.5rem;

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette.white};

    :hover {
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-500"]};
    }

    cursor: pointer;
    user-select: none;
  `,
};
