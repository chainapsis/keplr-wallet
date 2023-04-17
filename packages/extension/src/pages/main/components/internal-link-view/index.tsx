import styled from "styled-components";
import React, { FunctionComponent } from "react";
import { useNavigate } from "react-router";
import { ColorPalette } from "../../../../styles";
import { Button2 } from "../../../../components/typography";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    background-color: ${ColorPalette["gray-600"]};
    border: 1px solid rgba(44, 75, 226, 0.5);
    border-radius: 0.375rem;
  `,
  TextButton: styled(Button2)`
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    height: 2.5rem;
    margin: 0.25rem;

    border-radius: 0.375rem;

    cursor: pointer;
    user-select: none;

    :hover {
      background-color: ${ColorPalette["gray-500"]};
    }
  `,
  Divider: styled.div`
    height: 1.375rem;

    border: 1px solid rgba(255, 255, 255, 0.3);
  `,
};

export const InternalLinkView: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <Styles.Container>
      <Styles.TextButton onClick={() => navigate("/setting/chain/list")}>
        Manage Chain List
      </Styles.TextButton>

      <Styles.Divider />

      <Styles.TextButton>Go to Dashboard</Styles.TextButton>
    </Styles.Container>
  );
};
