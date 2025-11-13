import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { MessageClaimRewardIcon } from "../../../../components/icon";

export const MsgRelationBbnClaimRewardFromBTCStaking: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore } = useStore();

  const modularChainInfoImpl = chainStore.getModularChainInfoImpl(msg.chainId);

  const amountPretty = useMemo(() => {
    const currency = modularChainInfoImpl.forceFindCurrency(targetDenom);

    const rewards = msg.meta["reward"] as string;

    if (isValidCoinStr(rewards)) {
      const coin = parseCoinStr(rewards);
      if (coin.denom === targetDenom) {
        return new CoinPretty(currency, coin.amount);
      }
    }

    return new CoinPretty(currency, "0");
  }, [modularChainInfoImpl, msg.meta, targetDenom]);

  return (
    <MsgItemBase
      logo={
        <ItemLogo
          center={<MessageClaimRewardIcon width="2rem" height="2rem" />}
        />
      }
      chainId={msg.chainId}
      title="Claim Reward"
      paragraph="From BTC Staking"
      amount={amountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: "green",
        prefix: "plus",
      }}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
