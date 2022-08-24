import React, { FunctionComponent, useState } from "react";
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

  const [isSendingTx, setIsSendingTx] = useState(false);

  return (
    <Card style={containerStyle}>
      <CardBody>
        <Text
          style={style.flatten([
            "body3",
            "color-text-middle",
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
                "color-text-high",
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
            <Text
              style={style.flatten([
                "h7",
                "color-blue-400",
                "dark:color-platinum-300",
              ])}
            >
              {apy.toDec().gt(new Dec(0))
                ? `${apy.maxDecimals(2).trim(true).toString()}% per year`
                : " "}
            </Text>
          </View>
          <View style={style.flatten(["flex-1"])} />
          <Button
            size="small"
            text="Claim"
            mode="light"
            containerStyle={style.flatten(["min-width-72"])}
            onPress={async () => {
              const validatorAddresses = queryReward.getDescendingPendingRewardValidatorAddresses(
                8
              );
              const tx = account.cosmos.makeWithdrawDelegationRewardTx(
                validatorAddresses
              );

              setIsSendingTx(true);

              try {
                let gas =
                  account.cosmos.msgOpts.withdrawRewards.gas *
                  validatorAddresses.length;

                // Gas adjustment is 1.5
                // Since there is currently no convenient way to adjust the gas adjustment on the UI,
                // Use high gas adjustment to prevent failure.
                try {
                  gas = (await tx.simulate()).gasUsed * 1.5;
                } catch (e) {
                  // Some chain with older version of cosmos sdk (below @0.43 version) can't handle the simulation.
                  // Therefore, the failure is expected. If the simulation fails, simply use the default value.
                  console.log(e);
                }

                await tx.send(
                  { amount: [], gas: gas.toString() },
                  "",
                  {},
                  {
                    onBroadcasted: (txHash) => {
                      analyticsStore.logEvent("Claim reward tx broadcasted", {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                      });
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
              } finally {
                setIsSendingTx(false);
              }
            }}
            disabled={
              !account.isReadyToSendMsgs ||
              pendingStakableReward.toDec().equals(new Dec(0)) ||
              queryReward.pendingRewardValidatorAddresses.length === 0
            }
            loading={isSendingTx || account.isSendingMsg === "withdrawRewards"}
          />
        </View>
      </CardBody>
    </Card>
  );
});
