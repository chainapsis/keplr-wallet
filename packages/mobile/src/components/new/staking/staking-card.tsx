import React, { FunctionComponent, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { useStyle } from "styles/index";
import { CardDivider } from "components/card";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { AppCurrency } from "@keplr-wallet/types";
import { useStore } from "stores/index";
import { separateNumericAndDenom } from "utils/format/format";
import { Dec } from "@keplr-wallet/unit";
import { useNetInfo } from "@react-native-community/netinfo";
import { useSmartNavigation } from "navigation/smart-navigation";
import Toast from "react-native-toast-message";
import { TransactionModal } from "modals/transaction";
import { GradientButton } from "components/new/button/gradient-button";

export const StakingCard: FunctionComponent<{ cardStyle?: ViewStyle }> = ({
  cardStyle,
}) => {
  const [isSendingTx, setIsSendingTx] = useState(false);

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const netInfo = useNetInfo();
  const networkIsConnected =
    typeof netInfo.isConnected !== "boolean" || netInfo.isConnected;

  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const current = chainStore.current;
  const queries = queriesStore.get(current.chainId);
  const accountInfo = accountStore.getAccount(current.chainId);
  const balanceQuery = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const balanceStakableQuery = balanceQuery.stakable;

  const isNoble =
    ChainIdHelper.parse(chainStore.current.chainId).identifier === "noble";
  const hasUSDC = chainStore.current.currencies.find(
    (currency: AppCurrency) => currency.coinMinimalDenom === "uusdc"
  );

  const stakable = (() => {
    if (isNoble && hasUSDC) {
      return balanceQuery.getBalanceFromCurrency(hasUSDC);
    }

    return balanceStakableQuery.balance;
  })();

  const delegated = queries.cosmos.queryDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const stakableReward = rewards.stakableReward;
  const stakedSum = delegated.add(unbonding);
  const stakableBal = stakable.toString();
  const stakedBal = stakedSum.toString();
  const rewardsBal = stakableReward.toString();

  const { numericPart: stakableBalNumber } =
    separateNumericAndDenom(stakableBal);

  const { numericPart: stakedBalNumber } = separateNumericAndDenom(stakedBal);
  const { numericPart: rewardsBalNumber } = separateNumericAndDenom(rewardsBal);
  const total =
    parseFloat(stakableBalNumber) +
    parseFloat(stakedBalNumber) +
    parseFloat(rewardsBalNumber);

  let stakablePercentage = 0;
  let stakedPercentage = 0;
  let rewardsPercentage = 0;
  if (total > 0) {
    stakablePercentage = (parseFloat(stakableBalNumber) / total) * 100;
    stakedPercentage = (parseFloat(stakedBalNumber) / total) * 100;
    rewardsPercentage = (parseFloat(rewardsBalNumber) / total) * 100;
  }

  const pieData = [
    {
      color: "#F9774B",
      value: rewardsPercentage,
      focused: Math.round(rewardsPercentage) > 0,
    },

    {
      color: "#5F38FB",
      value: stakedPercentage,
      focused:
        Math.round(stakablePercentage) == 0 && Math.round(stakedPercentage) > 0,
    },
    {
      color: "#CFC3FE",
      value: stakablePercentage,
      focused:
        Math.round(stakablePercentage) == 0 &&
        Math.round(stakedPercentage) == 0 &&
        Math.round(stakablePercentage) > 0,
    },
  ];

  const [txnHash, setTxnHash] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);

  const renderLine = (color: string) => {
    return (
      <CardDivider
        vertical={true}
        style={
          [
            style.flatten(["width-4", "border-radius-4"]),
            { backgroundColor: color },
          ] as ViewStyle
        }
      />
    );
  };

  const renderLegendComponent = () => {
    return (
      <View style={style.flatten(["flex-3"])}>
        <View style={style.flatten(["flex-row", "margin-y-10"]) as ViewStyle}>
          {renderLine("#CFC3FE")}
          <View style={style.flatten(["padding-x-10"]) as ViewStyle}>
            <Text
              style={style.flatten(["color-white@60%", "body3"]) as ViewStyle}
            >
              Available
            </Text>
            <Text
              style={style.flatten(["color-white", "subtitle1"]) as ViewStyle}
            >
              {`${parseFloat(stakableBal).toFixed(2)} ${
                stakable.currency.coinDenom
              }`}{" "}
              <Text style={style.flatten(["color-white@60%"]) as ViewStyle}>
                {`(${stakablePercentage.toFixed(2)}%)`}
              </Text>
            </Text>
            {priceStore.calculatePrice(stakable)?.toString() ? (
              <Text
                style={style.flatten(["color-white@60%", "body3"]) as ViewStyle}
              >
                {priceStore.calculatePrice(stakable)?.toString()}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={style.flatten(["flex-row", "margin-y-10"]) as ViewStyle}>
          {renderLine("#5F38FB")}
          <View style={style.flatten(["padding-x-10"]) as ViewStyle}>
            <Text
              style={style.flatten(["color-white@60%", "body3"]) as ViewStyle}
            >
              Staked
            </Text>
            <Text
              style={style.flatten(["color-white", "subtitle1"]) as ViewStyle}
            >
              {`${parseFloat(stakedBal).toFixed(2)} ${
                stakable.currency.coinDenom
              }`}{" "}
              <Text style={style.flatten(["color-white@60%"]) as ViewStyle}>
                {`(${stakedPercentage.toFixed(2)}%)`}
              </Text>
            </Text>
            {priceStore.calculatePrice(stakedSum)?.toString() ? (
              <Text
                style={style.flatten(["color-white@60%", "body3"]) as ViewStyle}
              >
                {priceStore.calculatePrice(stakedSum)?.toString()}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={style.flatten(["flex-row", "margin-y-10"]) as ViewStyle}>
          {renderLine("#F9774B")}
          <View style={style.flatten(["padding-x-10"]) as ViewStyle}>
            <Text
              style={style.flatten(["color-white@60%", "body3"]) as ViewStyle}
            >
              Claimable rewards
            </Text>
            <Text
              style={style.flatten(["color-white", "subtitle1"]) as ViewStyle}
            >
              {`${parseFloat(rewardsBal).toFixed(2)} ${
                stakable.currency.coinDenom
              }`}{" "}
              <Text style={style.flatten(["color-white@60%"]) as ViewStyle}>
                {`(${rewardsPercentage.toFixed(2)}%)`}
              </Text>
            </Text>
            {priceStore.calculatePrice(stakableReward)?.toString() ? (
              <Text
                style={style.flatten(["color-white@60%", "body3"]) as ViewStyle}
              >
                {priceStore.calculatePrice(stakableReward)?.toString()}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  async function onSubmit() {
    const validatorAddresses =
      rewards.getDescendingPendingRewardValidatorAddresses(8);
    const tx =
      accountInfo.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

    setIsSendingTx(true);

    try {
      let gas =
        accountInfo.cosmos.msgOpts.withdrawRewards.gas *
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
            setTxnHash(Buffer.from(txHash).toString("hex"));
            setOpenModal(true);
          },
        }
      );
    } catch (e) {
      if (
        e?.message === "Request rejected" ||
        e?.message === "Transaction rejected"
      ) {
        Toast.show({
          type: "error",
          text1: "Transaction rejected",
        });
        return;
      }
      console.log(e);
      smartNavigation.navigateSmart("Home", {});
    } finally {
      setIsSendingTx(false);
    }
  }

  return (
    <BlurBackground
      blurIntensity={10}
      containerStyle={
        [
          style.flatten(["padding-18", "border-radius-16"]),
          cardStyle,
        ] as ViewStyle
      }
    >
      <Text
        style={
          style.flatten([
            "color-white",
            "subtitle3",
            "margin-bottom-20",
          ]) as ViewStyle
        }
      >
        STAKING
      </Text>
      <View style={style.flatten(["flex-row", "items-center"]) as ViewStyle}>
        {renderLegendComponent()}
        <View style={style.flatten(["flex-2", "margin-right-18"]) as ViewStyle}>
          <PieChart
            data={pieData}
            donut
            sectionAutoFocus
            radius={62}
            innerRadius={38}
            innerCircleColor={"#232B5D"}
            focusOnPress={true}
          />
        </View>
      </View>
      {!(
        !networkIsConnected ||
        !accountInfo.isReadyToSendTx ||
        stakableReward.toDec().equals(new Dec(0)) ||
        stakable.toDec().lte(new Dec(0)) ||
        rewards.pendingRewardValidatorAddresses.length === 0
      ) ? (
        <GradientButton
          text="Claim rewards"
          size="default"
          containerStyle={
            style.flatten(["border-radius-64", "margin-top-20"]) as ViewStyle
          }
          textStyle={style.flatten(["body3"]) as ViewStyle}
          rippleColor="black@50%"
          onPress={onSubmit}
          loading={
            isSendingTx || accountInfo.txTypeInProgress === "withdrawRewards"
          }
        />
      ) : null}
      <TransactionModal
        isOpen={openModal}
        close={() => {
          setOpenModal(false);
        }}
        txnHash={txnHash}
        chainId={chainStore.current.chainId}
        onHomeClick={() => {
          smartNavigation.navigateSmart("Home", {});
        }}
        onTryAgainClick={onSubmit}
      />
    </BlurBackground>
  );
};
