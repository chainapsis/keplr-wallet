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

export const HistoryDetailPage: FunctionComponent = observer(() => {
  const { queriesStore, priceStore } = useStore();

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
  }>(process.env["KEPLR_EXT_CONFIG_SERVER"], `/tx-history/explorer/${chainId}`);

  const explorerUrl = queryExplorer.response?.data.link || "";

  return (
    <HeaderLayout title="Transaction Detail" left={<BackButton />}>
      <Box paddingX="0.75rem">
        <Gutter size="1.75rem" />
        <HistoryDetailCommonBottomSection msg={msg.msg} />
      </Box>
    </HeaderLayout>
  );
});
