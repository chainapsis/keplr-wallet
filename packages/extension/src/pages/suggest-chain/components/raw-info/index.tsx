import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { ColorPalette } from "../../../../styles";
import { Subtitle4 } from "../../../../components/typography";
import { GuideBox } from "../../../../components/guide-box";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { ChainInfo } from "@keplr-wallet/types";
import { InteractionWaitingData } from "@keplr-wallet/background";
import { FormattedMessage, useIntl } from "react-intl";

const Styles = {
  Chip: styled.div`
    color: ${ColorPalette["gray-200"]};
    background-color: ${ColorPalette["gray-500"]};

    padding: 0.375rem 0.75rem;
    border-radius: 2.5rem;
  `,
};

export const RawInfoView: FunctionComponent<{
  communityChainInfoRepoUrl: string;
  waitingData: InteractionWaitingData<{
    chainInfo: ChainInfo;
    origin: string;
  }>;
}> = observer(({ waitingData, communityChainInfoRepoUrl }) => {
  const chainInfo = waitingData.data.chainInfo;
  const intl = useIntl();

  return (
    <Box paddingX="0.75rem" height="100%">
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Styles.Chip>{waitingData.data.origin}</Styles.Chip>
        <Gutter size="0.375rem" />
        <Box
          style={{
            display: "flex",
            width: "100%",
            padding: "1rem",
            backgroundColor: ColorPalette["gray-600"],
            borderRadius: "0.375rem",

            overflow: "auto",
          }}
        >
          <Box as={"pre"} style={{ margin: 0 }}>
            {JSON.stringify(chainInfo, null, 2)}
          </Box>
        </Box>

        <Box>
          <Gutter size="0.75rem" />

          <Box style={{ flex: 1 }} />

          <GuideBox
            title={intl.formatMessage({
              id: "page.suggest-chain.raw-info-view.guide-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.suggest-chain.raw-info-view.guide-paragraph",
            })}
            bottom={
              <a
                href={communityChainInfoRepoUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Subtitle4
                  color={ColorPalette["gray-100"]}
                  style={{ textDecoration: "underline" }}
                >
                  <FormattedMessage id="page.suggest-chain.raw-info-view.chain-registry-link-text" />
                </Subtitle4>
              </a>
            }
          />
        </Box>
      </Box>
    </Box>
  );
});
