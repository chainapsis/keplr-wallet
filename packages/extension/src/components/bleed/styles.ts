import styled from "styled-components";
import { BleedProps } from "./types";

export const Styles = {
  Container: styled.div<BleedProps>`
    margin-top: ${({ top, vertical }) => {
      if (top) {
        return "-" + top;
      }
      if (vertical) {
        return "-" + vertical;
      }
    }};
    margin-bottom: ${({ bottom, vertical }) => {
      if (bottom) {
        return "-" + bottom;
      }
      if (vertical) {
        return "-" + vertical;
      }
    }};
    margin-left: ${({ left, horizontal }) => {
      if (left) {
        return "-" + left;
      }
      if (horizontal) {
        return "-" + horizontal;
      }
    }};
    margin-right: ${({ right, horizontal }) => {
      if (right) {
        return "-" + right;
      }
      if (horizontal) {
        return "-" + horizontal;
      }
    }};
  `,
};
