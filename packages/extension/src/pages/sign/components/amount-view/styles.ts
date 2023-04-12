import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Body2, Subtitle3 } from "../../../../components/typography";

export const Styles = {
  Container: styled.div`
    padding: 1rem;

    background-color: ${ColorPalette["gray-600"]};

    border-radius: 0.375rem;
  `,
  Title: styled(Body2)`
    color: ${ColorPalette["gray-200"]};
  `,
  Amount: styled(Subtitle3)`
    color: ${ColorPalette["gray-100"]};
  `,
  Empty: styled(Subtitle3)`
    color: ${ColorPalette["gray-300"]};
  `,
};
