import React, { useState } from "react";
import style from "../style.module.scss";
import { Doughnut } from "react-chartjs-2";
import { separateNumericAndDenom } from "@utils/format";
import { useStore } from "../../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { AppCurrency } from "@keplr-wallet/types";
import { ButtonV2 } from "@components-v2/buttons/button";
import { DefaultGasMsgWithdrawRewards } from "../../../config.ui";
import { useNavigate } from "react-router";
import { useNotification } from "@components/notification";

export const Stats = () => {
  const navigate = useNavigate();
  const notification = useNotification();

  const [_isWithdrawingRewards, setIsWithdrawingRewards] = useState(false);
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
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

  const stakablePercentage = total
    ? (parseFloat(stakableBalNumber) / total) * 100
    : 0;
  const stakedPercentage = total
    ? (parseFloat(stakedBalNumber) / total) * 100
    : 0;
  const rewardsPercentage = total
    ? (parseFloat(rewardsBalNumber) / total) * 100
    : 0;

  const doughnutData = {
    labels: ["Balance", "Staked", "Rewards"],
    datasets: [
      {
        data: [
          parseFloat(stakableBalNumber),
          parseFloat(stakedBalNumber),
          parseFloat(rewardsBalNumber),
        ],
        backgroundColor: ["#F9774B", "#5F38FB", "#CFC3FE"],
        hoverBackgroundColor: ["#F9774B", "#5F38FB", "#CFC3FE"],
        borderColor: "transparent",
      },
    ],
    options: {
      legend: {
        display: false,
      },
      tooltips: {
        enabled: false,
      },
    },
  };
  const handleClaimRewards = async () => {
    if (accountInfo.isReadyToSendTx) {
      try {
        setIsWithdrawingRewards(true);

        // When the user delegated too many validators,
        // it can't be sent to withdraw rewards from all validators due to the block gas limit.
        // So, to prevent this problem, just send the msgs up to 8.
        const validatorAddresses =
          rewards.getDescendingPendingRewardValidatorAddresses(8);
        const tx =
          accountInfo.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

        let gas: number;
        try {
          // Gas adjustment is 1.5
          // Since there is currently no convenient way to adjust the gas adjustment on the UI,
          // Use high gas adjustment to prevent failure.
          gas = (await tx.simulate()).gasUsed * 1.5;
        } catch (e) {
          console.log(e);

          gas = DefaultGasMsgWithdrawRewards * validatorAddresses.length;
        }

        await tx.send(
          {
            amount: [],
            gas: gas.toString(),
          },
          "",
          undefined,
          {
            onBroadcasted: () => {
              analyticsStore.logEvent("Claim reward tx broadcasted", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
              });
            },
          }
        );

        navigate("/", { replace: true });
      } catch (e) {
        navigate("/portfolio", { replace: true });
        notification.push({
          type: "warning",
          placement: "top-center",
          duration: 5,
          content: `Fail to withdraw rewards: ${e.message}`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      } finally {
        setIsWithdrawingRewards(false);
      }
    }
  };
  return (
    <div className={style["card"]}>
      <div className={style["heading"]}>STAKING</div>
      <div className={style["legends"]}>
        <div className={style["legend"]}>
          <img
            src={require("@assets/svg/wireframe/legend-orange.svg")}
            alt=""
          />
          <div>
            <div className={style["label"]}>Available</div>
            <div className={style["value"]}>
              {parseFloat(stakableBal).toFixed(4)} FET (
              {stakablePercentage.toFixed(1)}%)
            </div>
          </div>
        </div>
        <div className={style["legend"]}>
          <img
            src={require("@assets/svg/wireframe/legend-purple.svg")}
            alt=""
          />
          <div>
            <div className={style["label"]}>Staked</div>
            <div className={style["value"]}>
              {parseFloat(stakedBal).toFixed(4)} FET (
              {stakedPercentage.toFixed(1)}
              %)
            </div>
          </div>
        </div>
        <div className={style["legend"]}>
          <img
            src={require("@assets/svg/wireframe/legend-light-purple.svg")}
            alt=""
          />
          <div>
            <div className={style["label"]}>Staking rewards</div>
            <div className={style["value"]}>
              {parseFloat(rewardsBal).toFixed(4)} FET (
              {rewardsPercentage.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>
      <div className={style["doughnut-graph"]}>
        <Doughnut data={doughnutData} options={doughnutData.options} />
      </div>
      <ButtonV2
        onClick={handleClaimRewards}
        text="Claim"
        gradientText="Rewards"
        disabled={rewardsBal === "0.000000000000000000 FET"}
      />
    </div>
  );
};
