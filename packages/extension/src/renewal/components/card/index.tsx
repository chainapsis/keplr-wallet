import React, { FunctionComponent, CSSProperties } from "react";
import styled from "styled-components";

export interface CardProps {
  padding?: string;
  paddingHorizontal?: string;
  paddingVertical?: string;
  backgroundColor?: string;
  borderRadius?: string;

  className?: string;
  style?: CSSProperties;
}

export const Styles = {
  Container: styled.div<CardProps>`
    // TODO: Set some defaults.
    padding: ${(props) => props.padding};
    padding-top: ${(props) => props.paddingVertical};
    padding-bottom: ${(props) => props.paddingVertical};
    padding-left: ${(props) => props.paddingHorizontal};
    padding-right: ${(props) => props.paddingHorizontal};
    background-color: ${(props) => props.backgroundColor};
    border-radius: ${(props) => props.borderRadius};
  `,
};

export const Card: FunctionComponent<CardProps> = (props) => {
  return <Styles.Container {...props} />;
};
