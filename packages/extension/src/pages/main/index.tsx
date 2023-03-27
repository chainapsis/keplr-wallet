import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderLayout } from "../../layouts/header";
import { ProfileButton } from "../../layouts/header/components";
import { DenomHelper } from "@keplr-wallet/common";
import { Buttons, ClaimAll, TokenItem, TokenTitleView } from "./components";
import { Stack } from "../../components/stack";
import { CoinPretty } from "@keplr-wallet/unit";
import { ChainInfo } from "@keplr-wallet/types";
import styled from "styled-components";
import { MenuIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { CollapsibleList } from "../../components/collapsible-list";

const Styles = {
  Container: styled.div`
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  `,
};

export interface ViewToken {
  token: CoinPretty;
  chainInfo: ChainInfo;
}

export const MainPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const allBalances: ViewToken[] = chainStore.chainInfosInUI.flatMap(
    (chainInfo) => {
      const chainId = chainInfo.chainId;
      const accountAddress = accountStore.getAccount(chainId).bech32Address;
      const queries = queriesStore.get(chainId);

      const queryBalances =
        queries.queryBalances.getQueryBech32Address(accountAddress);

      const BalanceFromCurrency = chainInfo.currencies.flatMap((currency) =>
        queryBalances.getBalanceFromCurrency(currency)
      );

      return BalanceFromCurrency.map((token) => {
        return {
          token,
          chainInfo,
        };
      });
    }
  );

  const stakableBalances: ViewToken[] = chainStore.chainInfosInUI.flatMap(
    (chainInfo) => {
      const chainId = chainInfo.chainId;
      const accountAddress = accountStore.getAccount(chainId).bech32Address;
      const queries = queriesStore.get(chainId);

      return {
        token:
          queries.queryBalances.getQueryBech32Address(accountAddress).stakable
            .balance,
        chainInfo,
      };
    }
  );

  const ibcBalances = allBalances.filter((balance) => {
    const denomHelper = new DenomHelper(
      balance.token.currency.coinMinimalDenom
    );
    return (
      denomHelper.type === "native" && denomHelper.denom.startsWith("ibc/")
    );
  });

  const tokenBalances = allBalances.filter((balance) => {
    const filteredIbcBalances = ibcBalances.map(
      (ibcBalance) => ibcBalance.token.currency.coinMinimalDenom
    );
    const stakeableBalances = stakableBalances.map(
      (stakableBalance) => stakableBalance.token.currency.coinMinimalDenom
    );

    return (
      !filteredIbcBalances.includes(balance.token.currency.coinMinimalDenom) &&
      !stakeableBalances.includes(balance.token.currency.coinMinimalDenom)
    );
  });

  const claimBalances: ViewToken[] = chainStore.chainInfosInUI.flatMap(
    (chainInfo) => {
      const chainId = chainInfo.chainId;
      const accountAddress = accountStore.getAccount(chainId).bech32Address;
      const queries = queriesStore.get(chainId);

      return {
        token:
          queries.cosmos.queryRewards.getQueryBech32Address(accountAddress)
            .stakableReward,
        chainInfo,
      };
    }
  );

  const TokenViewData: { title: string; balance: ViewToken[] }[] = [
    { title: "Balance", balance: stakableBalances },
    { title: "Token Balance", balance: tokenBalances },
    { title: "IBC Balance", balance: ibcBalances },
  ];

  return (
    <HeaderLayout
      title="Wallet Name"
      left={
        <Box paddingLeft="1rem">
          <MenuIcon />
        </Box>
      }
      right={<ProfileButton />}
    >
      <Styles.Container>
        <Stack gutter="1rem">
          <Buttons />
          <ClaimAll viewTokens={claimBalances} />
          {TokenViewData.map(({ title, balance }) => {
            return (
              <CollapsibleList
                key={title}
                title={<TokenTitleView title={title} />}
                items={balance.slice(2).map((viewToken) => (
                  <TokenItem
                    viewToken={viewToken}
                    key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                  />
                ))}
                alwaysShown={balance.slice(0, 2).map((viewToken) => (
                  <TokenItem
                    viewToken={viewToken}
                    key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                  />
                ))}
                right={balance.length}
              />
            );
          })}
        </Stack>
      </Styles.Container>
    </HeaderLayout>
  );
});
