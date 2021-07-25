import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  Card,
  CardBody,
  CardDivider,
  CardHeaderWithButton,
} from "../../../components/staging/card";
import { Text, View, ViewStyle } from "react-native";
import { useStore } from "../../../stores";
import { Dec } from "@keplr-wallet/unit";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/staging/button";
import { useNavigation } from "@react-navigation/native";

export const StakingInfoCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const navigation = useNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const style = useStyle();

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const stakingReward = queryReward.stakableReward;

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
      <CardHeaderWithButton
        title="My Reward"
        paragraph={stakingReward
          .shrink(true)
          .maxDecimals(6)
          .trim(true)
          .upperCase(true)
          .toString()}
        onPress={async () => {
          try {
            await account.cosmos.sendWithdrawDelegationRewardMsgs(
              queryReward.getDescendingPendingRewardValidatorAddresses(8)
            );
          } catch (e) {
            console.log(e);
          }
        }}
        buttonText="Claim"
        buttonMode="light"
        buttonContainerStyle={style.flatten(["min-width-80"])}
        buttonDisabled={
          !account.isReadyToSendMsgs || stakingReward.toDec().equals(new Dec(0))
        }
        buttonLoading={account.isSendingMsg === "withdrawRewards"}
      />
      <CardDivider />
      <CardBody style={style.flatten(["padding-top-12"])}>
        <Text style={style.flatten(["h5", "color-text-black-high"])}>
          My Delegation
        </Text>
        <View style={style.flatten(["margin-y-12"])}>
          <View
            style={style.flatten(["flex-row", "items-end", "margin-bottom-6"])}
          >
            <Text
              style={style.flatten(["subtitle2", "color-text-black-medium"])}
            >
              Total Delegated
            </Text>
            <View style={style.flatten(["flex-1"])} />
            <Text
              style={style.flatten(["subtitle2", "color-text-black-medium"])}
            >
              {delegated
                .shrink(true)
                .maxDecimals(6)
                .trim(true)
                .upperCase(true)
                .toString()}
            </Text>
          </View>
          <View style={style.flatten(["flex-row", "items-end"])}>
            <Text
              style={style.flatten(["subtitle2", "color-text-black-medium"])}
            >
              Total Unbonding
            </Text>
            <View style={style.flatten(["flex-1"])} />
            <Text
              style={style.flatten(["subtitle2", "color-text-black-medium"])}
            >
              {unbonding
                .shrink(true)
                .maxDecimals(6)
                .trim(true)
                .upperCase(true)
                .toString()}
            </Text>
          </View>
        </View>
        <Button
          text="Staking Dashboard"
          mode="outline"
          onPress={() => {
            navigation.navigate("Others", { screen: "Validator List" });
          }}
        />
      </CardBody>
    </Card>
  );
});
