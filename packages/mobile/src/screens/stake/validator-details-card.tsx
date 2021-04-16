import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Button, Avatar, Card } from "react-native-elements";
import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, DecUtils, Dec } from "@keplr-wallet/unit";
import { View } from "react-native";

type Validator = Staking.Validator;

export const ValidatorDetailsCard: FunctionComponent<{
  validator: Validator;
  thumbnail: string;
  power: CoinPretty | undefined;
}> = observer(({ validator, thumbnail, power }) => {
  const { accountStore, queriesStore, chainStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const delegations = queries
    .getQueryDelegations()
    .getQueryBech32Address(accountInfo.bech32Address);

  const delegationTo = delegations.getDelegationTo(validator.operator_address);

  const rewards = queries
    .getQueryRewards()
    .getQueryBech32Address(accountInfo.bech32Address);

  return (
    <Card
      containerStyle={{
        padding: 16,
        marginHorizontal: 0,
        marginVertical: 16,
        borderRadius: 6,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <Avatar
          source={{ uri: thumbnail }}
          size={40}
          rounded
          icon={{ name: "user", type: "font-awesome" }}
        />
        <Text>{validator.description.moniker}</Text>
      </View>
      <Text h4>Description</Text>
      <Text>{validator.description.details}</Text>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Text h4>Commision</Text>
          <Text>
            {`${DecUtils.trim(
              new Dec(validator.commission.commission_rates.rate)
                .mul(DecUtils.getPrecisionDec(2))
                .toString(1)
            )}%`}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text h4>Voting Power</Text>
          <Text>{power?.maxDecimals(0).toString()}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>Staked</Text>
        <Text>{delegationTo.trim(true).toString()}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>Reward</Text>
        <Text>
          {rewards
            .getStakableRewardOf(validator.operator_address)
            .maxDecimals(6)
            .trim(true)
            .toString()}
        </Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <Button containerStyle={{ flex: 1 }} title="Delegate" />
        <Button containerStyle={{ flex: 1 }} title="Undelegate" />
      </View>
    </Card>
  );
});
