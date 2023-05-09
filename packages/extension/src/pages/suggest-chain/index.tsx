import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../layouts/header";
import { CommunityInfoView, RawInfoView } from "./components";
import { useStore } from "../../stores";
import { ArrowLeftIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { useInteractionInfo } from "../../hooks";

export const SuggestChainPage: FunctionComponent = observer(() => {
  const { chainSuggestStore, uiConfigStore } = useStore();
  const [updateFromRepoDisabled, setUpdateFromRepoDisabled] = useState(false);

  const interactionInfo = useInteractionInfo(async () => {
    await chainSuggestStore.rejectAll();
  });

  const communityChainInfo = chainSuggestStore.waitingSuggestedChainInfo
    ? chainSuggestStore.getCommunityChainInfo(
        chainSuggestStore.waitingSuggestedChainInfo.data.chainInfo.chainId
      ).chainInfo
    : undefined;

  const isCommunityChainInfo: boolean = !!communityChainInfo;

  return (
    <HeaderLayout
      fixedHeight
      title={
        isCommunityChainInfo && !updateFromRepoDisabled
          ? ""
          : `Add ${chainSuggestStore.waitingSuggestedChainInfo?.data.chainInfo.chainName} to Keplr`
      }
      left={
        isCommunityChainInfo &&
        uiConfigStore.isDeveloper &&
        updateFromRepoDisabled ? (
          <Box
            paddingLeft="1rem"
            cursor="pointer"
            onClick={() => setUpdateFromRepoDisabled(!updateFromRepoDisabled)}
          >
            <ArrowLeftIcon />
          </Box>
        ) : null
      }
      bottomButton={{
        text: "Approve",
        size: "large",
        color: "primary",
        onClick: async () => {
          const chainInfo = updateFromRepoDisabled
            ? chainSuggestStore.waitingSuggestedChainInfo?.data.chainInfo
            : communityChainInfo ||
              chainSuggestStore.waitingSuggestedChainInfo?.data.chainInfo;

          if (chainInfo && chainSuggestStore.waitingSuggestedChainInfo) {
            await chainSuggestStore.approveWithProceedNext(
              chainSuggestStore.waitingSuggestedChainInfo.id,
              {
                ...chainInfo,
                updateFromRepoDisabled,
              },
              () => {
                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  window.close();
                }
              }
            );
          }
        },
      }}
    >
      {isCommunityChainInfo && !updateFromRepoDisabled ? (
        <CommunityInfoView
          updateFromRepoDisabled={updateFromRepoDisabled}
          setUpdateFromRepoDisabled={setUpdateFromRepoDisabled}
        />
      ) : (
        <RawInfoView
          isCommunityChainInfo={isCommunityChainInfo}
          updateFromRepoDisabled={updateFromRepoDisabled}
          setUpdateFromRepoDisabled={setUpdateFromRepoDisabled}
        />
      )}
    </HeaderLayout>
  );
});
