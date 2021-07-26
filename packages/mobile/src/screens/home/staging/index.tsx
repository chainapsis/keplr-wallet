import React, { FunctionComponent, useEffect } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { AccountCard } from "./account-card";
import { RefreshControl } from "react-native";
import { useStore } from "../../../stores";
import { StakingInfoCard } from "./staking-info-card";
import { useStyle } from "../../../styles";
import { GovernanceCard } from "./governance-card";
import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";

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
      <AccountCard containerStyle={style.flatten(["margin-y-16"])} />
      <StakingInfoCard containerStyle={style.flatten(["margin-bottom-16"])} />
      <GovernanceCard containerStyle={style.flatten(["margin-bottom-16"])} />
    </PageWithScrollView>
  );
});
