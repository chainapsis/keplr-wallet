import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import styled, { useTheme } from "styled-components";
import { Stack } from "../../../components/stack";
import { SearchTextInput } from "../../../components/input";
import { useStore } from "../../../stores";
import { TokenItem } from "../../main/components";
import { Column, Columns } from "../../../components/column";
import { Body2, H2, Subtitle3 } from "../../../components/typography";
import { Checkbox } from "../../../components/checkbox";
import { ColorPalette } from "../../../styles";
import { Dec } from "@keplr-wallet/unit";
import { useFocusOnMount } from "../../../hooks/use-focus-on-mount";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Box } from "../../../components/box";
import { Gutter } from "../../../components/gutter";
import { NOBLE_CHAIN_ID } from "../../../config.ui";
import { YAxis } from "../../../components/axis";
import { StackIcon } from "../../../components/icon/stack";
import { useSearch } from "../../../hooks/use-search";
import { ViewToken } from "../../main";
import { getTokenSearchResultClickAnalyticsProperties } from "../../../analytics-amplitude";
import { EmptyView } from "../../../components/empty-view";

const Styles = {
  Container: styled(Stack)<{ isNobleEarn: boolean }>`
    padding: ${({ isNobleEarn }) =>
      isNobleEarn ? "0.75rem 1.25rem" : "0.75rem"};
  `,
};

const searchFields = [
  {
    key: "originCurrency.coinDenom",
    function: (item: ViewToken) => {
      const currency = item.token.currency;
      if ("originCurrency" in currency) {
        return currency.originCurrency?.coinDenom || "";
      }
      return currency.coinDenom;
    },
  },
  "chainInfo.chainName",
];

export const SendSelectAssetPage: FunctionComponent = observer(() => {
  const {
    hugeQueriesStore,
    skipQueriesStore,
    chainStore,
    analyticsAmplitudeStore,
  } = useStore();
  const navigate = useNavigate();
  const intl = useIntl();
  const theme = useTheme();
  const [searchParams] = useSearchParams();

  /*
    navigate(
      `/send/select-asset?isIBCTransfer=true&navigateTo=${encodeURIComponent(
        "/ibc-transfer?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
      )}`
    );
    같은 형태로 써야함...
   */
  const paramNavigateTo = searchParams.get("navigateTo");
  const paramNavigateReplace = searchParams.get("navigateReplace");
  const paramIsIBCTransfer = searchParams.get("isIBCTransfer") === "true";
  const paramIsIBCSwap = searchParams.get("isIBCSwap") === "true";
  const paramIsNobleEarn = searchParams.get("isNobleEarn") === "true";

  const [search, setSearch] = useState("");
  const [hideIBCToken, setHideIBCToken] = useState(false);

  const searchRef = useFocusOnMount<HTMLInputElement>();

  const tokens = hugeQueriesStore.getAllBalances({
    allowIBCToken: !hideIBCToken,
    //현재 스왑에서는 해당 페이지를 쓰는게 from일때라서 paramIsIBCSwap이 true이면
    //필터링을 활성화함
    enableFilterDisabledAssetToken: paramIsIBCSwap,
  });

  const nonZeroTokens = useMemo(() => {
    const zeroDec = new Dec(0);
    return tokens.filter((token) => {
      return token.token.toDec().gt(zeroDec);
    });
  }, [tokens]);

  const searchedTokens = useSearch(nonZeroTokens, search, searchFields);

  const _filteredTokens = useMemo(() => {
    if (paramIsIBCTransfer) {
      return searchedTokens.filter((token) => {
        if (!("currencies" in token.chainInfo)) {
          return false;
        }

        return token.chainInfo.hasFeature("ibc-transfer");
      });
    }

    return searchedTokens;
  }, [paramIsIBCTransfer, searchedTokens]);

  const filteredTokens = _filteredTokens.filter((token) => {
    if (paramIsIBCSwap) {
      // skipQueriesStore.queryIBCSwap.isSwappableCurrency는 useMemo 안에 들어가면 observation이 안되서 따로 빼야한다...
      return skipQueriesStore.queryIBCSwap.isSwappableCurrency(
        token.chainInfo.chainId,
        token.token.currency
      );
    }

    if (paramIsNobleEarn) {
      if (
        "originChainId" in token.token.currency &&
        token.token.currency.originChainId === NOBLE_CHAIN_ID &&
        token.token.currency.originCurrency &&
        token.token.currency.originCurrency.coinMinimalDenom === "uusdc"
      ) {
        return true;
      }
      return false;
    }

    return true;
  });

  return (
    <HeaderLayout
      title={
        paramIsNobleEarn
          ? ""
          : intl.formatMessage({ id: "page.send.select-asset.title" })
      }
      left={<BackButton />}
      hideBottomButtons={!(paramIsNobleEarn && !filteredTokens.length)}
      bottomButtons={[
        {
          text: intl.formatMessage({
            id: "page.send.select-asset.earn.go-back-button",
          }),
          color: "primary",
          size: "large",
          type: "button",
          onClick: () => {
            navigate(-1);
          },
        },
      ]}
    >
      <Styles.Container gutter="0.5rem" isNobleEarn={paramIsNobleEarn}>
        {paramIsNobleEarn ? (
          <Box>
            <H2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette.white
              }
            >
              {intl.formatMessage(
                { id: "page.send.select-asset.earn.title" },
                {
                  br: <br />,
                }
              )}
            </H2>
            <Gutter size="1rem" />
          </Box>
        ) : (
          <SearchTextInput
            ref={searchRef}
            placeholder={intl.formatMessage({
              id: "page.send.select-asset.search-placeholder",
            })}
            value={search}
            onChange={(e) => {
              e.preventDefault();

              setSearch(e.target.value);
            }}
          />
        )}

        {!paramIsNobleEarn && (
          <Columns sum={1} gutter="0.25rem">
            <Column weight={1} />
            <Body2
              onClick={() => setHideIBCToken(!hideIBCToken)}
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"],
                cursor: "pointer",
              }}
            >
              <FormattedMessage id="page.send.select-asset.hide-ibc-token" />
            </Body2>
            <Checkbox
              size="small"
              checked={hideIBCToken}
              onChange={setHideIBCToken}
            />
          </Columns>
        )}

        {paramIsNobleEarn && !filteredTokens.length ? (
          <Box marginY="5rem">
            <YAxis alignX="center" gap="1.5rem">
              <StackIcon
                width="4.5rem"
                height="4.5rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-400"]
                }
              />
              <Subtitle3
                color={ColorPalette["gray-300"]}
                style={{
                  textAlign: "center",
                }}
              >
                <FormattedMessage
                  id="page.send.select-asset.earn.no-token-found"
                  values={{
                    br: <br />,
                  }}
                />
              </Subtitle3>
            </YAxis>
          </Box>
        ) : null}

        {filteredTokens.length > 0 ? (
          filteredTokens.map((viewToken, index) => {
            const modularChainInfo = chainStore.getModularChain(
              viewToken.chainInfo.chainId
            );
            const isStarknet =
              "starknet" in modularChainInfo &&
              modularChainInfo.starknet != null;
            const isBitcoin =
              "bitcoin" in modularChainInfo && modularChainInfo.bitcoin != null;

            const sendRoute = isBitcoin
              ? "/bitcoin/send"
              : isStarknet
              ? "/starknet/send"
              : "/send";

            return (
              <TokenItem
                viewToken={viewToken}
                key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                onClick={() => {
                  if (search.trim().length > 0) {
                    analyticsAmplitudeStore.logEvent(
                      "click_token_item_search_results_select_asset_send",
                      getTokenSearchResultClickAnalyticsProperties(
                        viewToken,
                        search,
                        filteredTokens,
                        index
                      )
                    );
                  }
                  if (paramNavigateTo) {
                    navigate(
                      paramNavigateTo
                        .replace("/send", sendRoute)
                        .replace("{chainId}", viewToken.chainInfo.chainId)
                        .replace(
                          "{coinMinimalDenom}",
                          viewToken.token.currency.coinMinimalDenom
                        ),
                      {
                        replace: paramNavigateReplace === "true",
                      }
                    );
                  } else {
                    console.error("Empty navigateTo param");
                  }
                }}
              />
            );
          })
        ) : (
          <Box marginY="2rem">
            <EmptyView
              altSvg={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  fill="none"
                >
                  <path
                    d="M45 40.5H27M39.182 18.932L32.818 12.568C31.9741 11.7241 30.8295 11.25 29.636 11.25H13.5C9.77208 11.25 6.75 14.2721 6.75 18V54C6.75 57.7279 9.77208 60.75 13.5 60.75H58.5C62.2279 60.75 65.25 57.7279 65.25 54V27C65.25 23.2721 62.2279 20.25 58.5 20.25H42.364C41.1705 20.25 40.0259 19.7759 39.182 18.932Z"
                    stroke="#ABABB5"
                    strokeWidth="7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              <Stack alignX="center" gutter="0.1rem">
                <Subtitle3 style={{ textAlign: "center" }}>
                  <FormattedMessage
                    id="page.send.select-asset.empty-view-description"
                    values={{
                      br: <br />,
                    }}
                  />
                </Subtitle3>
              </Stack>
            </EmptyView>
          </Box>
        )}
      </Styles.Container>
    </HeaderLayout>
  );
});
