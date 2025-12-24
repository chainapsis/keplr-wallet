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
import { XAxis, YAxis } from "../../components/axis";
import { SearchTextInput } from "../../components/input";
import { NewTokenFoundButtonContainer } from "../../components/new-token-found-button";
import styled, {
  css,
  FlattenSimpleInterpolation,
  useTheme,
} from "styled-components";
import { ColorPalette } from "../../styles";
import { ButtonTheme } from "../../components/button";
import { ArrowRightIcon, PlusIcon } from "../../components/icon";
import { useNavigate } from "react-router";
import { TokenFoundModal } from "../main/components";
import { Modal } from "../../components/modal";
import { Subtitle3 } from "../../components/typography";
import { useSearch } from "../../hooks/use-search";
import { ViewToken } from "../main";
import { CoinPretty } from "@keplr-wallet/unit";
import { sortByPrice } from "../../utils/token-sort";

const searchFields = [
  {
    key: "originCurrency.coinDenom",
    function: (item: ViewToken) => {
      const currency = item.token.currency;
      if ("originCurrency" in currency) {
        return CoinPretty.makeCoinDenomPretty(
          currency.originCurrency?.coinDenom || ""
        );
      }
      return CoinPretty.makeCoinDenomPretty(currency.coinDenom);
    },
  },
  "chainInfo.chainName",
];

export const ManageViewAssetTokenListPage: FunctionComponent = observer(() => {
  const { hugeQueriesStore, keyRingStore, uiConfigStore, chainStore } =
    useStore();
  const intl = useIntl();
  const [sortMode, setSortMode] = useState<"asc" | "desc" | undefined>(
    undefined
  );
  const navigate = useNavigate();
  const theme = useTheme();
  const [isFoundTokenModalOpen, setIsFoundTokenModalOpen] = useState(false);

  const numFoundToken = useMemo(() => {
    if (chainStore.tokenScans.length === 0) {
      return 0;
    }

    const set = new Set<string>();

    for (const tokenScan of chainStore.tokenScans) {
      for (const info of tokenScan.infos) {
        for (const asset of info.assets) {
          const key = `${ChainIdHelper.parse(tokenScan.chainId).identifier}/${
            asset.currency.coinMinimalDenom
          }`;
          set.add(key);
        }
      }
    }

    return Array.from(set).length;
  }, [chainStore.tokenScans]);

  const allBalances = hugeQueriesStore.getAllBalances({
    allowIBCToken: true,
    enableFilterDisabledAssetToken: false,
  });
  const [search, setSearch] = useState("");
  const searchedBalances = useSearch([...allBalances], search, searchFields);
  const sortedBalances = useMemo(() => {
    const searchedBalancesSliced = [...searchedBalances];
    if (sortMode === "asc") {
      return searchedBalancesSliced.sort((a, b) => -sortByPrice(a, b));
    } else if (sortMode === "desc") {
      return searchedBalancesSliced.sort(sortByPrice);
    } else {
      return searchedBalancesSliced;
    }
  }, [searchedBalances, sortMode]);

  const disabledTokenMap =
    uiConfigStore.manageViewAssetTokenConfig.getViewAssetTokenMapByVaultId(
      keyRingStore.selectedKeyInfo?.id ?? ""
    );

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

  const handleEnableToken = async (
    chainId: string,
    coinMinimalDenom: string
  ) => {
    uiConfigStore.manageViewAssetTokenConfig.enableViewAssetToken(
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
      right={
        <Box
          paddingRight="1rem"
          cursor="pointer"
          onClick={() => navigate("/setting/token/add")}
        >
          <PlusIcon
            color={
              theme.mode === "light"
                ? ColorPalette["gray-200"]
                : ColorPalette["gray-300"]
            }
          />
        </Box>
      }
    >
      <Box paddingX="0.75rem" style={{ overflowX: "hidden" }}>
        <SearchTextInput
          placeholder={intl.formatMessage({
            id: "page.setting.general.manage-asset-list.search.placeholder",
          })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <YAxis alignX="right">
          <Gutter size="0.25rem" />
          <XAxis alignY="center">
            <Styles.SortButton
              onClick={() => {
                if (sortMode === undefined) {
                  setSortMode("desc");
                } else if (sortMode === "desc") {
                  setSortMode("asc");
                } else {
                  setSortMode(undefined);
                }
              }}
            >
              {intl.formatMessage({
                id: "page.setting.general.manage-asset-list.sort-button",
              })}
              <UpDownArrowIcon sortMode={sortMode} mode={theme.mode} />
            </Styles.SortButton>
          </XAxis>
        </YAxis>

        <Stack>
          {numFoundToken > 0 && (
            <NewTokenFoundButtonContainer
              onClick={() => setIsFoundTokenModalOpen(true)}
            >
              <XAxis alignY="center">
                <Subtitle3>
                  {intl.formatMessage(
                    { id: "page.main.spendable.new-token-found" },
                    {
                      numFoundToken: (
                        <span
                          style={{
                            paddingRight: "0.25rem",
                            color: ColorPalette["blue-300"],
                          }}
                        >
                          {numFoundToken}
                        </span>
                      ),
                    }
                  )}
                </Subtitle3>
                <div style={{ flex: 1 }} />
                <ArrowRightIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={ColorPalette["gray-300"]}
                />
              </XAxis>
            </NewTokenFoundButtonContainer>
          )}
          {sortedBalances.map((viewToken) => {
            const chainIdentifier = ChainIdHelper.parse(
              viewToken.chainInfo.chainId
            ).identifier;

            const isDisabled = disabledTokenMap
              .get(chainIdentifier)
              ?.has(viewToken.token.currency.coinMinimalDenom);

            return (
              <TokenItem
                onClick={() => {
                  isDisabled
                    ? handleEnableToken(
                        viewToken.chainInfo.chainId,
                        viewToken.token.currency.coinMinimalDenom
                      )
                    : handleDisableToken(
                        viewToken.chainInfo.chainId,
                        viewToken.token.currency.coinMinimalDenom
                      );
                }}
                key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                viewToken={viewToken}
                right={
                  <XAxis>
                    <Gutter size="0.5rem" />
                    <Toggle isOpen={!isDisabled} size="small" />
                  </XAxis>
                }
              />
            );
          })}
        </Stack>
      </Box>

      <Modal
        isOpen={isFoundTokenModalOpen && numFoundToken > 0}
        align="bottom"
        close={() => setIsFoundTokenModalOpen(false)}
      >
        <TokenFoundModal close={() => setIsFoundTokenModalOpen(false)} />
      </Modal>
    </HeaderLayout>
  );
});

const UpDownArrowIcon = ({
  sortMode,
  mode,
}: {
  sortMode: "asc" | "desc" | undefined;
  mode: "light" | "dark";
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="6"
      height="16"
      viewBox="0 0 6 16"
      fill="none"
    >
      <path
        d="M2.63295 0.847697C2.77212 0.52629 3.22791 0.526291 3.36708 0.847698L5.35608 5.44107C5.47044 5.70519 5.27682 6.00002 4.98901 6.00002H1.01102C0.72321 6.00002 0.529592 5.70519 0.643956 5.44107L2.63295 0.847697Z"
        fill={
          mode === "light"
            ? sortMode === "asc"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-300"]
            : sortMode === "asc"
            ? ColorPalette["white"]
            : ColorPalette["gray-300"]
        }
      />
      <path
        d="M3.36711 15.1523C3.22794 15.4737 2.77215 15.4737 2.63298 15.1523L0.643986 10.5589C0.529621 10.2948 0.72324 9.99998 1.01105 9.99998L4.98904 9.99998C5.27685 9.99998 5.47047 10.2948 5.3561 10.5589L3.36711 15.1523Z"
        fill={
          mode === "light"
            ? sortMode === "desc"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-300"]
            : sortMode === "desc"
            ? ColorPalette["white"]
            : ColorPalette["gray-300"]
        }
      />
    </svg>
  );
};
const Styles = {
  //NOTE - 기존 textButton과 다른 hover 스타일이라서 따로 정의
  SortButton: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem; /* 텍스트와 아이콘 사이 간격 */
    height: 2rem;
    padding: 0 0.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    overflow: hidden;
    font-weight: 500;
    font-size: 0.875rem;
    letter-spacing: 0.2px;
    white-space: nowrap;
    border: 0;
    ${({ theme }) => buttonStyleFromColorAndMode[theme.mode || "dark"]}
    background-color: transparent;
    position: relative;
    ::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
  `,
};
const buttonStyleFromColorAndMode: Record<
  ButtonTheme,
  FlattenSimpleInterpolation
> = {
  light: css`
    color: ${ColorPalette["gray-300"]};
    :hover {
      color: ${ColorPalette["gray-200"]};
    }
  `,
  dark: css`
    color: ${ColorPalette["gray-300"]};
    :hover {
      color: ${ColorPalette["gray-400"]};
    }
  `,
};
