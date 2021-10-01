import React, { FunctionComponent, useEffect, useRef } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { AccountCard } from "./account-card";
import { RefreshControl, ScrollView } from "react-native";
import { useStore } from "../../stores";
import { StakingInfoCard } from "./staking-info-card";
import { useStyle } from "../../styles";
import { GovernanceCard } from "./governance-card";
import { observer } from "mobx-react-lite";
import { MyRewardCard } from "./my-reward-card";
import { TokensCard } from "./tokens-card";
import { useLogScreenView } from "../../hooks";
import { BIP44Selectable } from "./bip44-selectable";

export const HomeScreen: FunctionComponent = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);

  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const style = useStyle();

  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0 });
    }
  }, [chainStore.current.chainId]);

  const onRefresh = React.useCallback(async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    await Promise.all([
      priceStore.waitFreshResponse(),
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
  }, [accountStore, chainStore, priceStore, queriesStore]);

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  const tokens = queryBalances.positiveNativeUnstakables.concat(
    queryBalances.nonNativeBalances
  );

  useLogScreenView("Home Dashboard", {
    chainId: chainStore.current.chainId,
    chainName: chainStore.current.chainName,
  });

  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ref={scrollViewRef}
    >
      <BIP44Selectable />
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
