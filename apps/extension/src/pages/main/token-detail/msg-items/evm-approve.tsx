import React, { FunctionComponent } from "react";
import { ERC20ApproveRelMeta, MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { MsgApproveIcon } from "../../../../components/icon";
import { useStore } from "../../../../stores";

export const MsgRelationEvmApprove: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getModularChainInfoImpl(msg.chainId);

  const meta = msg.meta as ERC20ApproveRelMeta;

  const currencyName = (() => {
    const approveCurrency = chainInfo.findCurrency(
      meta.contract ? `erc20:${meta.contract}` : targetDenom
    );
    if (approveCurrency) {
      return approveCurrency.coinDenom;
    }
    return "Unknown";
  })();

  return (
    <MsgItemBase
      amount={""}
      logo={<ItemLogo center={<MsgApproveIcon width="1rem" height="1rem" />} />}
      chainId={msg.chainId}
      title={`Approve ${currencyName}`}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
