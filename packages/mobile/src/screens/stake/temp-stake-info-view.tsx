import React, { FunctionComponent } from "react";
import { TotalStakedCard } from "./total-staked-card";
import { UnbondingCard } from "./unbonding-card";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

export const TempStakeInfoView: FunctionComponent = observer(() => {
  const { accountStore, queriesStore, chainStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const unbondings = queries
    .getQueryUnbondingDelegations()
    .getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    ).unbondings;

  return (
    <React.Fragment>
      <TotalStakedCard />
      {unbondings.length > 0 ? <UnbondingCard unbondings={unbondings} /> : null}
    </React.Fragment>
  );
});
