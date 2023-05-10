import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { Columns } from "../../../../components/column";
import { ColorPalette } from "../../../../styles";
import { Caption1, Caption2 } from "../../../../components/typography";
import { Skeleton } from "../../../../components/skeleton";

export const StringToggleRadius = "12rem";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    height: 1.875rem;
    width: 11.75rem;

    padding: 0 0.125rem;
    border-radius: ${StringToggleRadius};

    background-color: ${ColorPalette["gray-600"]};
  `,
  Selected: styled(Caption1)`
    display: flex;
    justify-content: center;
    align-items: center;

    height: 1.625rem;
    width: 5.75rem;
    border-radius: ${StringToggleRadius};

    background-color: ${ColorPalette["gray-400"]};

    cursor: pointer;

    user-select: none;
  `,
  UnSelected: styled(Caption2)`
    display: flex;
    justify-content: center;
    align-items: center;

    color: ${ColorPalette["gray-300"]};

    height: 1.625rem;
    width: 5.75rem;
    border-radius: ${StringToggleRadius};

    cursor: pointer;

    user-select: none;
  `,
};

export type TabStatus = "available" | "staked";

export const StringToggle: FunctionComponent<{
  tabStatus: TabStatus;
  setTabStatus: (tabStatus: TabStatus) => void;
}> = ({ tabStatus, setTabStatus }) => {
  return (
    <Columns sum={1} alignY="center" columnAlign="center">
      {tabStatus === "available" ? (
        <Skeleton type="stringToggle">
          <Styles.Container>
            <Skeleton type="stringToggle" layer={1}>
              <Styles.Selected>Available</Styles.Selected>
            </Skeleton>
            <Styles.UnSelected onClick={() => setTabStatus("staked")}>
              Staked
            </Styles.UnSelected>
          </Styles.Container>
        </Skeleton>
      ) : (
        <Styles.Container>
          <Styles.UnSelected onClick={() => setTabStatus("available")}>
            Available
          </Styles.UnSelected>
          <Styles.Selected>Staked</Styles.Selected>
        </Styles.Container>
      )}
    </Columns>
  );
};
