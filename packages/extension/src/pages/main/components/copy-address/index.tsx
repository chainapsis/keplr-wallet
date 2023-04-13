import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Caption1 } from "../../../../components/typography";
import { CopyOutlineIcon } from "../../../../components/icon";
import { Columns } from "../../../../components/column";

const Styles = {
  Container: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.125rem;

    width: 7.5rem;
    padding: 0.5rem;

    background-color: ${ColorPalette["gray-600"]};
    border-radius: 16rem;

    cursor: pointer;

    :hover {
      background-color: ${ColorPalette["gray-500"]};
    }

    svg {
      color: ${ColorPalette["gray-300"]};
    }

    user-select: none;
  `,
};

export const CopyAddress: FunctionComponent<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <Columns sum={1} alignY="center" columnAlign="center">
      <Styles.Container onClick={onClick}>
        <Caption1 style={{ color: ColorPalette["gray-300"] }}>
          Copy Address
        </Caption1>
        <CopyOutlineIcon width="1rem" height="1rem" />
      </Styles.Container>
    </Columns>
  );
};
