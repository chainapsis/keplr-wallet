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
import { useTheme } from "styled-components";

export const HistoryDetailRedelegate: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
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

  const srcMoniker: string = useMemo(() => {
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
  }, [srcValidatorAddress, queryBonded, queryUnbonding, queryUnbonded]);

  const dstMoniker: string = useMemo(() => {
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
  }, [dstValidatorAddress, queryBonded, queryUnbonding, queryUnbonded]);

  return (
    <Box>
      <YAxis alignX="center">
        {/* Validator Info */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["white"]
              : ColorPalette["gray-650"]
          }
          style={{
            boxShadow:
              theme.mode === "light"
                ? "0 1px 4px 0 rgba(43, 39, 55, 0.10)"
                : undefined,
          }}
        >
          <XAxis alignY="center">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              From
            </Subtitle4>
            <div style={{ flex: 1 }} />
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-650"]
                  : ColorPalette["white"]
              }
            >
              {srcMoniker}
            </Subtitle3>
          </XAxis>
          <Gutter size="1rem" />
          <XAxis alignY="center">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              To
            </Subtitle4>
            <div style={{ flex: 1 }} />
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-650"]
                  : ColorPalette["white"]
              }
            >
              {dstMoniker}
            </Subtitle3>
          </XAxis>
          <Gutter size="1rem" />
          <XAxis alignY="center">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              Amount
            </Subtitle4>
            <div style={{ flex: 1 }} />
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-650"]
                  : ColorPalette["white"]
              }
            >
              {amountPretty
                .maxDecimals(3)
                .shrink(true)
                .hideIBCMetadata(true)
                .inequalitySymbol(true)
                .inequalitySymbolSeparator("")
                .toString()}
            </Subtitle3>
          </XAxis>
        </Box>
      </YAxis>
    </Box>
  );
});

export const HistoryDetailRedelegateIcon = () => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 40 40"
    >
      <g clipPath="url(#clip0_19471_16319)">
        <path
          stroke={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          strokeWidth="2.5"
          d="M17.613 6.8a4.81 4.81 0 0 1 4.774 0l9.57 5.465c1.345.768 1.345 2.706 0 3.474l-9.57 5.464a4.81 4.81 0 0 1-4.774 0l-9.57-5.464c-1.345-.768-1.345-2.706 0-3.474z"
        />
        <path
          stroke={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          strokeLinecap="round"
          strokeWidth="2.5"
          d="m7.416 21.75 10.198 5.822a4.81 4.81 0 0 0 4.773 0l1.587-.906.81-.462M7.416 28.09l10.197 5.823a4.81 4.81 0 0 0 4.773 0l1.78-1.017"
        />
        <path
          fill={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          fillRule="evenodd"
          d="M34.067 20.317a1.083 1.083 0 0 1 1.532 0l2.917 2.917a1.083 1.083 0 0 1 0 1.532l-2.917 2.917a1.083 1.083 0 1 1-1.532-1.532l1.067-1.068H29a1.083 1.083 0 1 1 0-2.166h6.134l-1.067-1.068a1.083 1.083 0 0 1 0-1.532m-2.634 5.834a1.083 1.083 0 0 1 0 1.532l-1.068 1.067H36.5a1.083 1.083 0 1 1 0 2.167h-6.135l1.068 1.067a1.083 1.083 0 1 1-1.532 1.532l-2.917-2.917a1.083 1.083 0 0 1 0-1.532l2.916-2.916a1.083 1.083 0 0 1 1.533 0"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="clip0_19471_16319">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
