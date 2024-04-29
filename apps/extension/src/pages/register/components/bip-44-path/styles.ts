import styled from "styled-components";
import { ColorPalette } from "../../../../styles";

export const Styles = {
  Container: styled.div`
    position: relative;

    padding: 1.5rem 1.75rem 1.25rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-10"]
        : ColorPalette["gray-500"]};
    border-radius: 1rem;

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-100"]};
    font-size: 0.875rem;

    ul {
      line-height: 1.3;

      margin: 0;
      padding-left: 1.2rem;
    }
  `,
  Title: styled.div`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-500"]
        : ColorPalette["white"]};

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
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-500"]
        : ColorPalette["gray-100"]};

    font-size: 0.875rem;
    line-height: 1.05rem;
    font-weight: 500;
  `,
  InputsContainer: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    font-size: 1rem;
    line-height: 1.2;
    letter-spacing: 0.2px;
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette["gray-100"]};
  `,
  InputContainer: styled.div`
    flex: 1;
  `,
  LightText: styled.div`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette["gray-100"]};
  `,
};
