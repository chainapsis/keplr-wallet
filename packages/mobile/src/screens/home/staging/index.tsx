import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { AccountCard } from "./account-card";
import { RefreshControl } from "react-native";
import { useStore } from "../../../stores";

export const HomeScreen: FunctionComponent = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const { chainStore, accountStore, queriesStore } = useStore();

  const onRefresh = React.useCallback(async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    const queryStakable = queries.queryBalances.getQueryBech32Address(
      account.bech32Address
    ).stakable;
    await queryStakable.waitFreshResponse();

    setRefreshing(false);
  }, [accountStore, chainStore, queriesStore]);

  return (
    <PageWithScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <AccountCard />
    </PageWithScrollView>
  );
};
