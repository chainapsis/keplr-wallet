/* eslint-disable react/display-name */
import React, { FunctionComponent, useLayoutEffect, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button as RNButton } from "react-native-elements";
import { SafeAreaPage } from "../../components/page";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { AccountView } from "./account";
import { AssetView } from "./asset";
import { TxButtonView } from "./tx-button";
import { StakingRewardsView } from "./staking-rewards";
import { TokensView } from "./tokens";
import { TotalStakedView } from "./total-staked";
import { GovernanceView } from "./governance";
import { useStore } from "../../stores";
import { Card } from "../../components/layout";

export const HomeScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();
  const { chainStore } = useStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/display-name
      headerLeft: () => (
        <RNButton
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          icon={<Icon name="menu" size={18} />}
          type="clear"
        />
      ),
      title: chainStore.current.chainName,
    });
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      title: chainStore.current.chainName,
    });
  }, [chainStore.current.chainName]);

  return (
    <SafeAreaPage>
      <Card>
        <AccountView />
        <AssetView />
        <TxButtonView />
      </Card>
      <TokensView />
      <StakingRewardsView />
      <TotalStakedView />
      <GovernanceView />
    </SafeAreaPage>
  );
});
