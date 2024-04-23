import React, { FunctionComponent, PropsWithChildren } from "react";
import { ColumnProps } from "./types";
import styled from "styled-components";

const Styles = {
  Container: styled.div<ColumnProps>`
    flex: ${({ weight }) => `${weight} ${weight} 0%`};
  `,
};

export const Column: FunctionComponent<PropsWithChildren<ColumnProps>> = ({
  children,
  weight,
}) => {
  if (weight < 0) {
    weight = 0;
  }

  return <Styles.Container weight={weight}>{children}</Styles.Container>;
};
