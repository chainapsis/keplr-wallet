import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { MyRewardCard } from "./reward-card";
import { DelegationsCard } from "./delegations-card";
import { useStyle } from "../../../styles";
import { useLogScreenView } from "../../../hooks";
import { useStore } from "../../../stores";

export const StakingDashboardScreen: FunctionComponent = () => {
  const style = useStyle();
  const { chainStore } = useStore();

  useLogScreenView("Staking dashboard", {
    chainId: chainStore.current.chainId,
    chainName: chainStore.current.chainName,
  });

  return (
    <PageWithScrollView>
      <MyRewardCard containerStyle={style.flatten(["margin-y-card-gap"])} />
      <DelegationsCard
        containerStyle={style.flatten(["margin-bottom-card-gap"])}
      />
    </PageWithScrollView>
  );
};
