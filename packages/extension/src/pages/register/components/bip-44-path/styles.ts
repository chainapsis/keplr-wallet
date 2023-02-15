import styled from "styled-components";
import { ColorPalette } from "../../../../styles";

export const Styles = {
  Container: styled.div`
    position: relative;

    padding: 1.5rem 1.75rem 1.25rem;

    background-color: ${ColorPalette["platinum-50"]};
    border-radius: 1rem;

    color: ${ColorPalette["platinum-300"]};
    font-size: 0.875rem;

    ul {
      line-height: 1.3;

      margin: 0;
      padding-left: 1.2rem;
    }
  `,
  Title: styled.div`
    color: ${ColorPalette["blue-400"]};

    font-size: 0.875rem;
    line-height: 1.125rem;
    letter-spacing: 0.2px;
    font-weight: 700;
  `,
  CloseContainer: styled.div`
    position: absolute;

    top: 1.25rem;
    right: 1.25rem;

    cursor: pointer;
  `,
  SubTitle: styled.div`
    color: ${ColorPalette["platinum-300"]};

    font-size: 0.875rem;
    line-height: 0.875rem;
    font-weight: 700;
  `,
  InputsContainer: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    font-size: 1rem;
    line-height: 1.2;
    letter-spacing: 0.2px;
    color: ${ColorPalette["platinum-500"]};
  `,
  InputContainer: styled.div`
    flex: 1;
  `,
  LightText: styled.div`
    color: ${ColorPalette["platinum-100"]};
  `,
};
