import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { TokenTitleView } from "../token";
import { ColorPalette } from "../../../../styles";
import { ModularChainInfo } from "@keplr-wallet/types";
import { Gutter } from "../../../../components/gutter";
import { ChainImageFallback } from "../../../../components/image";
import { Column, Columns } from "../../../../components/column";
import { YAxis } from "../../../../components/axis";
import { Body3, Subtitle2 } from "../../../../components/typography";
import Color from "color";
import { Button } from "../../../../components/button";
import { useStore } from "../../../../stores";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { dispatchGlobalEventExceptSelf } from "../../../../utils/global-events";
import { Stack } from "../../../../components/stack";
import { NativeChainMarkIcon } from "../../../../components/icon";
import { useNavigate } from "react-router";
import { convertModularChainInfoToChainInfo } from "@keplr-wallet/common";
import { useKeyCoinTypeFinalize } from "../../../manage-chains/hooks/use-key-coin-type-finalize";
import { determineLedgerApp } from "../../../../utils/determine-ledger-app";

export const LookingForChains: FunctionComponent<{
  lookingForChains: {
    embedded: boolean;
    stored: boolean;
    chainInfo: ModularChainInfo;
  }[];
  search: string;
}> = ({ lookingForChains }) => {
  const intl = useIntl();

  return (
    <Box>
      <Box marginBottom="0.5rem" paddingX="0.375rem">
        <TokenTitleView
          title={intl.formatMessage({
            id: "page.main.components.looking-for-chains.title",
          })}
        />
      </Box>
      <Stack gutter="0.5rem">
        {lookingForChains.map((chainData) => (
          <LookingForChainItem
            key={chainData.chainInfo.chainId}
            chainInfo={chainData.chainInfo}
            embedded={chainData.embedded}
            stored={chainData.stored}
          />
        ))}
      </Stack>
    </Box>
  );
};

export const LookingForChainItem: FunctionComponent<{
  chainInfo: ModularChainInfo;
  embedded: boolean;
  stored: boolean;
}> = observer(({ chainInfo, embedded, stored }) => {
  const { analyticsStore, keyRingStore, chainStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const { needFinalizeKeyCoinTypeAction } = useKeyCoinTypeFinalize();

  const chainId = chainInfo.chainId;

  return (
    <Box
      backgroundColor={Color(
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-650"]
      )
        .alpha(0.6)
        .string()}
      paddingX="1rem"
      paddingY="0.875rem"
      borderRadius="0.375rem"
      style={{
        boxShadow:
          theme.mode === "light"
            ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
            : undefined,
      }}
    >
      <Columns sum={1} gutter="0.5rem" alignY="center">
        <Box position="relative">
          <ChainImageFallback chainInfo={chainInfo} size="2rem" />
          {embedded && (
            <Box
              position="absolute"
              style={{
                bottom: "-0.125rem",
                right: "-0.125rem",
              }}
            >
              <NativeChainMarkIcon width="1rem" height="1rem" />
            </Box>
          )}
        </Box>

        <Gutter size="0.75rem" />

        <YAxis>
          <Subtitle2
            color={Color(
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-10"]
            )
              .alpha(0.6)
              .string()}
          >
            {chainInfo.chainName}
          </Subtitle2>

          <Gutter size="0.25rem" />

          <Body3 color={Color(ColorPalette["gray-300"]).alpha(0.6).string()}>
            {intl.formatMessage({
              id: "page.main.components.looking-for-chains.not-enabled",
            })}
          </Body3>
        </YAxis>

        <Column weight={1} />

        <Button
          text={intl.formatMessage({
            id: "page.main.components.looking-for-chains.enable-button",
          })}
          size="small"
          color="secondary"
          onClick={async () => {
            // If the chain is not embedded and not added to the store,
            // add the chain internally and refresh the store.
            if (!embedded && !stored) {
              try {
                if ("bech32Config" in chainInfo) {
                  const convertedChainInfo =
                    convertModularChainInfoToChainInfo(chainInfo);

                  if (!convertedChainInfo) {
                    return;
                  }

                  await window.keplr?.experimentalSuggestChain(
                    convertedChainInfo
                  );
                  await keyRingStore.refreshKeyRingStatus();
                  await chainStore.updateChainInfosFromBackground();
                  await chainStore.updateEnabledChainIdentifiersFromBackground();

                  dispatchGlobalEventExceptSelf("keplr_suggested_chain_added");
                }
              } catch {
                return;
              }
            }

            if (keyRingStore.selectedKeyInfo) {
              analyticsStore.logEvent("click_enableChain", {
                chainId: chainInfo.chainId,
                chainName: chainInfo.chainName,
              });

              if (
                chainStore.hasModularChain(chainId) &&
                chainStore
                  .getModularChainInfoImpl(chainId)
                  .matchModule("cosmos")
              ) {
                const needModal = await needFinalizeKeyCoinTypeAction(
                  keyRingStore.selectedKeyInfo.id,
                  chainInfo
                );

                if (!needModal) {
                  await chainStore.enableChainInfoInUI(chainInfo.chainId);
                }
              }

              if (chainStore.hasModularChain(chainId)) {
                if (keyRingStore.selectedKeyInfo?.type === "ledger") {
                  const ledgerApp = determineLedgerApp(
                    chainStore,
                    chainInfo,
                    chainId
                  );

                  const alreadyAppended = Boolean(
                    keyRingStore.selectedKeyInfo?.insensitive?.[ledgerApp]
                  );

                  if (alreadyAppended) {
                    await chainStore.enableChainInfoInUI(chainInfo.chainId);
                  }
                }
              }

              navigate(
                `/manage-chains?vaultId=${keyRingStore.selectedKeyInfo.id}&initialSearchValue=${chainInfo.chainName}`
              );
            }
          }}
        />
      </Columns>
    </Box>
  );
});
