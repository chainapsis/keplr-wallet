import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Card } from "react-native-elements";
import { View } from "react-native";
import {
  flexDirectionRow,
  justifyContentBetween,
  sf,
  h5,
  fcHigh,
  subtitle2,
  fcLow,
  mt3,
} from "../../styles";
import { Button } from "../../components/buttons";

export const StakingRewardsView: FunctionComponent = observer(() => {
  const { accountStore, queriesStore, chainStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

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
    <Card containerStyle={mt3}>
      <View style={sf([flexDirectionRow, justifyContentBetween])}>
        <View style={sf([justifyContentBetween])}>
          <Text style={sf([h5, fcHigh])}>Staking Rewards</Text>
          <Text style={sf([subtitle2, fcLow])}>
            {totalStakbleReward
              .maxDecimals(6)
              .trim(true)
              .shrink(true)
              .toString()}
          </Text>
        </View>
        <Button
          title="Claim"
          onPress={async () => {
            await withdrawAllRewards();
          }}
          containerStyle={[{ width: 93, height: 40 }]}
          disabled={
            !accountInfo.isReadyToSendMsgs ||
            rewards.pendingRewardValidatorAddresses.length === 0
          }
          loading={accountInfo.isSendingMsg === "withdrawRewards"}
        />
      </View>
    </Card>
  );
});
