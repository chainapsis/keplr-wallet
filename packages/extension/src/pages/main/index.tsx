import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderLayout } from "../../layouts/header";
import { BackButton, ProfileButton } from "../../layouts/header/components";
import { DenomHelper } from "@keplr-wallet/common";
import { Buttons, ClaimAll, TokenView } from "./components";
import { Stack } from "../../components/stack";

export const MainPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const allBalances = chainStore.chainInfosInUI.flatMap((chainInfo) => {
    const chainId = chainInfo.chainId;
    const accountAddress = accountStore.getAccount(chainId).bech32Address;
    const queries = queriesStore.get(chainId);

    const queryBalances =
      queries.queryBalances.getQueryBech32Address(accountAddress);

    return chainInfo.currencies.flatMap((currency) =>
      queryBalances.getBalanceFromCurrency(currency)
    );
  });

  const stakableBalances = chainStore.chainInfosInUI.flatMap((chainInfo) => {
    const chainId = chainInfo.chainId;
    const accountAddress = accountStore.getAccount(chainId).bech32Address;
    const queries = queriesStore.get(chainId);

    return queries.queryBalances.getQueryBech32Address(accountAddress).stakable
      .balance;
  });

  const ibcBalances = allBalances.filter((balance) => {
    const denomHelper = new DenomHelper(balance.currency.coinMinimalDenom);
    return (
      denomHelper.type === "native" && denomHelper.denom.startsWith("ibc/")
    );
  });

  const tokenBalances = allBalances.filter((balance) => {
    const filteredIbcBalances = ibcBalances.map(
      (ibcBalance) => ibcBalance.currency.coinMinimalDenom
    );
    const stakeableBalances = stakableBalances.map(
      (stakableBalance) => stakableBalance.currency.coinMinimalDenom
    );

    return (
      !filteredIbcBalances.includes(balance.currency.coinMinimalDenom) &&
      !stakeableBalances.includes(balance.currency.coinMinimalDenom)
    );
  });

  return (
    <HeaderLayout
      title="Wallet Name"
      left={<BackButton />}
      right={<ProfileButton />}
    >
      <Stack gutter="1rem">
        <Buttons />
        <ClaimAll />
      </Stack>

      <TokenView title="Balance" tokens={stakableBalances} />
      <TokenView title="Token Balance" tokens={tokenBalances} />
      <TokenView title="IBC Balance" tokens={ibcBalances} />
    </HeaderLayout>
  );
});
