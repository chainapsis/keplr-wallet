import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Image, Card } from "react-native-elements";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DefaultButton } from "../../components/buttons";
import {
  flexDirectionRow,
  justifyContentBetween,
  sf,
  alignItemsCenter,
} from "../../styles";

const NeedStakeView: FunctionComponent = () => {
  return (
    <View style={alignItemsCenter}>
      <Image
        source={{ uri: "" }}
        style={{ width: 80, height: 80, marginBottom: 5 }}
      />
      <DefaultButton title="You Don't Stake Anything" disabled={true} />
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

  const sendWithdrawDelegatorRewardMsgs = async () => {
    if (accountInfo.isReadyToSendMsgs) {
      try {
        await accountInfo.sendWithdrawDelegationRewardMsgs(
          rewards.pendingRewardValidatorAddresses,
          ""
        );
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <Card>
      {delegations.delegations.length === 0 ? (
        <React.Fragment>
          <Card.Title>Staking</Card.Title>
          <NeedStakeView />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <View style={sf([flexDirectionRow, justifyContentBetween])}>
            <Card.Title>Staking</Card.Title>
            <DefaultButton
              title={">"}
              onPress={() => {
                navigate.navigate("Staking Details");
              }}
            />
          </View>
          <View style={sf([flexDirectionRow, justifyContentBetween])}>
            <Text>Total Staked</Text>
            <Text>
              {delegations.total
                .maxDecimals(6)
                .trim(true)
                .shrink(true)
                .toString()}
            </Text>
          </View>
          <View style={sf([flexDirectionRow, justifyContentBetween])}>
            <Text>Reward</Text>
            <Text>
              {totalStakbleReward
                .maxDecimals(6)
                .trim(true)
                .shrink(true)
                .toString()}
            </Text>
          </View>
          <DefaultButton
            title="Clain Reward"
            onPress={async () => {
              await sendWithdrawDelegatorRewardMsgs();
            }}
            disabled={
              !accountInfo.isReadyToSendMsgs ||
              rewards.pendingRewardValidatorAddresses.length === 0
            }
            loading={accountInfo.isSendingMsg === "withdrawRewards"}
          />
        </React.Fragment>
      )}
    </Card>
  );
});
