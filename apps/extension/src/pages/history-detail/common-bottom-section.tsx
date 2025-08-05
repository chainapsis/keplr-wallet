import React, { FunctionComponent } from "react";
import { Box } from "../../components/box";
import { Gutter } from "../../components/gutter";
import { MsgHistory } from "../main/token-detail/types";
import { XAxis } from "../../components/axis";
import { Subtitle3, Subtitle4 } from "../../components/typography";
import { useIntl } from "react-intl";
import { ColorPalette } from "../../styles";
import { useStore } from "../../stores";
import { Buffer } from "buffer/";
import { ChainImageFallback } from "../../components/image";

export const HistoryDetailCommonBottomSection: FunctionComponent<{
  msg: MsgHistory;
}> = ({ msg }) => {
  const { chainStore } = useStore();
  const intl = useIntl();

  return (
    <React.Fragment>
      <Box
        padding="1rem"
        borderRadius="0.375rem"
        backgroundColor={ColorPalette["gray-650"]}
      >
        <XAxis alignY="center">
          <Subtitle4 color={ColorPalette["gray-200"]}>
            Transaction Status
          </Subtitle4>
          <div style={{ flex: 1 }} />
          <Subtitle3
            color={
              !msg.code ? ColorPalette["green-400"] : ColorPalette["yellow-400"]
            }
          >
            {!msg.code ? "Success" : "Failed"}
          </Subtitle3>
        </XAxis>
        <Gutter size="1rem" />
        <XAxis alignY="center">
          <Subtitle4 color={ColorPalette["gray-200"]}>Date & Time</Subtitle4>
          <div style={{ flex: 1 }} />
          <Subtitle3 color={ColorPalette["gray-50"]}>
            {intl.formatDate(new Date(msg.time), {
              year: "numeric",
              month: "long",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </Subtitle3>
        </XAxis>
      </Box>
      <Gutter size="0.5rem" />
      <Box
        padding="1rem"
        borderRadius="0.375rem"
        backgroundColor={ColorPalette["gray-650"]}
      >
        <XAxis alignY="center">
          <Subtitle4 color={ColorPalette["gray-200"]}>Network</Subtitle4>
          <div style={{ flex: 1 }} />
          <XAxis alignY="center">
            <Subtitle3 color={ColorPalette["gray-50"]}>
              {(() => {
                if (chainStore.hasModularChain(msg.chainId)) {
                  const modularChainInfo = chainStore.getModularChain(
                    msg.chainId
                  );
                  return modularChainInfo.chainName;
                }

                return "Unknown";
              })()}
            </Subtitle3>
            {chainStore.hasModularChain(msg.chainId) ? (
              <React.Fragment>
                <Gutter size="0.25rem" />
                <ChainImageFallback
                  size="1.25rem"
                  chainInfo={chainStore.getModularChain(msg.chainId)}
                />
              </React.Fragment>
            ) : null}
          </XAxis>
        </XAxis>
        <Gutter size="1rem" />
        <XAxis alignY="center">
          <Subtitle4 color={ColorPalette["gray-200"]}>
            Transaction Fee
          </Subtitle4>
          <div style={{ flex: 1 }} />
          <Subtitle3 color={ColorPalette["gray-50"]}>TODO</Subtitle3>
        </XAxis>
        <Gutter size="1rem" />
        <XAxis alignY="center">
          <Subtitle4 color={ColorPalette["gray-200"]}>Tx Hash</Subtitle4>
          <div style={{ flex: 1 }} />
          <Subtitle3 color={ColorPalette["gray-300"]}>
            {(() => {
              try {
                const hex = Buffer.from(msg.txHash.replace("0x", ""), "hex")
                  .toString("hex")
                  .toUpperCase();
                return `0x${hex.slice(0, 5)}...${hex.slice(-5)}`;
              } catch {
                return "Unknown";
              }
            })()}
          </Subtitle3>
        </XAxis>
      </Box>
    </React.Fragment>
  );
};
