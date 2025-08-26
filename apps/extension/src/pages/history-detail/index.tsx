import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useParams } from "react-router";
import { MsgHistory } from "../main/token-detail/types";
import { HistoryDetailCommonBottomSection } from "./common-bottom-section";
import { Box } from "../../components/box";
import { BackButton } from "../../layouts/header/components";
import { HeaderLayout } from "../../layouts/header";
import { Gutter } from "../../components/gutter";
import { HistoryDetailTopSection } from "./top-section";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Body1 } from "../../components/typography";

export const HistoryDetailPage: FunctionComponent = observer(() => {
  const { queriesStore } = useStore();

  const theme = useTheme();

  const { chainId, msgJson } = useParams<{
    chainId: string;
    msgJson: string;
  }>();

  if (!msgJson) {
    throw new Error("msg json is null");
  }

  const msg: {
    msg: MsgHistory;
    prices?: Record<string, Record<string, number | undefined> | undefined>;
  } = JSON.parse(msgJson);

  const queryExplorer = queriesStore.simpleQuery.queryGet<{
    link: string;
  }>(
    process.env["KEPLR_EXT_CONFIG_SERVER"],
    `/tx-history/explorer/${ChainIdHelper.parse(chainId || "").identifier}`
  );

  const explorerUrl = queryExplorer.response?.data.link || "";

  console.log(chainId, explorerUrl, msg.msg.txHash);

  return (
    <HeaderLayout
      title={
        <Body1
          color={
            theme.mode === "light"
              ? ColorPalette["gray-500"]
              : ColorPalette["gray-200"]
          }
        >
          Transaction Detail
        </Body1>
      }
      left={
        <BackButton
          color={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
        />
      }
      right={
        explorerUrl && msg.msg.txHash ? (
          <TxExplorerRightButton
            explorerUrl={explorerUrl}
            txHash={msg.msg.txHash}
          />
        ) : undefined
      }
    >
      <Box paddingX="0.75rem">
        <HistoryDetailTopSection msg={msg.msg} />
        <Gutter size="1.75rem" />
        <HistoryDetailCommonBottomSection msg={msg.msg} />
      </Box>
    </HeaderLayout>
  );
});

const TxExplorerRightButton: FunctionComponent<{
  explorerUrl: string;
  txHash: string;
}> = ({ explorerUrl, txHash }) => {
  const theme = useTheme();

  return (
    <Box
      paddingRight="1rem"
      cursor="pointer"
      onClick={(e) => {
        e.preventDefault();

        if (explorerUrl) {
          browser.tabs.create({
            url: explorerUrl
              .replace("{txHash}", txHash.toUpperCase())
              .replace("{txHash:lowercase}", txHash.toLowerCase())
              .replace("{txHash:uppercase}", txHash.toUpperCase()),
          });
        }
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="none"
        viewBox="0 0 24 24"
      >
        <path
          fill={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
          fillRule="evenodd"
          d="M5.1 6.6a.9.9 0 0 0-.9.9v10.2a.9.9 0 0 0 .9.9h10.2a.9.9 0 0 0 .9-.9v-4.8a.9.9 0 1 1 1.8 0v4.8a2.7 2.7 0 0 1-2.7 2.7H5.1a2.7 2.7 0 0 1-2.7-2.7V7.5a2.7 2.7 0 0 1 2.7-2.7h6a.9.9 0 1 1 0 1.8z"
          clipRule="evenodd"
        />
        <path
          fill={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
          fillRule="evenodd"
          d="M7.433 15.304a.9.9 0 0 0 1.27.064L19.8 5.328V8.7a.9.9 0 1 0 1.8 0V3.3a.9.9 0 0 0-.9-.9h-5.4a.9.9 0 1 0 0 1.8h3.064L7.496 14.033a.9.9 0 0 0-.063 1.271"
          clipRule="evenodd"
        />
      </svg>
    </Box>
  );
};
