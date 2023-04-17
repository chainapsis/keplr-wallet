import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { Body2, Subtitle1 } from "../typography";

export const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    gap: 0.5rem;

    margin-left: 2rem;
    margin-right: 2rem;
    padding: 1.5rem 1.25rem;

    background-color: ${ColorPalette["gray-600"]};
    border-radius: 0.5rem;
  `,
  Title: styled(Subtitle1)`
    color: ${ColorPalette["gray-10"]};
  `,
  Paragraph: styled(Body2)`
    color: ${ColorPalette["gray-200"]};
  `,
};
