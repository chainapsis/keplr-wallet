import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";

export const MsgRelationMergedClaimRewards: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = observer(({ msg, prices, targetDenom }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const amountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const rewards = msg.meta["rewards"];
    if (
      rewards &&
      Array.isArray(rewards) &&
      rewards.length > 0 &&
      typeof rewards[0] === "string"
    ) {
      for (const coinStr of rewards) {
        const split = (coinStr as string).split(
          /^([0-9]+)(\s)*([a-zA-Z][a-zA-Z0-9/-]*)$/
        );

        if (split.length === 5) {
          const denom = split[3];
          if (denom === targetDenom) {
            return new CoinPretty(currency, split[1]);
          }
        }
      }
    }

    return new CoinPretty(currency, "0");
  }, [chainInfo, msg.meta, targetDenom]);

  return (
    <MsgItemBase
      chainId={msg.chainId}
      title="Claim Reward"
      amount={amountPretty}
      prices={prices || {}}
      targetDenom={targetDenom}
    />
  );
});
