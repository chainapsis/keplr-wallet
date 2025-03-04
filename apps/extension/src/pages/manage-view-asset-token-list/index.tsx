import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useStore } from "../../stores";
import { HeaderLayout } from "../../layouts/header";
import { BackButton } from "../../layouts/header/components";
import { Box } from "../../components/box";
import { TokenItem } from "../main/components";
import { Stack } from "../../components/stack";
import { Toggle } from "../../components/toggle";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Gutter } from "../../components/gutter";
import { XAxis } from "../../components/axis";
import { SearchTextInput } from "../../components/input";

export const ManageViewAssetTokenListPage: FunctionComponent = observer(() => {
  const { hugeQueriesStore, keyRingStore, uiConfigStore } = useStore();
  const intl = useIntl();

  const allBalances = hugeQueriesStore.getAllBalances({
    allowIBCToken: true,
    enableFilterDisabledAssetToken: false,
  });

  const [search, setSearch] = useState("");
  const trimSearch = search.trim().toLowerCase();

  const disabledTokenMap =
    uiConfigStore.manageViewAssetTokenConfig.getViewAssetTokenMapByVaultId(
      keyRingStore.selectedKeyInfo?.id ?? ""
    );

  const filteredTokens = useMemo(() => {
    return allBalances.filter(
      (token) =>
        token.chainInfo.chainName.toLowerCase().includes(trimSearch) ||
        token.token.currency.coinDenom.toLowerCase().includes(trimSearch)
    );
  }, [allBalances, trimSearch]);

  const handleDisableToken = async (
    chainId: string,
    coinMinimalDenom: string
  ) => {
    uiConfigStore.manageViewAssetTokenConfig.disableViewAssetToken(
      keyRingStore.selectedKeyInfo?.id ?? "",
      {
        chainId,
        coinMinimalDenom,
      }
    );
  };

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "page.setting.general.manage-asset-list-title",
      })}
      left={<BackButton />}
    >
      <Box paddingX="0.75rem" style={{ overflowX: "hidden" }}>
        <SearchTextInput
          placeholder={intl.formatMessage({
            id: "page.setting.general.manage-asset-list.search.placeholder",
          })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Stack gutter="0.5rem">
          {filteredTokens.map((viewToken) => {
            const chainIdentifier = ChainIdHelper.parse(
              viewToken.chainInfo.chainId
            ).identifier;

            const isDisabled = disabledTokenMap
              .get(chainIdentifier)
              ?.has(viewToken.token.currency.coinMinimalDenom);

            return (
              <TokenItem
                key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                viewToken={viewToken}
                right={
                  <XAxis>
                    <Gutter size="0.5rem" />
                    <Toggle
                      isOpen={!isDisabled}
                      setIsOpen={() =>
                        handleDisableToken(
                          viewToken.chainInfo.chainId,
                          viewToken.token.currency.coinMinimalDenom
                        )
                      }
                      size="small"
                    />
                  </XAxis>
                }
              />
            );
          })}
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
