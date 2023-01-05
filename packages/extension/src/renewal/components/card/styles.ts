import styled from "styled-components";
import { CardProps } from "./types";
import { Box } from "../box";

export const Styles = {
  Container: styled(Box)<CardProps>`
    border: ${({ border }) => border};
  `,
};
