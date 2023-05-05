import React, { FunctionComponent, useMemo } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { MainEmptyView, TokenItem, TokenTitleView } from "./components";
import { Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { Button } from "../../components/button";
import { useStore } from "../../stores";

const zeroDec = new Dec(0);

export const AvailableTabView: FunctionComponent<{
  search: string;
}> = observer(({ search }) => {
  const { hugeQueriesStore } = useStore();

  const stakableBalances: ViewToken[] = hugeQueriesStore.stakables;
  const stakableBalancesNonZero = useMemo(() => {
    return hugeQueriesStore.stakables.filter((token) => {
      return token.token.toDec().gt(zeroDec);
    });
  }, [hugeQueriesStore.stakables]);

  const tokenBalancesNonZero = useMemo(() => {
    return hugeQueriesStore.notStakbles.filter((token) => {
      return token.token.toDec().gt(zeroDec);
    });
  }, [hugeQueriesStore.notStakbles]);

  const ibcBalancesNonZero = useMemo(() => {
    return hugeQueriesStore.ibcTokens.filter((token) => {
      return token.token.toDec().gt(zeroDec);
    });
  }, [hugeQueriesStore.ibcTokens]);

  const isFirstTime =
    stakableBalancesNonZero.length === 0 &&
    tokenBalancesNonZero.length === 0 &&
    ibcBalancesNonZero.length === 0;

  const trimSearch = search.trim();

  const stakableBalancesSearchFiltered = useMemo(() => {
    return stakableBalances.filter((token) => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });
  }, [stakableBalances, trimSearch]);

  const tokenBalancesNonZeroSearchFiltered = useMemo(() => {
    return tokenBalancesNonZero.filter((token) => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });
  }, [tokenBalancesNonZero, trimSearch]);

  const ibcBalancesNonZeroSearchFiltered = useMemo(() => {
    return ibcBalancesNonZero.filter((token) => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });
  }, [ibcBalancesNonZero, trimSearch]);

  const TokenViewData: {
    title: string;
    balance: ViewToken[];
    lenAlwaysShown: number;
    tooltip?: string | React.ReactElement;
  }[] = [
    {
      title: "Balance",
      balance: isFirstTime ? [] : stakableBalancesSearchFiltered,
      lenAlwaysShown: 5,
      tooltip: "TODO: Lorem ipsum dolor sit amet",
    },
    {
      title: "Token Balance",
      balance: tokenBalancesNonZeroSearchFiltered,
      lenAlwaysShown: 3,
      tooltip: "TODO: Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
      title: "IBC Balance",
      balance: ibcBalancesNonZeroSearchFiltered,
      lenAlwaysShown: 3,
      tooltip:
        "TODO: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  return (
    <React.Fragment>
      <Stack gutter="0.5rem">
        {TokenViewData.map(({ title, balance, lenAlwaysShown, tooltip }) => {
          if (balance.length === 0) {
            return null;
          }

          return (
            <CollapsibleList
              key={title}
              title={<TokenTitleView title={title} tooltip={tooltip} />}
              lenAlwaysShown={lenAlwaysShown}
              items={balance.map((viewToken) => (
                <TokenItem
                  viewToken={viewToken}
                  key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                />
              ))}
            />
          );
        })}
      </Stack>

      {isFirstTime ? (
        <MainEmptyView
          image={
            <img
              src={require("../../public/assets/img/main-empty-balance.png")}
              style={{
                width: "6.25rem",
                height: "6.25rem",
              }}
              alt="empty balance image"
            />
          }
          paragraph="Gear up yourself by topping up your wallet! "
          title="Ready to Explore the Interchain?"
          button={<Button text="Get Started" color="primary" size="small" />}
        />
      ) : null}
    </React.Fragment>
  );
});
