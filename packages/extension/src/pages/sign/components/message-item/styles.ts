import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Body3, H5 } from "../../../../components/typography";

export const Styles = {
  Container: styled.div`
    padding: 1rem;
    background-color: ${ColorPalette["gray-600"]};

    :not(:last-child) {
      border-bottom: 1px solid ${ColorPalette["gray-500"]};
    }
  `,
  IconContainer: styled.div`
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
    margin-right: 0.75rem;
    background-color: ${ColorPalette["gray-400"]};
    border-radius: 50%;
  `,
  Title: styled(H5)`
    color: ${ColorPalette["gray-10"]};
  `,
  Paragraph: styled(Body3)`
    color: ${ColorPalette["gray-200"]};
  `,
};
