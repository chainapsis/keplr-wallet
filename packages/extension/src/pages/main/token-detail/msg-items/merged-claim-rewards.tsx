import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { ColorPalette } from "../../../../styles";

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
        if (isValidCoinStr(coinStr as string)) {
          const coin = parseCoinStr(coinStr as string);
          if (coin.denom === targetDenom) {
            return new CoinPretty(currency, coin.amount);
          }
        }
      }
    }

    return new CoinPretty(currency, "0");
  }, [chainInfo, msg.meta, targetDenom]);

  return (
    <MsgItemBase
      logo={
        <ItemLogo
          backgroundColor={ColorPalette["green-400"]}
          center={
            <svg
              style={{
                marginTop: "0.2rem",
              }}
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="15"
              fill="none"
              viewBox="0 0 19 15"
            >
              <path
                fill={ColorPalette["gray-600"]}
                d="M18.08 3.14L6.8 14.42 0 7.62l2.24-2.24L6.8 9.94 15.84.9l2.24 2.24z"
              />
            </svg>
          }
        />
      }
      chainId={msg.chainId}
      title="Claim Reward"
      amount={amountPretty}
      prices={prices || {}}
      targetDenom={targetDenom}
    />
  );
});
