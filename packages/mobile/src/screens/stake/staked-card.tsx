import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Button, Image, Card } from "react-native-elements";
import { View } from "react-native";

const NeedStakeView: FunctionComponent<{
  chainId: string;
}> = observer(({ chainId }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(chainId);

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <Image
        source={{ uri: "" }}
        style={{ width: 80, height: 80, marginBottom: 5 }}
      />
      <Button
        containerStyle={{ width: "100%" }}
        title="You Don't Stake Anything"
        disabled={true}
      />
    </View>
  );
});

export const StakedCard: FunctionComponent<{
  chainId: string;
}> = observer(({ chainId }) => {
  const { accountStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainId);

  const accountInfo = accountStore.getAccount(chainId);

  const delegations = queries
    .getQueryDelegations()
    .getQueryBech32Address(accountInfo.bech32Address);

  const rewards = queries
    .getQueryRewards()
    .getQueryBech32Address(accountInfo.bech32Address);

  const totalStakbleReward = rewards.stakableReward;

  return (
    <Card
      containerStyle={{
        padding: 16,
        marginHorizontal: 0,
        marginVertical: 16,
        borderRadius: 6,
      }}
    >
      <Card.Title h4 style={{ textAlign: "left", marginBottom: 0 }}>
        Staking
      </Card.Title>
      {delegations.delegations.length === 0 ? (
        <NeedStakeView chainId={chainId} />
      ) : (
        <View>
          <Text>
            Total Staked:{" "}
            {delegations.total
              .maxDecimals(6)
              .trim(true)
              .shrink(true)
              .toString()}
          </Text>
          <Text>
            Reward:{" "}
            {totalStakbleReward
              .maxDecimals(6)
              .trim(true)
              .shrink(true)
              .toString()}
          </Text>
          <Button
            title="Clain Reward"
            containerStyle={{ width: "100%" }}
            onPress={async (e) => {
              e.preventDefault();
            }}
          />
        </View>
      )}
    </Card>
  );
});
