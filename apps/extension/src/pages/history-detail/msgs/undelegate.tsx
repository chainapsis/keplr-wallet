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

export const HistoryDetailUndelegate: FunctionComponent<{
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
              {moniker}
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

export const HistoryDetailUndelegateIcon: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 40 40"
    >
      <g clipPath="url(#clip0_19452_156043)">
        <path
          stroke={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          strokeWidth="2.5"
          d="M17.613 6.8a4.81 4.81 0 0 1 4.774 0l9.57 5.464c1.345.768 1.345 2.706 0 3.474l-9.57 5.464a4.81 4.81 0 0 1-4.774 0l-9.57-5.464c-1.345-.768-1.345-2.706 0-3.474z"
        />
        <path
          stroke={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          strokeLinecap="round"
          strokeWidth="2.5"
          d="m32.584 21.751-10.197 5.822a4.81 4.81 0 0 1-4.774 0L7.416 21.751M7.416 28.09l10.198 5.821a4.81 4.81 0 0 0 4.773 0l1.444-.824"
        />
        <path
          fill={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          fillRule="evenodd"
          d="M37.168 29.756c0 .69-.553 1.25-1.234 1.25h-7.6c-.68 0-1.233-.56-1.233-1.25s.552-1.25 1.233-1.25h7.6c.681 0 1.233.56 1.233 1.25"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="clip0_19452_156043">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
