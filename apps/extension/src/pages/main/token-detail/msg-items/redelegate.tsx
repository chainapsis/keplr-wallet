import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { Staking } from "@keplr-wallet/stores";
import { ItemLogo } from "./logo";
import { MessageRedelegateIcon } from "../../../../components/icon";

export const MsgRelationRedelegate: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore, queriesStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const amountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const amount = (msg.msg as any)["amount"] as {
      denom: string;
      amount: string;
    };

    if (amount.denom !== targetDenom) {
      return new CoinPretty(currency, "0");
    }
    return new CoinPretty(currency, amount.amount);
  }, [chainInfo, msg.msg, targetDenom]);

  const srcValidatorAddress: string = useMemo(() => {
    return (msg.msg as any)["validator_src_address"];
  }, [msg.msg]);
  const dstValidatorAddress: string = useMemo(() => {
    return (msg.msg as any)["validator_dst_address"];
  }, [msg.msg]);

  const queryBonded = queriesStore
    .get(chainInfo.chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded);
  const queryUnbonding = queriesStore
    .get(chainInfo.chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Unbonding);
  const queryUnbonded = queriesStore
    .get(chainInfo.chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Unbonded);

  const srcMoniker: string = (() => {
    if (!srcValidatorAddress) {
      return "Unknown";
    }
    const bonded = queryBonded.getValidator(srcValidatorAddress);
    if (bonded?.description.moniker) {
      return bonded.description.moniker;
    }
    const unbonding = queryUnbonding.getValidator(srcValidatorAddress);
    if (unbonding?.description.moniker) {
      return unbonding.description.moniker;
    }
    const unbonded = queryUnbonded.getValidator(srcValidatorAddress);
    if (unbonded?.description.moniker) {
      return unbonded.description.moniker;
    }

    return "Unknown";
  })();

  const dstMoniker: string = (() => {
    if (!dstValidatorAddress) {
      return "Unknown";
    }
    const bonded = queryBonded.getValidator(dstValidatorAddress);
    if (bonded?.description.moniker) {
      return bonded.description.moniker;
    }
    const unbonding = queryUnbonding.getValidator(dstValidatorAddress);
    if (unbonding?.description.moniker) {
      return unbonding.description.moniker;
    }
    const unbonded = queryUnbonded.getValidator(dstValidatorAddress);
    if (unbonded?.description.moniker) {
      return unbonded.description.moniker;
    }

    return "Unknown";
  })();

  return (
    <MsgItemBase
      logo={
        <ItemLogo
          center={<MessageRedelegateIcon width="2rem" height="2rem" />}
        />
      }
      chainId={msg.chainId}
      title="Switch Validator"
      paragraph={`${(() => {
        if (srcMoniker.length + dstMoniker.length > 18) {
          return `${srcMoniker.slice(0, 9)}...`;
        }
        return srcMoniker;
      })()} -> ${dstMoniker}`}
      paragraphStyle={{
        fontFeatureSettings: "'calt' 1",
      }}
      amount={amountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});
