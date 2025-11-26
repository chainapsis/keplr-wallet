import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import { HeaderLayout } from "../../../../layouts/header";
import { BackButton } from "../../../../layouts/header/components";
import { Box } from "../../../../components/box";
import { CloseIcon, PlusIcon, QuestionIcon } from "../../../../components/icon";
import { ColorPalette } from "../../../../styles";
import { Stack } from "../../../../components/stack";
import { Body1, Body3, Subtitle3 } from "../../../../components/typography";
import { Column, Columns } from "../../../../components/column";
import { ChainImageFallback } from "../../../../components/image";
import { EmptyView } from "../../../../components/empty-view";
import { Gutter } from "../../../../components/gutter";
import { Tooltip } from "../../../../components/tooltip";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { dispatchGlobalEventExceptSelf } from "../../../../utils/global-events";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ModularChainInfoImpl } from "@keplr-wallet/stores";

export const SettingGeneralDeleteSuggestChainPage: FunctionComponent = observer(
  () => {
    const intl = useIntl();
    const { chainStore, keyRingStore } = useStore();
    const suggestedChains = chainStore.modularChainInfos.filter(
      (chainInfo) => !chainInfo.isNative
    );

    return (
      <HeaderLayout
        title={intl.formatMessage({
          id: "page.setting.advanced.manage-non-native-chains-title",
        })}
        left={<BackButton />}
        right={
          <a href="https://chains.keplr.app/" target="_blank" rel="noreferrer">
            <Box paddingRight="1rem" cursor="pointer">
              <PlusIcon color={ColorPalette["gray-300"]} />
            </Box>
          </a>
        }
      >
        <Box paddingX="0.75rem">
          <Stack gutter="0.5rem">
            {suggestedChains.length ? (
              suggestedChains.map((chainInfo) => {
                return (
                  <ChainItem
                    key={ChainIdHelper.parse(chainInfo.chainId).identifier}
                    chainInfoImpl={chainStore.getModularChainInfoImpl(
                      chainInfo.chainId
                    )}
                    onClickClose={async () => {
                      // 여기서 chain identifier를 쓰면 안되고 꼭 chainId를 써야함
                      await chainStore.removeChainInfo(chainInfo.chainId);

                      await keyRingStore.refreshKeyRingStatus();
                      await chainStore.updateChainInfosFromBackground();
                      await chainStore.updateEnabledChainIdentifiersFromBackground();

                      dispatchGlobalEventExceptSelf(
                        "keplr_suggested_chain_removed"
                      );
                    }}
                  />
                );
              })
            ) : (
              <React.Fragment>
                <Gutter size="9.25rem" direction="vertical" />
                <EmptyView>
                  <Subtitle3>
                    <FormattedMessage id="page.setting.general.delete-suggest-chain.empty-text" />
                  </Subtitle3>
                </EmptyView>
              </React.Fragment>
            )}
          </Stack>
        </Box>
      </HeaderLayout>
    );
  }
);

const ChainItem: FunctionComponent<{
  chainInfoImpl: ModularChainInfoImpl;
  onClickClose?: () => void;
}> = ({ chainInfoImpl: chainInfo, onClickClose }) => {
  const intl = useIntl();
  const theme = useTheme();

  return (
    <Box
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-600"]
      }
      borderRadius="0.375rem"
      paddingX="1rem"
      paddingY="1rem"
    >
      <Columns sum={1} alignY="center" gutter="0.375rem">
        <Box borderRadius="99999px">
          <ChainImageFallback chainInfo={chainInfo.embedded} size="3rem" />
        </Box>
        <Stack gutter="0.375rem">
          <Columns sum={1} alignY="center" gutter="0.25rem">
            <Body1
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-50"]
              }
            >
              {chainInfo.embedded.chainName}
            </Body1>
            <Tooltip
              content={intl.formatMessage({
                id: "page.setting.general.delete-suggest-chain.chain-item.tooltip-text",
              })}
            >
              <QuestionIcon
                width="1rem"
                height="1rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              />
            </Tooltip>
          </Columns>
          <Body3 color={ColorPalette["gray-300"]}>
            {chainInfo.getCurrencies()[0].coinDenom}
          </Body3>
        </Stack>

        <Column weight={1} />

        <Box onClick={onClickClose} cursor="pointer">
          <CloseIcon color={ColorPalette["gray-300"]} />
        </Box>
      </Columns>
    </Box>
  );
};
