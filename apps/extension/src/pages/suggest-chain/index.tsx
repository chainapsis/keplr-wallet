import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../layouts/header";
import { CommunityInfoView, RawInfoView, OriginInfoView } from "./components";
import { useStore } from "../../stores";
import { useInteractionInfo } from "../../hooks";
import { InteractionWaitingData } from "@keplr-wallet/background";
import { ChainInfo } from "@keplr-wallet/types";
import { FormattedMessage, useIntl } from "react-intl";
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { handleExternalInteractionWithNoProceedNext } from "../../utils";
import { dispatchGlobalEventExceptSelf } from "../../utils/global-events";
import { ColorPalette } from "../../styles";
import { useNavigate } from "react-router";

export const SuggestChainPage: FunctionComponent = observer(() => {
  const { chainSuggestStore } = useStore();

  useInteractionInfo({
    onWindowClose: async () => {
      await chainSuggestStore.rejectAll();
    },
  });

  const waitingData = chainSuggestStore.waitingSuggestedChainInfo;

  if (!waitingData) {
    return null;
  }
  // waiting data가 변하면 `SuggestChainPageImpl`가 unmount되고 다시 mount되는데,
  // 이때, `SuggestChainPageImpl`의 key가 바뀌면서, `SuggestChainPageImpl`의 state가 초기화된다.
  return (
    <SuggestChainPageImpl key={waitingData.id} waitingData={waitingData} />
  );
});

const SuggestChainPageImpl: FunctionComponent<{
  waitingData: InteractionWaitingData<{
    chainInfo: ChainInfo;
    origin: string;
  }>;
}> = observer(({ waitingData }) => {
  const { chainSuggestStore, permissionStore, keyRingStore, chainStore } =
    useStore();
  const [isLoadingPlaceholder, setIsLoadingPlaceholder] = useState(true);
  const [updateFromRepoDisabled, setUpdateFromRepoDisabled] = useState(false);

  const intl = useIntl();
  const navigate = useNavigate();
  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await chainSuggestStore.rejectWithProceedNext(waitingData.id, () => {});
    },
  });

  const queryCommunityChainInfo = chainSuggestStore.getCommunityChainInfo(
    waitingData.data.chainInfo.chainId
  );
  const communityChainInfo = queryCommunityChainInfo.chainInfo;

  const isLoading = permissionStore.isObsoleteInteraction(waitingData.id);

  useEffect(() => {
    if (!queryCommunityChainInfo.isLoading) {
      setIsLoadingPlaceholder(false);
    }
  }, [queryCommunityChainInfo.isLoading]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingPlaceholder(false);
    }, 1000);
  }, []);

  return (
    <HeaderLayout
      fixedHeight
      isNotReady={isLoadingPlaceholder}
      title={(() => {
        if (isLoadingPlaceholder) {
          return undefined;
        }

        if (communityChainInfo != null && !updateFromRepoDisabled) {
          return undefined;
        }

        return (
          <FormattedMessage
            id="page.suggest-chain.title"
            values={{ chainName: waitingData.data.chainInfo.chainName }}
          />
        );
      })()}
      left={
        communityChainInfo != null && updateFromRepoDisabled ? (
          <Box
            paddingLeft="1rem"
            cursor="pointer"
            onClick={() => setUpdateFromRepoDisabled(false)}
          >
            <ArrowLeftIcon />
          </Box>
        ) : undefined
      }
      bottomButtons={[
        {
          textOverrideIcon: <XMarkIcon color={ColorPalette["gray-200"]} />,
          size: "large",
          color: "secondary",
          style: {
            width: "3.25rem",
          },
          onClick: async () => {
            await chainSuggestStore.rejectWithProceedNext(
              waitingData.id,
              async (proceedNext) => {
                if (!proceedNext) {
                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    handleExternalInteractionWithNoProceedNext();
                  } else if (
                    interactionInfo.interaction &&
                    interactionInfo.interactionInternal
                  ) {
                    window.history.length > 1 ? navigate(-1) : navigate("/");
                  } else {
                    navigate("/", { replace: true });
                  }
                }
              }
            );
          },
        },
        {
          text: intl.formatMessage({ id: "button.approve" }),
          size: "large",
          color: "primary",
          left: !isLoading && <CheckIcon />,
          isLoading,
          onClick: async () => {
            const chainInfo =
              communityChainInfo && !updateFromRepoDisabled
                ? communityChainInfo
                : waitingData.data.chainInfo;

            const ids = new Set([waitingData.id]);
            for (const data of chainSuggestStore.waitingSuggestedChainInfos) {
              if (
                data.data.chainInfo.chainId ===
                  waitingData.data.chainInfo.chainId &&
                data.data.origin === waitingData.data.origin
              ) {
                ids.add(data.id);
              }
            }
            await chainSuggestStore.approveWithProceedNext(
              Array.from(ids),
              {
                ...chainInfo,
                updateFromRepoDisabled,
              },
              async (proceedNext) => {
                await keyRingStore.refreshKeyRingStatus();
                await chainStore.updateChainInfosFromBackground();
                await chainStore.updateEnabledChainIdentifiersFromBackground();

                dispatchGlobalEventExceptSelf("keplr_suggested_chain_added");

                if (!proceedNext) {
                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    handleExternalInteractionWithNoProceedNext();
                  }
                }
              }
            );
          },
        },
      ]}
    >
      {(() => {
        if (isLoadingPlaceholder) {
          return (
            <CommunityInfoView
              isNotReady={isLoadingPlaceholder}
              origin={waitingData.data.origin}
              chainInfo={waitingData.data.chainInfo}
              communityChainInfoUrl="https://noop.noop"
            />
          );
        }

        if (communityChainInfo) {
          if (updateFromRepoDisabled) {
            return <OriginInfoView waitingData={waitingData} />;
          } else {
            return (
              <CommunityInfoView
                isNotReady={false}
                origin={waitingData.data.origin}
                chainInfo={communityChainInfo}
                communityChainInfoUrl={chainSuggestStore.getCommunityChainInfoUrl(
                  communityChainInfo.chainId
                )}
                setUpdateFromRepoDisabled={() =>
                  setUpdateFromRepoDisabled(true)
                }
              />
            );
          }
        }

        return (
          <RawInfoView
            waitingData={waitingData}
            communityChainInfoRepoUrl={
              chainSuggestStore.communityChainInfoRepoUrl
            }
          />
        );
      })()}
    </HeaderLayout>
  );
});
