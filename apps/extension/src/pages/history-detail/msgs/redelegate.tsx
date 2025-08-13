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

export const HistoryDetailRedelegate: FunctionComponent<{
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

  const price = priceStore.calculatePrice(amountPretty);

  return (
    <Box>
      <YAxis alignX="center">
        {/* From Validator Info */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-700"]}
        >
          <XAxis alignY="center">
            <Subtitle4 color={ColorPalette["gray-300"]}>From</Subtitle4>
            <div style={{ flex: 1 }} />
            <Subtitle3 color={ColorPalette["white"]}>{srcMoniker}</Subtitle3>
          </XAxis>
        </Box>

        <Gutter size="0.5rem" />

        {/* To Validator Info */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-700"]}
        >
          <XAxis alignY="center">
            <Subtitle4 color={ColorPalette["gray-300"]}>To</Subtitle4>
            <div style={{ flex: 1 }} />
            <Subtitle3 color={ColorPalette["white"]}>{dstMoniker}</Subtitle3>
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
