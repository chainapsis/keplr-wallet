import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Content, H3, Text } from "native-base";

export const MainScreen: FunctionComponent = observer(() => {
  const { accountStore, queriesStore } = useStore();

  const accountInfo = accountStore.getAccount("secret-2");

  const queries = queriesStore.get("secret-2");

  const delegated = queries
    .getQueryDelegations()
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const unbonding = queries
    .getQueryUnbondingDelegations()
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const stakedSum = delegated.add(unbonding);

  const balances = queries
    .getQueryBalances()
    .getQueryBech32Address(accountInfo.bech32Address);
  const stakable = balances.stakable;

  return (
    <Content padder>
      <H3>Name</H3>
      <Text>{accountInfo.name}</Text>
      <H3>Address</H3>
      <Text>{accountInfo.bech32Address}</Text>
      <H3>Stakable</H3>
      <Text>{stakable.balance.toString()}</Text>
      <H3>Staked</H3>
      <Text>{stakedSum.toString()}</Text>
    </Content>
  );
});
