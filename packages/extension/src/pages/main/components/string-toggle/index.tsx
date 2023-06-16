import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { Columns } from "../../../../components/column";
import { ColorPalette } from "../../../../styles";
import { Caption1, Caption2 } from "../../../../components/typography";
import { Skeleton } from "../../../../components/skeleton";
import { useStore } from "../../../../stores";

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
  isNotReady?: boolean;
}> = ({ tabStatus, setTabStatus, isNotReady }) => {
  const { analyticsStore } = useStore();

  const onClickTab = () => {
    const newTabStatus: TabStatus =
      tabStatus === "available" ? "staked" : "available";
    analyticsStore.logEvent("click_main_tab", {
      tabName: newTabStatus,
    });
    setTabStatus(newTabStatus);
  };

  return (
    <Columns sum={1} alignY="center" columnAlign="center">
      {tabStatus === "available" ? (
        <Skeleton type="stringToggle" isNotReady={isNotReady}>
          <Styles.Container>
            <Skeleton type="stringToggle" layer={1} isNotReady={isNotReady}>
              <Styles.Selected>Available</Styles.Selected>
            </Skeleton>
            <Styles.UnSelected onClick={onClickTab}>Staked</Styles.UnSelected>
          </Styles.Container>
        </Skeleton>
      ) : (
        <Styles.Container>
          <Styles.UnSelected onClick={onClickTab}>Available</Styles.UnSelected>
          <Styles.Selected>Staked</Styles.Selected>
        </Styles.Container>
      )}
    </Columns>
  );
};
