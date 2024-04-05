import styled, { css } from "styled-components";
import { BoxProps } from "./types";

export const Styles = {
  Container: styled.div<BoxProps>`
    position ${({ position, after }) => {
      if (position) {
        return position;
      }

      if (after) {
        return "relative";
      }

      return "static";
    }};
    width: ${({ width }) => width};
    min-width: ${({ minWidth }) => minWidth};
    max-width: ${({ maxWidth }) => maxWidth};
    height: ${({ height }) => height};
    min-height: ${({ minHeight }) => minHeight};
    max-height: ${({ maxHeight }) => maxHeight};
    color: ${({ color }) => color};
    background-color: ${({ backgroundColor }) => backgroundColor};
    border-radius: ${({ borderRadius }) => borderRadius};
    
    border-style: ${({ borderWidth }) => (borderWidth ? "solid" : undefined)};
    border-width: ${({ borderWidth }) => borderWidth};
    border-color: ${({ borderColor }) => borderColor};

    padding: ${({ padding }) => padding};
    padding-left: ${({ paddingLeft, paddingX }) => paddingLeft || paddingX};
    padding-right: ${({ paddingRight, paddingX }) => paddingRight || paddingX};
    padding-top: ${({ paddingTop, paddingY }) => paddingTop || paddingY};
    padding-bottom: ${({ paddingBottom, paddingY }) =>
      paddingBottom || paddingY};

    margin: ${({ margin }) => margin};
    margin-left: ${({ marginLeft, marginX }) => marginLeft || marginX};
    margin-right: ${({ marginRight, marginX }) => marginRight || marginX};
    margin-top: ${({ marginTop, marginY }) => marginTop || marginY};
    margin-bottom: ${({ marginBottom, marginY }) => marginBottom || marginY};

    z-index: ${({ zIndex }) => zIndex};
    
    display: flex;
    flex-direction: column;
    align-items: ${({ alignX }) => {
      if (alignX === "left") {
        return "flex-start";
      }
      if (alignX === "center") {
        return "center";
      }
      if (alignX === "right") {
        return "flex-end";
      }
    }};
    justify-content: ${({ alignY }) => {
      if (alignY === "top") {
        return "flex-start";
      }
      if (alignY === "center") {
        return "center";
      }
      if (alignY === "bottom") {
        return "flex-end";
      }
    }};
    
    cursor: ${({ cursor }) => cursor};
    
    ${({ hover }) => {
      if (hover) {
        return css`
          &:hover {
            color: ${hover.color};
            background-color: ${hover.backgroundColor};
            border-style: ${hover.borderWidth ? "solid" : undefined};
            border-width: ${hover.borderWidth};
            border-color: ${hover.borderColor};
          }
        `;
      }
    }};
    
    ${({ after }) => {
      if (after) {
        return css`
          &::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: ${after.backgroundColor};
            border-radius: ${after.borderRadius};
          }
        `;
      }
    }};
  `,
};
