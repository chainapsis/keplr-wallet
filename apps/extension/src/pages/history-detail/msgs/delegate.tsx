import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { H1, Subtitle3, Subtitle4 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { MsgHistory } from "../../main/token-detail/types";
import { Staking } from "@keplr-wallet/stores";
import { MessageDelegateIcon } from "../../../components/icon";

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
        {/* Icon Section */}
        <Box
          position="relative"
          width="4rem"
          height="4rem"
          backgroundColor={ColorPalette["gray-600"]}
          borderRadius="999px"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageDelegateIcon
            width="2rem"
            height="2rem"
            color={ColorPalette["white"]}
          />
          <Box
            position="absolute"
            width="1.5rem"
            height="1.5rem"
            backgroundColor={ColorPalette["pink-400"]}
            borderRadius="999px"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Subtitle4 color={ColorPalette["white"]}>S</Subtitle4>
          </Box>
        </Box>

        <Gutter size="1rem" />

        {/* Title */}
        <H1 color={ColorPalette["white"]}>Stake</H1>

        <Gutter size="1.5rem" />

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
