import React, { FunctionComponent } from "react";

import { Button } from "../../../components/button";

import { useStore } from "../../stores";
import { useReward } from "../../../hooks/use-reward";

import { observer } from "mobx-react";

import styleStake from "./stake.module.scss";
import classnames from "classnames";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { getCurrencyFromDenom } from "../../../../common/currency";
import { Currency } from "../../../../chain-info";

export const StakeView: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();

  const reward = useReward(
    chainStore.chainInfo.rest,
    accountStore.bech32Address
  );

  let isRewardExist = false;
  let rewardCurrency: Currency | undefined;
  if (reward.totalReward && reward.totalReward.length > 0) {
    rewardCurrency = getCurrencyFromDenom(reward.totalReward[0].denom);
    isRewardExist = rewardCurrency != null;
  }

  return (
    <div>
      {isRewardExist ? (
        <>
          <div
            className={classnames(styleStake.containerInner, styleStake.reward)}
          >
            <div className={styleStake.vertical}>
              <div className={styleStake.title}>Pending Staking Reward</div>
              <div className={styleStake.content}>
                {`${new Dec(reward.totalReward[0].amount).toString(3)} ${
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  rewardCurrency!.coinDenom
                }`}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <Button color="primary">Claim</Button>
          </div>
          <hr className={styleStake.hr} />
        </>
      ) : null}

      <div className={classnames(styleStake.containerInner, styleStake.stake)}>
        <div className={styleStake.vertical}>
          <div className={styleStake.title}>Stake</div>
          <div className={styleStake.content}>Earn up to 7-11% per year</div>
        </div>
        <div style={{ flex: 1 }} />
        <Button color="primary" outline={isRewardExist}>
          Stake
        </Button>
      </div>
    </div>
  );
});
