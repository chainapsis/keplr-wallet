import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../styles";
import { Card, CardHeaderWithButton } from "../../components/card";
import { RewardIcon } from "../../components/icon";
import { Dec } from "@keplr-wallet/unit";
import { ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { useSmartNavigation } from "../../navigation";

export const MyRewardCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const stakingReward = queryReward.stakableReward;

  const [isSendingTx, setIsSendingTx] = useState(false);

  return (
    <Card style={containerStyle}>
      <CardHeaderWithButton
        title="My rewards"
        paragraph={stakingReward
          .shrink(true)
          .maxDecimals(6)
          .trim(true)
          .upperCase(true)
          .toString()}
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
        icon={
          <RewardIcon size={44} color={style.get("color-pink-400").color} />
        }
        buttonText="Claim"
        buttonMode="light"
        buttonContainerStyle={style.flatten(["min-width-72"])}
        buttonDisabled={
          !account.isReadyToSendMsgs ||
          stakingReward.toDec().equals(new Dec(0)) ||
          queryReward.pendingRewardValidatorAddresses.length === 0
        }
        buttonLoading={
          isSendingTx || account.isSendingMsg === "withdrawRewards"
        }
      />
    </Card>
  );
});
