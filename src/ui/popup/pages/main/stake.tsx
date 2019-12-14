import React, { FunctionComponent } from "react";

import { Button } from "../../../components/button";

import styleStake from "./stake.module.scss";
import classnames from "classnames";

export const StakeView: FunctionComponent = () => {
  return (
    <div>
      <div className={classnames(styleStake.containerInner, styleStake.reward)}>
        <div className={styleStake.vertical}>
          <div className={styleStake.title}>Pending Staking Reward</div>
          <div className={styleStake.content}>12.5 ATOM</div>
        </div>
        <div style={{ flex: 1 }} />
        <Button color="primary">Claim</Button>
      </div>
      <hr className={styleStake.hr} />
      <div className={classnames(styleStake.containerInner, styleStake.stake)}>
        <div className={styleStake.vertical}>
          <div className={styleStake.title}>Stake</div>
          <div className={styleStake.content}>Earn up to 7-11% per year</div>
        </div>
        <div style={{ flex: 1 }} />
        <Button color="primary" outline>
          Stake
        </Button>
      </div>
    </div>
  );
};
