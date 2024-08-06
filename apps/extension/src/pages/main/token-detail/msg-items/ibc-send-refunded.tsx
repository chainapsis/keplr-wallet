import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { MessageReceiveIcon } from "../../../../components/icon";

export const MsgRelationIBCSendRefunded: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const receives = msg.meta["receives"] as string[];
    for (const receive of receives) {
      if (isValidCoinStr(receive)) {
        const coin = parseCoinStr(receive);
        if (coin.denom === targetDenom) {
          return new CoinPretty(currency, coin.amount);
        }
      }
    }

    return new CoinPretty(currency, "0");
  }, [chainInfo, msg.meta, targetDenom]);

  return (
    <MsgItemBase
      logo={
        <ItemLogo center={<MessageReceiveIcon width="2rem" height="2rem" />} />
      }
      chainId={msg.chainId}
      title="Send Reverted"
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: "none",
        prefix: "plus",
      }}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
