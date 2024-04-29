import styled from "styled-components";
import { ColorPalette } from "../../../../styles";

export const StakeWithKeplrDashboardButton = styled.button`
  position: relative;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  font-weight: 500;
  font-size: 0.875rem;

  height: 3rem;

  color: ${(props) =>
    props.theme.mode === "light"
      ? ColorPalette["gray-500"]
      : ColorPalette["gray-10"]};

  cursor: pointer;
  // Remove normalized css properties.
  border-width: 0;
  border-style: none;
  border-color: transparent;
  border-image: none;
  padding: 0;

  // 아래부터는 gradient가 적용된 border를 그리기 위한 trick들임.
  border-radius: 0.375rem;
  // z-index를 꼭 0로 해야됨... 초기값이 0이 아닌가봄...
  z-index: 0;

  background: linear-gradient(90deg, #00c2ff 0%, #db00ff 100%);

  :hover {
    :before {
      background: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-550"]};
    }
  }

  :before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    // z-index가 0이면 text를 가려버린다. 이유는 나도 잘 모르는데 그냥 이렇게 하면 해결되길래 해놓음
    z-index: -1;
    margin: 1px;
    border-radius: inherit;
    background: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  }
`;
