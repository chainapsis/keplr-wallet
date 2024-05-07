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
import { Body2 } from "../../../components/typography";
import { Checkbox } from "../../../components/checkbox";
import { ColorPalette } from "../../../styles";
import { Dec } from "@keplr-wallet/unit";
import { useFocusOnMount } from "../../../hooks/use-focus-on-mount";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

export const SendSelectAssetPage: FunctionComponent = observer(() => {
  const { hugeQueriesStore, skipQueriesStore } = useStore();
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

    return true;
  });

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.send.select-asset.title" })}
      left={<BackButton />}
    >
      <Styles.Container gutter="0.5rem">
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

        {filteredTokens.map((viewToken) => {
          return (
            <TokenItem
              viewToken={viewToken}
              key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
              onClick={() => {
                if (paramNavigateTo) {
                  navigate(
                    paramNavigateTo
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
