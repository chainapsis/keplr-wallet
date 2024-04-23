import React, { FunctionComponent } from "react";
import styled from "styled-components";

export type GutterDirection = "both" | "vertical" | "horizontal";

export interface GutterProps {
  size: string;
  direction?: GutterDirection;
}

const Styles = {
  Container: styled.div<GutterProps>`
    width: ${({ size, direction }) => {
      if (direction === "vertical") {
        return "1px";
      }

      return size;
    }};
    min-width: ${({ size, direction }) => {
      if (direction === "vertical") {
        return "1px";
      }

      return size;
    }};
    height: ${({ size, direction }) => {
      if (direction === "horizontal") {
        return "1px";
      }

      return size;
    }};
    min-height: ${({ size, direction }) => {
      if (direction === "horizontal") {
        return "1px";
      }

      return size;
    }};
  `,
};

export const Gutter: FunctionComponent<GutterProps> = (props) => {
  return <Styles.Container {...props} />;
};
