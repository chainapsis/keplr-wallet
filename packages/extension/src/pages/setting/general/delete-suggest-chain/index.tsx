import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import { HeaderLayout } from "../../../../layouts/header";
import { BackButton } from "../../../../layouts/header/components";
import { Box } from "../../../../components/box";
import { CloseIcon, PlusIcon } from "../../../../components/icon";
import { ColorPalette } from "../../../../styles";
import { Stack } from "../../../../components/stack";
import { Body1, Body3 } from "../../../../components/typography";
import { ChainInfo } from "@keplr-wallet/types";
import { Column, Columns } from "../../../../components/column";
import { ChainImageFallback } from "../../../../components/image";
import { EmptyView } from "../../../../components/empty-view";
import { Gutter } from "../../../../components/gutter";
import { useIntl } from "react-intl";

export const SettingGeneralDeleteSuggestChainPage: FunctionComponent = observer(
  () => {
    const { chainStore } = useStore();
    const intl = useIntl();

    const suggestedChains = chainStore.chainInfos.filter(
      (chainInfo) => !chainInfo.embedded.embedded
    );

    return (
      <HeaderLayout
        title={intl.formatMessage({
          id: "pages.setting.general.manage-suggest-chain.header",
        })}
        left={<BackButton />}
        right={
          <a href="https://chains.keplr.app/" target="_blank" rel="noreferrer">
            <Box paddingRight="1rem" cursor="pointer">
              <PlusIcon color={ColorPalette["gray-50"]} />
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
                    key={chainInfo.chainIdentifier}
                    chainInfo={chainInfo}
                    onClick={() => {
                      chainStore.removeChainInfo(chainInfo.chainIdentifier);
                    }}
                  />
                );
              })
            ) : (
              <React.Fragment>
                <Gutter size="9.25rem" direction="vertical" />
                <EmptyView
                  subject={intl.formatMessage({
                    id: "pages.setting.general.manage-suggest-chain.not-found",
                  })}
                />
              </React.Fragment>
            )}
          </Stack>
        </Box>
      </HeaderLayout>
    );
  }
);

const ChainItem: FunctionComponent<{
  chainInfo: ChainInfo;
  onClick?: () => void;
}> = ({ chainInfo, onClick }) => {
  return (
    <Box
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="0.375rem"
      paddingX="1rem"
      paddingY="1rem"
      onClick={onClick}
    >
      <Columns sum={1} alignY="center" gutter="0.375rem">
        <Box borderRadius="50%">
          <ChainImageFallback
            width="48px"
            height="48px"
            alt={`${chainInfo.chainId}-${chainInfo.chainName}-image`}
            src={chainInfo.chainSymbolImageUrl}
          />
        </Box>
        <Stack gutter="0.375rem">
          <Body1 color={ColorPalette["gray-50"]}>{chainInfo.chainName}</Body1>
          <Body3 color={ColorPalette["gray-300"]}>
            {chainInfo.currencies[0].coinDenom}
          </Body3>
        </Stack>

        <Column weight={1} />

        <Box cursor="pointer">
          <CloseIcon />
        </Box>
      </Columns>
    </Box>
  );
};
