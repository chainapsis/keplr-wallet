import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Button, Image, Card } from "react-native-elements";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

const NeedStakeView: FunctionComponent = () => {
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
};

export const TotalStakedCard: FunctionComponent = observer(() => {
  const { accountStore, queriesStore, chainStore } = useStore();
  const navigate = useNavigation();

  const queries = queriesStore.get(chainStore.current.chainId);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

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
      {delegations.delegations.length === 0 ? (
        <React.Fragment>
          <Card.Title h4 style={{ textAlign: "left", marginBottom: 0 }}>
            Staking
          </Card.Title>
          <NeedStakeView />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Card.Title h4 style={{ textAlign: "left", marginBottom: 0 }}>
              Staking
            </Card.Title>
            <Button
              title={">"}
              onPress={() => {
                navigate.navigate("Staking Details");
              }}
            />
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text>Total Staked</Text>
            <Text>
              {delegations.total
                .maxDecimals(6)
                .trim(true)
                .shrink(true)
                .toString()}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text>Reward</Text>
            <Text>
              {totalStakbleReward
                .maxDecimals(6)
                .trim(true)
                .shrink(true)
                .toString()}
            </Text>
          </View>
          <Button
            title="Clain Reward"
            containerStyle={{ width: "100%" }}
            onPress={async (e) => {
              e.preventDefault();
            }}
          />
        </React.Fragment>
      )}
    </Card>
  );
});
