import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../../styles";
import { Card, CardHeaderWithButton } from "../../../components/staging/card";
import { RewardIcon } from "../../../components/staging/icon";
import { Dec } from "@keplr-wallet/unit";
import { ViewStyle } from "react-native";
import { useStore } from "../../../stores";
import { useSmartNavigation } from "../../../navigation";

export const MyRewardCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const stakingReward = queryReward.stakableReward;

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
              queryReward.getDescendingPendingRewardValidatorAddresses(8),
              "",
              {},
              {
                onBroadcasted: (txHash) => {
                  smartNavigation.pushSmart("TxPendingResult", {
                    txHash: Buffer.from(txHash).toString("hex"),
                  });
                },
              }
            );
          } catch (e) {
            if (e?.message === "Request rejected") {
              return;
            }
            console.log(e);
            smartNavigation.navigateSmart("Home", {});
          }
        }}
        icon={<RewardIcon size={44} />}
        buttonText="Claim"
        buttonMode="light"
        buttonContainerStyle={style.flatten(["min-width-72"])}
        buttonDisabled={
          !account.isReadyToSendMsgs || stakingReward.toDec().equals(new Dec(0))
        }
        buttonLoading={account.isSendingMsg === "withdrawRewards"}
      />
    </Card>
  );
});
