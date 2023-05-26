import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { ColorPalette } from "../../../../styles";
import { Subtitle4 } from "../../../../components/typography";
import { GuideBox } from "../../../../components/guide-box";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { WarningBox } from "../../../../components/warning-box";
import { Skeleton } from "../../../../components/skeleton";

const Styles = {
  Chip: styled.div`
    color: ${ColorPalette["gray-200"]};
    background-color: ${ColorPalette["gray-500"]};

    padding: 0.375rem 0.75rem;
    border-radius: 2.5rem;
  `,
};

export const RawInfoView: FunctionComponent<{
  isCommunityChainInfo: boolean;
  isNotReady?: boolean;
}> = observer(
  ({
    isCommunityChainInfo,

    isNotReady,
  }) => {
    console.log("RawInfoView", isNotReady);
    const { chainSuggestStore } = useStore();

    const chainInfo =
      chainSuggestStore.waitingSuggestedChainInfo?.data.chainInfo;

    if (!chainInfo) {
      return null;
    }

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
          <Skeleton isNotReady={isNotReady}>
            <Styles.Chip>
              {chainSuggestStore.waitingSuggestedChainInfo?.data.origin}
            </Styles.Chip>
          </Skeleton>

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
            <Skeleton isNotReady={isNotReady} dummyMinWidth="21rem">
              <Box as={"pre"} style={{ margin: 0 }}>
                {JSON.stringify(chainInfo, null, 2)}
              </Box>
            </Skeleton>
          </Box>

          {isCommunityChainInfo ? (
            <Skeleton isNotReady={isNotReady}>
              <WarningBox
                title="Before You Approve"
                paragraph="Adding this chain requires information from a web page that is not managed by Keplr."
              />
            </Skeleton>
          ) : (
            <Box>
              <Gutter size="0.75rem" />

              <Box style={{ flex: 1 }} />

              <Skeleton isNotReady={isNotReady}>
                <GuideBox
                  title="Before You Approve"
                  paragraph="This chain’s info is not available on Keplr Chain Registry. Keplr recommends that ‘suggest chain’ info be managed by the community."
                  bottom={
                    <a
                      href={chainSuggestStore.communityChainInfoRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Subtitle4
                        color={ColorPalette["gray-100"]}
                        style={{ textDecoration: "underline" }}
                      >
                        Click here to update chain info on Github
                      </Subtitle4>
                    </a>
                  }
                />
              </Skeleton>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);
