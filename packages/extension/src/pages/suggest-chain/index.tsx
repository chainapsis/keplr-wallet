import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../layouts/header";
import { CommunityInfoView, RawInfoView } from "./components";
import { useStore } from "../../stores";
import { ArrowLeftIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { useInteractionInfo } from "../../hooks";

export const SuggestChainPage: FunctionComponent = observer(() => {
  const { chainSuggestStore, uiConfigStore } = useStore();
  const [isRaw, setIsRaw] = useState(false);
  const [isLoadingPlaceholder, setIsLoadingPlaceholder] = useState(true);

  const interactionInfo = useInteractionInfo(async () => {
    await chainSuggestStore.rejectAll();
  });

  const communityChainInfo = chainSuggestStore.waitingSuggestedChainInfo
    ? chainSuggestStore.getCommunityChainInfo(
        chainSuggestStore.waitingSuggestedChainInfo.data.chainInfo.chainId
      ).chainInfo
    : undefined;
  const hasCommunityChainInfo: boolean = !!communityChainInfo;

  const isLoading = chainSuggestStore.getCommunityChainInfo(
    chainSuggestStore.waitingSuggestedChainInfo?.data.chainInfo.chainId ?? ""
  ).isLoading;

  useEffect(() => {
    if (!isLoading) {
      setIsLoadingPlaceholder(false);
    }
  }, [isLoading]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingPlaceholder(false);
    }, 1000);
  }, []);

  return (
    <HeaderLayout
      fixedHeight
      isNotReady={isLoadingPlaceholder}
      title={
        hasCommunityChainInfo && !isRaw
          ? ""
          : `Add ${chainSuggestStore.waitingSuggestedChainInfo?.data.chainInfo.chainName} to Keplr`
      }
      left={
        hasCommunityChainInfo && uiConfigStore.isDeveloper && isRaw ? (
          <Box
            paddingLeft="1rem"
            cursor="pointer"
            onClick={() => setIsRaw(!isRaw)}
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
          const chainInfo =
            communityChainInfo ||
            chainSuggestStore.waitingSuggestedChainInfo?.data.chainInfo;

          if (chainInfo && chainSuggestStore.waitingSuggestedChainInfo) {
            await chainSuggestStore.approveWithProceedNext(
              chainSuggestStore.waitingSuggestedChainInfo.id,
              {
                ...chainInfo,
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
      {(isLoadingPlaceholder || hasCommunityChainInfo) && !isRaw ? (
        <CommunityInfoView
          isRaw={isRaw}
          setIsRaw={() => setIsRaw(!isRaw)}
          isNotReady={isLoadingPlaceholder}
        />
      ) : (
        <RawInfoView
          isCommunityChainInfo={hasCommunityChainInfo}
          isNotReady={isLoadingPlaceholder}
        />
      )}
    </HeaderLayout>
  );
});
