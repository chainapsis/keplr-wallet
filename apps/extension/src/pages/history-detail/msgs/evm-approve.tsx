import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { ERC20ApproveRelMeta, MsgHistory } from "../../main/token-detail/types";
import { Tooltip } from "../../../components/tooltip";
import { useTheme } from "styled-components";

export const HistoryDetailEvmApprove: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore } = useStore();

  const modularChainInfoImpl = chainStore.getModularChainInfoImpl(msg.chainId);
  const meta = msg.meta as ERC20ApproveRelMeta;

  const approveCurrency = useMemo(() => {
    return modularChainInfoImpl.findCurrency(
      meta.contract ? `erc20:${meta.contract}` : targetDenom
    );
  }, [modularChainInfoImpl, meta.contract, targetDenom]);

  const spendingCapPretty = useMemo(() => {
    if (!meta.value || meta.value === "0") {
      return null;
    }

    if (approveCurrency) {
      // Check if it's unlimited approval (very large number)
      const isUnlimited =
        meta.value.length > 50 ||
        meta.value ===
          "115792089237316195423570985008687907853269984665640564039457584007913129639935";

      if (isUnlimited) {
        return "Unlimited";
      }

      return new CoinPretty(approveCurrency, meta.value)
        .maxDecimals(6)
        .shrink(true)
        .hideIBCMetadata(true)
        .toString();
    }
    return null;
  }, [meta.value, approveCurrency]);

  const shortenedContractAddress = useMemo(() => {
    if (!meta.contract) return "Unknown";
    try {
      return `${meta.contract.slice(0, 6)}...${meta.contract.slice(-4)}`;
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [meta.contract]);

  return (
    <Box>
      <YAxis alignX="center">
        {/* Token Info */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-650"]}
        >
          <XAxis alignY="center">
            <Box
              backgroundColor={ColorPalette["gray-550"]}
              borderRadius="999px"
              paddingX="0.5rem"
              paddingY="0.25rem"
            >
              <Subtitle3 color={ColorPalette["white"]}>
                {approveCurrency?.coinDenom || "Unknown"}
              </Subtitle3>
            </Box>
            <div style={{ flex: 1 }} />
            <Tooltip
              content={meta.contract || "Unknown"}
              allowedPlacements={["top", "left"]}
              hoverCloseInteractive={true}
            >
              <Subtitle4 color={ColorPalette["gray-300"]}>
                {shortenedContractAddress}
              </Subtitle4>
            </Tooltip>
          </XAxis>
        </Box>

        <Gutter size="0.5rem" />

        {/* Spending Cap */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-650"]}
        >
          <XAxis alignY="center">
            <Subtitle4 color={ColorPalette["gray-200"]}>Spending Cap</Subtitle4>
            <div style={{ flex: 1 }} />
            <Subtitle3 color={ColorPalette["white"]}>
              {spendingCapPretty ||
                (approveCurrency
                  ? "0 " + approveCurrency.coinDenom
                  : "Unknown")}
            </Subtitle3>
          </XAxis>
        </Box>
      </YAxis>
    </Box>
  );
});

export const HistoryDetailEvmApproveIcon: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 40 40"
    >
      <path
        stroke={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="m13.333 20 5 5L30 13.333"
      />
    </svg>
  );
};
