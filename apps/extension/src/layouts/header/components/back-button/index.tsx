import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ArrowLeftIcon } from "../../../../components/icon";
import { useNavigate } from "react-router";
import { ColorPalette } from "../../../../styles";

export const BackButton: FunctionComponent<{
  hidden?: boolean;
  onClick?: () => void;
  color?: string;
}> = ({ hidden, onClick, color = ColorPalette["gray-300"] }) => {
  const navigate = useNavigate();

  if (window.history.state && window.history.state.idx === 0) {
    return null;
  }

  if (hidden) {
    return null;
  }

  return (
    <BackButtonContainer onClick={() => (onClick ? onClick() : navigate(-1))}>
      <ArrowLeftIcon color={color} />
    </BackButtonContainer>
  );
};

const BackButtonContainer = styled.div`
  padding-left: 1rem;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
`;
