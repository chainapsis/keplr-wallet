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

const Styles = {
  Container: styled(Stack)<{ isNobleEarn: boolean }>`
    padding: ${({ isNobleEarn }) =>
      isNobleEarn ? "0.75rem 1.25rem" : "0.75rem"};
  `,
};

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

  const tokens = hugeQueriesStore.getAllBalances(!hideIBCToken);

  const _filteredTokens = useMemo(() => {
    const zeroDec = new Dec(0);
    const newTokens = tokens.filter((token) => {
      return token.token.toDec().gt(zeroDec);
    });

    const trimSearch = search.trim();

    if (!trimSearch) {
      return newTokens;
    }

    const filtered = newTokens.filter((token) => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });

    if (paramIsIBCTransfer) {
      return filtered.filter((token) => {
        if (!("currencies" in token.chainInfo)) {
          return false;
        }

        return token.chainInfo.hasFeature("ibc-transfer");
      });
    }

    return filtered;
  }, [paramIsIBCTransfer, search, tokens]);

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

        {filteredTokens.map((viewToken) => {
          const modularChainInfo = chainStore.getModularChain(
            viewToken.chainInfo.chainId
          );
          const isStarknet =
            "starknet" in modularChainInfo && modularChainInfo.starknet != null;
          return (
            <TokenItem
              viewToken={viewToken}
              key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
              onClick={() => {
                if (paramNavigateTo) {
                  navigate(
                    paramNavigateTo
                      .replace("/send", isStarknet ? "/starknet/send" : "/send")
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
      </Styles.Container>
    </HeaderLayout>
  );
});
