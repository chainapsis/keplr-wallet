import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

export type BoxProps = {
  className?: string;

  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  background?: string;
  display?: "block" | "inline" | "inline-block" | "flex" | "none";
  position?: "static" | "relative" | "absolute";
  alignItems?: "left" | "center" | "right";
  justifyContent?: "start" | "center" | "end";
  flexDirection?:
    | "row"
    | "row-reverse"
    | "column"
    | "column-reverse"
    | "vertical"
    | "horizontal";
  borderRadius?: string;
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  zIndex?: number;
  textAlign?: "left" | "center" | "right";
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  borderWidth?: string;
  borderColor?: string;
};

const Container = styled(motion.div)<BoxProps>`
  box-sizing: border-box;
  width: ${({ width }) => width};
  min-width: ${({ minWidth }) => minWidth};
  max-width: ${({ maxWidth }) => maxWidth};
  height: ${({ height }) => height};
  min-height: ${({ minHeight }) => minHeight};
  max-height: ${({ maxHeight }) => maxHeight};
  flex: ${({ flex }) => flex};
  flex-grow: ${({ flexGrow }) => flexGrow};
  flex-shrink: ${({ flexShrink }) => flexShrink};
  background: ${({ background }) => background};
  display: ${({ display }) => display};
  align-items: ${({ alignItems }) => {
    switch (alignItems) {
      case "left":
        return "flex-start";
      case "center":
        return "center";
      case "right":
        return "flex-end";
    }
  }};
  justify-content: ${({ justifyContent }) => {
    switch (justifyContent) {
      case "start":
        return "flex-start";
      case "center":
        return "center";
      case "end":
        return "flex-end";
    }
  }};
  flex-direction: ${({ flexDirection }) => {
    switch (flexDirection) {
      case "vertical":
        return "column";
      case "horizontal":
        return "row";
      default:
        return flexDirection;
    }
  }};
  border-radius: ${({ borderRadius }) => borderRadius};
  padding: ${({ padding }) => padding};
  padding-top: ${({ paddingTop }) => paddingTop};
  padding-bottom: ${({ paddingBottom }) => paddingBottom};
  padding-left: ${({ paddingLeft }) => paddingLeft};
  padding-right: ${({ paddingRight }) => paddingRight};
  margin: ${({ margin }) => margin};
  margin-top: ${({ marginTop }) => marginTop};
  margin-bottom: ${({ marginBottom }) => marginBottom};
  margin-left: ${({ marginLeft }) => marginLeft};
  margin-right: ${({ marginRight }) => marginRight};
  z-index: ${({ zIndex }) => zIndex};
  text-align: ${({ textAlign }) => {
    switch (textAlign) {
      case "left":
        return "start";
      case "center":
        return "center";
      case "right":
        return "end";
    }
  }};
  overflow: ${({ overflow }) => overflow};
  border-width: ${({ borderWidth }) => borderWidth};
  border-color: ${({ borderColor }) => borderColor};
  border-style: ${({ borderWidth, borderColor }) => {
    if (borderWidth && borderColor) {
      return "solid";
    }
  }};
`;

export const Box: FunctionComponent<BoxProps> = ({ children, ...props }) => {
  return (
    <Container layout {...props}>
      {children}
    </Container>
  );
};
