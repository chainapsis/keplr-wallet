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
import {
  Body2,
  H2,
  Subtitle1,
  Subtitle3,
} from "../../../components/typography";
import { Checkbox } from "../../../components/checkbox";
import { ColorPalette } from "../../../styles";
import { Dec } from "@keplr-wallet/unit";
import { CoinPretty } from "@keplr-wallet/unit";
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
        return CoinPretty.makeCoinDenomPretty(
          currency.originCurrency?.coinDenom || ""
        );
      }
      return CoinPretty.makeCoinDenomPretty(currency.coinDenom);
    },
  },
  "chainInfo.chainName",
];

export const SendSelectAssetPage: FunctionComponent = observer(() => {
  const { hugeQueriesStore, skipQueriesStore, chainStore } = useStore();
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
        if (!("cosmos" in token.chainInfo) && !("evm" in token.chainInfo)) {
          return false;
        }

        return chainStore
          .getModularChainInfoImpl(token.chainInfo.chainId)
          .hasFeature("ibc-transfer");
      });
    }

    return searchedTokens;
  }, [chainStore, paramIsIBCTransfer, searchedTokens]);

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

        <Stack>
          {filteredTokens.length > 0 &&
            filteredTokens.map((viewToken) => {
              const modularChainInfo = chainStore.getModularChain(
                viewToken.chainInfo.chainId
              );
              const isStarknet =
                "starknet" in modularChainInfo &&
                modularChainInfo.starknet != null;
              const isBitcoin =
                "bitcoin" in modularChainInfo &&
                modularChainInfo.bitcoin != null;

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
            })}
        </Stack>

        {nonZeroTokens.length === 0 && (
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

        {nonZeroTokens.length > 0 && filteredTokens.length === 0 && (
          <Box marginY="2rem">
            <EmptyView
              altSvg={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="70"
                  height="70"
                  viewBox="0 0 70 70"
                  fill="none"
                >
                  <path
                    d="M55.9 10H15.1C13.7485 10 12.448 10.5355 11.5045 11.5045C10.5355 12.448 10 13.7485 10 15.1V45.7C10 47.0515 10.5355 48.352 11.5045 49.2955C12.448 50.2645 13.7485 50.8 15.1 50.8H25.3L35.5 61L45.7 50.8H55.9C57.2515 50.8 58.552 50.2645 59.4955 49.2955C60.439 48.3265 61 47.0515 61 45.7V15.1C61 13.7485 60.4645 12.448 59.4955 11.5045C58.552 10.5355 57.2515 10 55.9 10ZM15.1 45.7V15.1H55.9V45.7H43.5835L35.5 53.7835L27.4165 45.7M30.5275 20.302C31.9045 19.384 33.715 18.925 35.9845 18.925C38.3815 18.925 40.294 19.4605 41.671 20.506C43.048 21.577 43.7365 23.005 43.7365 24.79C43.7365 25.912 43.354 26.9065 42.6145 27.85C41.875 28.768 40.906 29.482 39.733 30.0175C39.07 30.4 38.6365 30.7825 38.407 31.216C38.1775 31.675 38.05 32.236 38.05 32.95H32.95C32.95 31.675 33.205 30.808 33.6895 30.196C34.225 29.584 35.092 28.87 36.418 28.054C37.081 27.697 37.6165 27.238 38.05 26.677C38.407 26.1415 38.611 25.504 38.611 24.79C38.611 24.025 38.3815 23.464 37.9225 23.0305C37.4635 22.5715 36.775 22.3675 35.9845 22.3675C35.296 22.3675 34.735 22.546 34.225 22.903C33.817 23.26 33.562 23.7955 33.562 24.5095H28.5385C28.411 22.75 29.125 21.22 30.5275 20.302ZM32.95 40.6V35.5H38.05V40.6H32.95Z"
                    fill="#424247"
                  />
                </svg>
              }
            >
              <Stack alignX="center" gutter="0.1rem">
                <Subtitle1>
                  <FormattedMessage id="page.send.select-asset.search-show-check-manage-asset-view-guide-title" />
                </Subtitle1>
                <Body2 style={{ textAlign: "center", lineHeight: "1.4" }}>
                  <FormattedMessage
                    id="page.send.select-asset.search-show-check-manage-asset-view-guide-paragraph"
                    values={{
                      br: <br />,
                    }}
                  />
                </Body2>
              </Stack>
            </EmptyView>
          </Box>
        )}
      </Styles.Container>
    </HeaderLayout>
  );
});
