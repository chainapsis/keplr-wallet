import styled from "styled-components";
import { ColorPalette } from "../../../styles";

export const Styles = {
  WarningContainer: styled.div`
    background-color: ${ColorPalette["red-50"]};
    border: 1px solid ${ColorPalette["red-100"]};
    border-radius: 1rem;
    padding: 1.75rem 2rem;

    font-size: 1rem;
    line-height: 1rem;

    color: ${ColorPalette["red-300"]};

    ul {
      margin: 0.625rem 0 0 0;
      padding-left: 1.5rem;

      line-height: 120%;
    }
  `,

  IndexText: styled.div`
    font-weight: 700;
    font-size: 1rem;
    line-height: 1rem;
    text-align: right;
    color: ${ColorPalette["platinum-300"]};

    min-width: 1.875rem;
    margin-right: 4px;
  `,
};
