import styled from "styled-components";
import { ColorPalette } from "../../../../styles";

export const StakeWithKeplrDashboardButton = styled.button`
  font-weight: 500;
  font-size: 0.875rem;

  height: 3rem;

  color: ${ColorPalette["white"]};
  border: 1px solid ${ColorPalette["blue-400"]};

  border-radius: 6px;

  cursor: pointer;

  background-color: ${ColorPalette["gray-600"]};

  :hover {
    background-color: ${ColorPalette["gray-550"]};
  }
`;
