import React, { FunctionComponent, useMemo } from "react";
import { ERC20ApproveRelMeta, MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { MsgApproveIcon } from "../../../../components/icon";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";

export const MsgRelationEvmApprove: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const meta = msg.meta as ERC20ApproveRelMeta;

  const approveCoinPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(
      meta.contract ? `erc20:${meta.contract}` : targetDenom
    );

    const val = meta.value;

    return new CoinPretty(currency, val);
  }, [chainInfo, meta.value, targetDenom, meta.contract]);

  return (
    <MsgItemBase
      amount={""}
      logo={<ItemLogo center={<MsgApproveIcon width="1rem" height="1rem" />} />}
      chainId={msg.chainId}
      title={`Approve ${approveCoinPretty.denom}`}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
