import React, { FunctionComponent, useEffect } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/staging/page";
import { AccountCard } from "./account-card";
import { RefreshControl } from "react-native";
import { useStore } from "../../stores";
import { StakingInfoCard } from "./staking-info-card";
import { useStyle } from "../../styles";
import { GovernanceCard } from "./governance-card";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { MyRewardCard } from "./my-reward-card";
import { TokensCard } from "./tokens-card";

export const HomeScreen: FunctionComponent = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);

  const { chainStore, accountStore, queriesStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: chainStore.current.chainName,
    });
  }, [chainStore, chainStore.current.chainName, navigation]);

  const onRefresh = React.useCallback(async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    await Promise.all([
      ...queries.queryBalances
        .getQueryBech32Address(account.bech32Address)
        .balances.map((bal) => {
          return bal.waitFreshResponse();
        }),
      queries.cosmos.queryRewards
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryUnbondingDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
    ]);

    setRefreshing(false);
  }, [accountStore, chainStore, queriesStore]);

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  const tokens = queryBalances.positiveNativeUnstakables.concat(
    queryBalances.nonNativeBalances
  );

  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <AccountCard containerStyle={style.flatten(["margin-y-card-gap"])} />
      {tokens.length > 0 ? (
        <TokensCard
          containerStyle={style.flatten(["margin-bottom-card-gap"])}
        />
      ) : null}
      <MyRewardCard
        containerStyle={style.flatten(["margin-bottom-card-gap"])}
      />
      <StakingInfoCard
        containerStyle={style.flatten(["margin-bottom-card-gap"])}
      />
      <GovernanceCard
        containerStyle={style.flatten(["margin-bottom-card-gap"])}
      />
    </PageWithScrollViewInBottomTabView>
  );
});
