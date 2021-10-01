import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardBody, CardHeaderFullButton } from "../../components/card";
import { Text, View, ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation";

export const StakingInfoCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const style = useStyle();

  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegated = queryDelegated.total;

  const queryUnbonding = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const unbonding = queryUnbonding.total;

  return (
    <Card style={containerStyle}>
      <CardHeaderFullButton
        title="Staking"
        onPress={() => {
          smartNavigation.navigateSmart("Staking.Dashboard", {});
        }}
      />
      <CardBody style={style.flatten(["padding-top-card-vertical-half"])}>
        <View
          style={style.flatten(["flex-row", "items-end", "margin-bottom-8"])}
        >
          <Text style={style.flatten(["body2", "color-text-black-high"])}>
            Total staked
          </Text>
          <View style={style.flatten(["flex-1"])} />
          <Text style={style.flatten(["body2", "color-text-black-high"])}>
            {delegated
              .shrink(true)
              .maxDecimals(6)
              .trim(true)
              .upperCase(true)
              .toString()}
          </Text>
        </View>
        <View style={style.flatten(["flex-row", "items-end"])}>
          <Text style={style.flatten(["body2", "color-text-black-high"])}>
            Total unstaking
          </Text>
          <View style={style.flatten(["flex-1"])} />
          <Text style={style.flatten(["body2", "color-text-black-high"])}>
            {unbonding
              .shrink(true)
              .maxDecimals(6)
              .trim(true)
              .upperCase(true)
              .toString()}
          </Text>
        </View>
      </CardBody>
    </Card>
  );
});
