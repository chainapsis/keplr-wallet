import React, { FunctionComponent } from "react";
import styled from "styled-components";

export type GutterProps = {
  size: string;
};

export const Container = styled.div<GutterProps>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;

export const Gutter: FunctionComponent<GutterProps> = (props) => {
  return <Container {...props} />;
};
