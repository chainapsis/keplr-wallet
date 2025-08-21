import React, { FunctionComponent, useMemo } from "react";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import { MsgHistory } from "../../main/token-detail/types";
import { Tooltip } from "../../../components/tooltip";
import { useStore } from "../../../stores";

export const HistoryDetailEvmContractCall: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg }) => {
  const { queriesStore } = useStore();

  const contractAddress = useMemo(() => {
    // Contract call should have a 'to' field in the meta or msg
    if (msg.meta && typeof msg.meta === "object" && "contract" in msg.meta) {
      return (msg.meta as any).contract;
    }
    const res = queriesStore.simpleQuery.queryGet<{
      to: string;
    }>(
      "https://keplr-api.keplr.app",
      `/v1/evm/tx?chain_identifier=${msg.chainId}&tx_hash=0x${msg.txHash}`
    );
    if (res.response?.data.to) {
      return res.response.data.to;
    }
    return "Unknown";
  }, [msg.chainId, msg.meta, msg.txHash, queriesStore.simpleQuery]);

  const shortenedContractAddress = useMemo(() => {
    if (contractAddress === "Unknown") return "Unknown";
    try {
      return `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`;
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [contractAddress]);

  return (
    <Box>
      <YAxis alignX="center">
        {/* Contract Address Info */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-650"]}
        >
          <XAxis alignY="center">
            <Subtitle4 color={ColorPalette["gray-200"]}>
              Contract Address
            </Subtitle4>
            <div style={{ flex: 1 }} />
            <Tooltip
              content={contractAddress}
              allowedPlacements={["top", "left"]}
            >
              <Subtitle3 color={ColorPalette["white"]}>
                {shortenedContractAddress}
              </Subtitle3>
            </Tooltip>
          </XAxis>
        </Box>
      </YAxis>
    </Box>
  );
});

export const HistoryDetailEvmContractCallIcon: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 40 40"
    >
      <rect
        x="10"
        y="8"
        width="20"
        height="24"
        rx="2"
        stroke={ColorPalette["gray-200"]}
        strokeWidth="2.5"
        fill="none"
      />
      <path
        stroke={ColorPalette["gray-200"]}
        strokeWidth="2.5"
        strokeLinecap="round"
        d="M14 16h12M14 20h12M14 24h8"
      />
    </svg>
  );
};
