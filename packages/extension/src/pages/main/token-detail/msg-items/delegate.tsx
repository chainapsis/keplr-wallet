import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { Staking } from "@keplr-wallet/stores";
import { ItemLogo } from "./logo";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";

export const MsgRelationDelegate: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = observer(({ msg, prices, targetDenom }) => {
  const { chainStore, queriesStore } = useStore();

  const theme = useTheme();

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

  const validatorAddress: string = useMemo(() => {
    return (msg.msg as any)["validator_address"];
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

  const moniker: string = (() => {
    if (!validatorAddress) {
      return "Unknown";
    }
    const bonded = queryBonded.getValidator(validatorAddress);
    if (bonded?.description.moniker) {
      return bonded.description.moniker;
    }
    const unbonding = queryUnbonding.getValidator(validatorAddress);
    if (unbonding?.description.moniker) {
      return unbonding.description.moniker;
    }
    const unbonded = queryUnbonded.getValidator(validatorAddress);
    if (unbonded?.description.moniker) {
      return unbonded.description.moniker;
    }

    return "Unknown";
  })();

  return (
    <MsgItemBase
      logo={
        <ItemLogo
          center={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                fill={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
                d="M4.628 8.818l-1.167.599a.628.628 0 00-.005 1.164v.013l5.972 3.049.004-.003c.172.087.363.14.568.14.206 0 .396-.053.568-.14l.004.003 5.972-3.05v-.012a.628.628 0 00-.005-1.165l-1.167-.598c-1.83.938-4.33 2.213-4.359 2.224a2.468 2.468 0 01-2.03-.002c-.028-.01-2.524-1.284-4.355-2.222zm0 3.782l-1.167.598a.628.628 0 00-.005 1.165v.012l5.972 3.05.004-.003c.172.087.363.14.568.14.206 0 .396-.053.568-.14l.004.003 5.972-3.05v-.012a.628.628 0 00-.005-1.165l-1.167-.598c-1.83.937-4.33 2.213-4.359 2.223a2.468 2.468 0 01-2.03 0c-.028-.01-2.524-1.285-4.355-2.223z"
              />
              <path
                fill={
                  theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["white"]
                }
                d="M9.434 2.576c.17-.086.361-.14.566-.14.205 0 .396.054.566.14h.011l5.962 3.06a.628.628 0 01.005 1.164v.012l-5.972 3.05-.004-.003c-.172.087-.362.14-.568.14-.205 0-.396-.053-.568-.14l-.004.002-5.972-3.049V6.8a.628.628 0 01.005-1.165l5.962-3.06h.01z"
              />
            </svg>
          }
        />
      }
      chainId={msg.chainId}
      title="Stake"
      paragraph={`To ${moniker}`}
      amount={amountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
    />
  );
});
