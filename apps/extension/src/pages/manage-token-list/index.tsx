import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useStore } from "../../stores";
import { useGetSearchChains } from "../../hooks/use-get-search-chains";
import { HeaderLayout } from "../../layouts/header";
import { BackButton } from "../../layouts/header/components";
import { Styles } from "../../components/box";
import { TextInput } from "../../components/input";
import { TokenItem } from "../main/components";
import { Stack } from "../../components/stack";
import { Toggle } from "../../components/toggle";

export const ManageAssetListPage: FunctionComponent = observer(() => {
  const { hugeQueriesStore, keyRingStore, uiConfigStore } = useStore();
  const intl = useIntl();

  const allBalances = hugeQueriesStore.getAllBalances({
    allowIBCToken: true,
    enableDisableAssetToken: false,
  });

  const [search, setSearch] = useState("");
  const { trimSearch } = useGetSearchChains({
    search,
    searchOption: "all",
    filterOption: "chainNameAndToken",
    minSearchLength: 3,
    clearResultsOnEmptyQuery: true,
  });

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
      <Styles.Container>
        {/* 검색 입력 필드 추가 */}
        <TextInput
          placeholder={intl.formatMessage({
            id: "page.setting.general.manage-asset-list.search.placeholder",
          })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Stack>
          {filteredTokens.map((viewToken) => {
            const isDisabled = disabledTokenMap.has(
              uiConfigStore.manageViewAssetTokenConfig.makeViewAssetTokenKey({
                chainId: viewToken.chainInfo.chainId,
                coinMinimalDenom: viewToken.token.currency.coinMinimalDenom,
              })
            );

            return (
              <TokenItem
                key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                viewToken={viewToken}
                right={
                  <Toggle
                    isOpen={!isDisabled}
                    setIsOpen={() =>
                      handleDisableToken(
                        viewToken.chainInfo.chainId,
                        viewToken.token.currency.coinMinimalDenom
                      )
                    }
                  />
                }
              />
            );
          })}
        </Stack>
      </Styles.Container>
    </HeaderLayout>
  );
});
