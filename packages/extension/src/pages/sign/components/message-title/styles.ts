import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { H5 } from "../../../../components/typography";

export const Styles = {
  Title: styled(H5)`
    color: ${ColorPalette["gray-50"]};
  `,
  Bold: styled.span`
    color: ${ColorPalette["blue-400"]};
  `,
  ViewData: styled.div`
    cursor: pointer;
  `,
};
