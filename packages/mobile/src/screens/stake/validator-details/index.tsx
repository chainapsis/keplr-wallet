import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ValidatorDetailsCard } from "./validator-details-card";
import { useStyle } from "../../../styles";
import { DelegatedCard } from "./delegated-card";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Dec } from "@keplr-wallet/unit";
import { UnbondingCard } from "./unbonding-card";

export const ValidatorDetailsScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;

  const { chainStore, queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const unbondings = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(account.bech32Address)
    .unbondingBalances.find(
      (unbonding) => unbonding.validatorAddress === validatorAddress
    );

  const style = useStyle();

  return (
    <PageWithScrollView backgroundMode="gradient">
      <ValidatorDetailsCard
        containerStyle={style.flatten(["margin-y-card-gap"])}
        validatorAddress={validatorAddress}
      />
      {staked.toDec().gt(new Dec(0)) ? (
        <DelegatedCard
          containerStyle={style.flatten(["margin-bottom-card-gap"])}
          validatorAddress={validatorAddress}
        />
      ) : null}
      {unbondings ? (
        <UnbondingCard validatorAddress={validatorAddress} />
      ) : null}
    </PageWithScrollView>
  );
});
