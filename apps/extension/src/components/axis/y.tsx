import React, { FunctionComponent, PropsWithChildren } from "react";
import { YAxisProps } from "./types";
import styled from "styled-components";

const Styles = {
  YAxis: styled.div<YAxisProps>`
    display: flex;
    flex-direction: column;
    align-items: ${({ alignX }) => {
      switch (alignX) {
        case "left":
          return "flex-start";
        case "right":
          return "flex-end";
        case "center":
          return "center";
      }
    }};
  `,
};

export const YAxis: FunctionComponent<PropsWithChildren<YAxisProps>> = ({
  children,
  ...props
}) => {
  return <Styles.YAxis {...props}>{children}</Styles.YAxis>;
};
