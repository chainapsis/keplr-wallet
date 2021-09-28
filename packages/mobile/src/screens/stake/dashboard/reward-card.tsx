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
            "body3",
            "color-text-black-medium",
            "margin-bottom-12",
          ])}
        >
          My Pending Rewards
        </Text>
        <View style={style.flatten(["flex-row", "items-end"])}>
          <View>
            <Text
              style={style.flatten([
                "h3",
                "color-text-black-medium",
                "margin-bottom-20",
              ])}
            >
              {pendingStakableReward
                .shrink(true)
                .maxDecimals(6)
                .trim(true)
                .upperCase(true)
                .toString()}
            </Text>
            <Text style={style.flatten(["h7", "color-primary"])}>
              {`${apy.maxDecimals(2).trim(true).toString()}% per year`}
            </Text>
          </View>
          <View style={style.flatten(["flex-1"])} />
          <Button
            size="small"
            text="Claim"
            mode="light"
            containerStyle={style.flatten(["min-width-72"])}
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
              pendingStakableReward.toDec().equals(new Dec(0)) ||
              queryReward.pendingRewardValidatorAddresses.length === 0
            }
            loading={account.isSendingMsg === "withdrawRewards"}
          />
        </View>
      </CardBody>
    </Card>
  );
});
