import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Image, Card } from "react-native-elements";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FlexButton, FlexWhiteButton } from "../../components/buttons";
import {
  flexDirectionRow,
  justifyContentBetween,
  sf,
  alignItemsCenter,
  h5,
} from "../../styles";

const NeedStakeView: FunctionComponent = () => {
  return (
    <View style={alignItemsCenter}>
      <Image
        source={{ uri: "" }}
        style={{ width: 80, height: 80, marginBottom: 5 }}
      />
      <FlexButton title="You Don't Stake Anything" disabled={true} />
    </View>
  );
};

export const TotalStakedView: FunctionComponent = observer(() => {
  const { accountStore, queriesStore, chainStore } = useStore();
  const navigate = useNavigation();

  const queries = queriesStore.get(chainStore.current.chainId);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const delegations = queries.cosmos.queryDelegations.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const totalStakbleReward = rewards.stakableReward;

  const withdrawAllRewards = async () => {
    if (accountInfo.isReadyToSendMsgs) {
      try {
        // When the user delegated too many validators,
        // it can't be sent to withdraw rewards from all validators due to the block gas limit.
        // So, to prevent this problem, just send the msgs up to 8.
        await accountInfo.cosmos.sendWithdrawDelegationRewardMsgs(
          rewards.pendingRewardValidatorAddresses,
          // rewards.getDescendingPendingRewardValidatorAddresses(8),
          ""
        );
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <Card>
      <Text style={h5}>Staking</Text>
      {delegations.delegations.length === 0 ? (
        <NeedStakeView />
      ) : (
        <React.Fragment>
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
          <View style={sf([flexDirectionRow, justifyContentBetween])}>
            <FlexWhiteButton
              title="Claim Reward"
              onPress={async () => {
                await withdrawAllRewards();
              }}
              disabled={
                !accountInfo.isReadyToSendMsgs ||
                rewards.pendingRewardValidatorAddresses.length === 0
              }
              loading={accountInfo.isSendingMsg === "withdrawRewards"}
            />
            <FlexButton
              title="Staked List"
              onPress={() => {
                navigate.navigate("Staked List");
              }}
            />
          </View>
        </React.Fragment>
      )}
    </Card>
  );
});
