import React, { FunctionComponent, PropsWithChildren } from "react";
import { XAxisProps } from "./types";
import styled from "styled-components";

const Styles = {
  XAxis: styled.div.withConfig({
    shouldForwardProp: (prop, defaultValidatorFn) =>
      !["wrap", "alignY", "gap"].includes(prop) && defaultValidatorFn(prop),
  })<XAxisProps>`
    display: flex;
    flex-direction: row;
    flex-wrap: ${({ wrap }) => {
      switch (wrap) {
        case "wrap":
          return "wrap";
        case "wrap-reverse":
          return "wrap-reverse";
        default:
          return "nowrap";
      }
    }};
    align-items: ${({ alignY }) => {
      switch (alignY) {
        case "top":
          return "flex-start";
        case "bottom":
          return "flex-end";
        case "center":
          return "center";
        default:
      }
    }};
    gap: ${({ gap }) => gap};
  `,
};

export const XAxis: FunctionComponent<PropsWithChildren<XAxisProps>> = ({
  children,
  ...props
}) => {
  return <Styles.XAxis {...props}>{children}</Styles.XAxis>;
};
