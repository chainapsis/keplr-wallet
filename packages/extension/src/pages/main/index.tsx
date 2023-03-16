import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderLayout } from "../../layouts/header";
import { BackButton, ProfileButton } from "../../layouts/header/components";
import { DenomHelper } from "@keplr-wallet/common";
import { Buttons, ClaimAll, TokenView } from "./components";
import { Stack } from "../../components/stack";
import { CoinPretty } from "@keplr-wallet/unit";

export interface ViewToken {
  token: CoinPretty;
  chainName: string;
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

      return BalanceFromCurrency.map((balance) => {
        return {
          token: balance,
          chainName: chainInfo.chainName,
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
        chainName: chainInfo.chainName,
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

  const claimBalances = chainStore.chainInfosInUI.flatMap((chainInfo) => {
    const chainId = chainInfo.chainId;
    const accountAddress = accountStore.getAccount(chainId).bech32Address;
    const queries = queriesStore.get(chainId);

    return queries.cosmos.queryRewards.getQueryBech32Address(accountAddress)
      .stakableReward;
  });

  return (
    <HeaderLayout
      title="Wallet Name"
      left={<BackButton />}
      right={<ProfileButton />}
    >
      <Stack gutter="1rem">
        <Buttons />
        <ClaimAll tokens={claimBalances} />
      </Stack>

      <TokenView title="Balance" viewTokens={stakableBalances} />
      <TokenView title="Token Balance" viewTokens={tokenBalances} />
      <TokenView title="IBC Balance" viewTokens={ibcBalances} />
    </HeaderLayout>
  );
});
