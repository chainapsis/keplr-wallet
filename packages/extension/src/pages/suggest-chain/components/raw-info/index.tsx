import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { ColorPalette } from "../../../../styles";
import { Checkbox } from "../../../../components/checkbox";
import { Body2, Subtitle4 } from "../../../../components/typography";
import { GuideBox } from "../../../../components/guide-box";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { WarningBox } from "../../../../components/warning-box";

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
  updateFromRepoDisabled: boolean;
  setUpdateFromRepoDisabled: (updateFromRepoDisabled: boolean) => void;
}> = observer(
  ({
    isCommunityChainInfo,
    updateFromRepoDisabled,
    setUpdateFromRepoDisabled,
  }) => {
    const { chainSuggestStore, uiConfigStore } = useStore();

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
          <Styles.Chip>
            {chainSuggestStore.waitingSuggestedChainInfo?.data.origin}
          </Styles.Chip>

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

          {isCommunityChainInfo ? (
            <WarningBox
              title="Before You Approve"
              paragraph="Adding this chain requires information from a web page that is not managed by Keplr."
            />
          ) : (
            <Box>
              {uiConfigStore.isDeveloper ? (
                <Box
                  paddingY="0.375rem"
                  cursor="pointer"
                  onClick={() =>
                    setUpdateFromRepoDisabled(!updateFromRepoDisabled)
                  }
                >
                  <XAxis alignY="top">
                    <Checkbox
                      size="small"
                      checked={updateFromRepoDisabled}
                      onChange={setUpdateFromRepoDisabled}
                    />

                    <Gutter size="0.375rem" />

                    <Body2 style={{ color: ColorPalette["gray-300"], flex: 1 }}>
                      Use this as the preferred code string and override info
                      registered on the community repo
                    </Body2>
                  </XAxis>
                </Box>
              ) : null}

              <Gutter size="0.75rem" />

              <Box style={{ flex: 1 }} />

              <GuideBox
                title="Before You Approve"
                paragraph="Keplr recommends that ‘suggest chain’info be managed by the community. At this time, this chain’s info has not been registered."
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
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);
