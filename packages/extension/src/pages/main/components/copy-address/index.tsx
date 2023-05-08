import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Caption1 } from "../../../../components/typography";
import { CopyOutlineIcon } from "../../../../components/icon";
import { XAxis, YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { Skeleton } from "../../../../components/skeleton";

export const CopyAddressRadius = "16rem";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    padding: 3.5px 0.5rem;

    background-color: ${ColorPalette["gray-600"]};
    border-radius: ${CopyAddressRadius};

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
    <YAxis alignX="center">
      <XAxis alignY="center">
        <Skeleton type="copyAddress">
          <Styles.Container onClick={onClick}>
            <Caption1 style={{ color: ColorPalette["gray-300"] }}>
              Copy Address
            </Caption1>
            <Gutter size="2px" />
            <CopyOutlineIcon width="1rem" height="1rem" />
          </Styles.Container>
        </Skeleton>
      </XAxis>
    </YAxis>
  );
};
