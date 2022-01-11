import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { MyRewardCard } from "./reward-card";
import { DelegationsCard } from "./delegations-card";
import { UndelegationsCard } from "./undelegations-card";
import { useStyle } from "../../../styles";
import { useLogScreenView } from "../../../hooks";
import { useStore } from "../../../stores";

export const StakingDashboardScreen: FunctionComponent = () => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const style = useStyle();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const unbondings = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  ).unbondingBalances;

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
      {unbondings.length > 0 ? (
        <UndelegationsCard
          containerStyle={style.flatten(["margin-bottom-card-gap"])}
        />
      ) : null}
    </PageWithScrollView>
  );
};
