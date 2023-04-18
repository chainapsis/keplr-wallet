import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderLayout } from "../../layouts/header";
import { ProfileButton } from "../../layouts/header/components";
import { DenomHelper } from "@keplr-wallet/common";
import {
  Buttons,
  ClaimAll,
  MenuBar,
  StringToggle,
  TabStatus,
  TokenItem,
  TokenTitleView,
  CopyAddress,
  CopyAddressModal,
  InternalLinkView,
} from "./components";
import { Stack } from "../../components/stack";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ChainInfo } from "@keplr-wallet/types";
import styled from "styled-components";
import { MenuIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { CollapsibleList } from "../../components/collapsible-list";
import { Modal } from "../../components/modal/v2";

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
  const { chainStore, accountStore, queriesStore, keyRingStore } = useStore();

  const stakableBalances: ViewToken[] = chainStore.chainInfosInUI
    .flatMap((chainInfo) => {
      const chainId = chainInfo.chainId;
      const accountAddress = accountStore.getAccount(chainId).bech32Address;
      const queries = queriesStore.get(chainId);

      return {
        token:
          queries.queryBalances.getQueryBech32Address(accountAddress).stakable
            .balance,
        chainInfo,
      };
    })
    .sort((a, b) => {
      // Move zeros to last
      const aIsZero = a.token.toDec().lte(new Dec(0));
      const bIsZero = b.token.toDec().lte(new Dec(0));

      if (aIsZero && bIsZero) {
        return 0;
      }
      if (aIsZero) {
        return 1;
      }
      if (bIsZero) {
        return -1;
      }

      return 0;
    });

  const allBalances: ViewToken[] = chainStore.chainInfosInUI
    .flatMap((chainInfo) => {
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
    })
    .filter((token) => {
      return token.token.toDec().gt(new Dec(0));
    });

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

  const TokenViewData: {
    title: string;
    balance: ViewToken[];
    lenAlwaysShown: number;
  }[] = [
    { title: "Balance", balance: stakableBalances, lenAlwaysShown: 5 },
    { title: "Token Balance", balance: tokenBalances, lenAlwaysShown: 3 },
    { title: "IBC Balance", balance: ibcBalances, lenAlwaysShown: 3 },
  ];

  const [tabStatus, setTabStatus] = React.useState<TabStatus>("available");

  const [isOpenMenu, setIsOpenMenu] = React.useState(false);
  const [isOpenCopyAddress, setIsOpenCopyAddress] = React.useState(false);

  return (
    <HeaderLayout
      title={keyRingStore.selectedKeyInfo?.name || "Keplr Account"}
      left={
        <Box
          paddingLeft="1rem"
          onClick={() => setIsOpenMenu(true)}
          cursor="pointer"
        >
          <MenuIcon />
        </Box>
      }
      right={<ProfileButton />}
    >
      <Styles.Container>
        <Stack gutter="1rem">
          <StringToggle tabStatus={tabStatus} setTabStatus={setTabStatus} />
          <CopyAddress onClick={() => setIsOpenCopyAddress(true)} />
          <Buttons />
          <ClaimAll />
          <InternalLinkView />
          {TokenViewData.map(({ title, balance, lenAlwaysShown }) => {
            if (balance.length === 0) {
              return null;
            }

            return (
              <CollapsibleList
                key={title}
                title={<TokenTitleView title={title} />}
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
      </Styles.Container>

      <Modal
        isOpen={isOpenMenu}
        align="left"
        close={() => setIsOpenMenu(false)}
      >
        <MenuBar close={() => setIsOpenMenu(false)} />
      </Modal>

      <Modal
        isOpen={isOpenCopyAddress}
        align="bottom"
        close={() => setIsOpenCopyAddress(false)}
      >
        <CopyAddressModal close={() => setIsOpenCopyAddress(false)} />
      </Modal>
    </HeaderLayout>
  );
});
