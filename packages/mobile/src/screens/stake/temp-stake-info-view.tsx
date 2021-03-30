import React, { FunctionComponent } from "react";
import { StakedCard } from "./staked-card";
import { UnbondingCard } from "./unbonding-card";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

export const TempStakeInfoView: FunctionComponent<{
  chainId: string;
}> = observer(({ chainId }) => {
  const { accountStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainId);

  const unbondings = queries
    .getQueryUnbondingDelegations()
    .getQueryBech32Address(accountStore.getAccount(chainId).bech32Address)
    .unbondings;

  return (
    <React.Fragment>
      <StakedCard chainId={chainId} />
      {unbondings.length > 0 ? <UnbondingCard chainIds={[chainId]} /> : null}
    </React.Fragment>
  );
});
