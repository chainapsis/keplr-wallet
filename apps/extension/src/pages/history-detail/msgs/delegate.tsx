import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { MsgHistory } from "../../main/token-detail/types";
import { Staking } from "@keplr-wallet/stores";

export const HistoryDetailDelegate: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore, queriesStore, priceStore } = useStore();

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

  const moniker: string = useMemo(() => {
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
  }, [validatorAddress, queryBonded, queryUnbonding, queryUnbonded]);

  const price = priceStore.calculatePrice(amountPretty);

  return (
    <Box>
      <YAxis alignX="center">
        {/* Validator Info */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-700"]}
        >
          <XAxis alignY="center">
            <Subtitle4 color={ColorPalette["gray-300"]}>With</Subtitle4>
            <div style={{ flex: 1 }} />
            <Subtitle3 color={ColorPalette["white"]}>{moniker}</Subtitle3>
          </XAxis>
        </Box>

        <Gutter size="0.5rem" />

        {/* Amount Info */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-700"]}
        >
          <XAxis alignY="center">
            <Subtitle4 color={ColorPalette["gray-300"]}>Amount</Subtitle4>
            <div style={{ flex: 1 }} />
            <YAxis alignX="right">
              <Subtitle3 color={ColorPalette["white"]}>
                {amountPretty
                  .maxDecimals(6)
                  .shrink(true)
                  .hideIBCMetadata(true)
                  .toString()}
              </Subtitle3>
              {price && (
                <Subtitle4 color={ColorPalette["gray-300"]}>
                  {price.toString()}
                </Subtitle4>
              )}
            </YAxis>
          </XAxis>
        </Box>
      </YAxis>
    </Box>
  );
});

export const HistoryDetailDelegateIcon: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 40 40"
    >
      <g clipPath="url(#clip0_19452_156004)">
        <path
          stroke={ColorPalette["gray-200"]}
          strokeWidth="2.5"
          d="M17.613 6.8a4.81 4.81 0 0 1 4.774 0l9.57 5.465c1.345.768 1.345 2.706 0 3.474l-9.57 5.464a4.81 4.81 0 0 1-4.774 0l-9.57-5.464c-1.345-.768-1.345-2.706 0-3.474z"
        />
        <path
          stroke={ColorPalette["gray-200"]}
          strokeLinecap="round"
          strokeWidth="2.5"
          d="m7.416 21.75 10.197 5.823a4.81 4.81 0 0 0 4.774 0l1.78-1.017 4.166-2.39M7.413 28.089 17.61 33.91a4.81 4.81 0 0 0 4.773 0l1.78-1.017"
        />
        <path
          fill={ColorPalette["gray-200"]}
          d="M33.667 24.5a1.167 1.167 0 1 0-2.334 0V28h-3.5a1.167 1.167 0 1 0 0 2.333h3.5v3.5a1.167 1.167 0 1 0 2.334 0v-3.5h3.5a1.167 1.167 0 0 0 0-2.333h-3.5z"
        />
      </g>
      <defs>
        <clipPath id="clip0_19452_156004">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
