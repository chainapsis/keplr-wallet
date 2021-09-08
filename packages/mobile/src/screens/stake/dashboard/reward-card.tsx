import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Card, CardBody } from "../../../components/card";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { Dec } from "@keplr-wallet/unit";
import { useSmartNavigation } from "../../../navigation";

export const MyRewardCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );

  const pendingStakableReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  ).stakableReward;

  const apy = queries.cosmos.queryInflation.inflation;

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  return (
    <Card style={containerStyle}>
      <CardBody>
        <Text
          style={style.flatten([
            "h4",
            "color-text-black-very-high",
            "margin-bottom-12",
          ])}
        >
          My Reward
        </Text>
        <View style={style.flatten(["flex-row"])}>
          <View style={style.flatten(["flex-1"])}>
            <Text
              style={style.flatten([
                "body3",
                "color-text-black-low",
                "uppercase",
              ])}
            >
              My Pending Reward
            </Text>
            <Text style={style.flatten(["h3", "color-text-black-high"])}>
              {pendingStakableReward
                .maxDecimals(4)
                .shrink(true)
                .trim(true)
                .toString()}
            </Text>
          </View>
          <View style={style.flatten(["flex-1"])}>
            <Text
              style={style.flatten([
                "body3",
                "color-text-black-low",
                "uppercase",
              ])}
            >
              Live Staking Reward
            </Text>
            <Text style={style.flatten(["h3", "color-text-black-high"])}>
              {`${apy.maxDecimals(2).trim(true).toString()}% / year`}
            </Text>
          </View>
        </View>
        <Button
          containerStyle={style.flatten(["margin-top-12"])}
          text="Claim All rewards"
          mode="light"
          onPress={async () => {
            try {
              analyticsStore.logEvent("Claim reward started", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
              });

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
                  onFulfill: (tx) => {
                    const isSuccess = tx.code == null || tx.code === 0;
                    analyticsStore.logEvent("Claim reward finished", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      isSuccess,
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
          disabled={
            !account.isReadyToSendMsgs ||
            pendingStakableReward.toDec().equals(new Dec(0))
          }
          loading={account.isSendingMsg === "withdrawRewards"}
        />
      </CardBody>
    </Card>
  );
});
