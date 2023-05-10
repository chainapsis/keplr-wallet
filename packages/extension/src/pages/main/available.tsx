import React, { FunctionComponent, useMemo, useState } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import {
  MainEmptyView,
  TokenFoundModal,
  TokenItem,
  TokenTitleView,
} from "./components";
import { Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { Button } from "../../components/button";
import { useStore } from "../../stores";
import { TextButton } from "../../components/button-text";
import { Box } from "../../components/box";
import { Modal } from "../../components/modal";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

const zeroDec = new Dec(0);

export const AvailableTabView: FunctionComponent<{
  search: string;
}> = observer(({ search }) => {
  const { hugeQueriesStore, chainStore, priceStore } = useStore();

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

  const allBalancesNonZeroSearchFiltered = useMemo(() => {
    return stakableBalancesNonZero
      .concat(tokenBalancesNonZero)
      .concat(ibcBalancesNonZero)
      .sort((a, b) => {
        const aPrice =
          priceStore.calculatePrice(a.token)?.toDec() ?? new Dec(0);
        const bPrice =
          priceStore.calculatePrice(b.token)?.toDec() ?? new Dec(0);

        if (aPrice.equals(bPrice)) {
          return a.token.currency.coinDenom.localeCompare(
            b.token.currency.coinDenom
          );
        } else if (aPrice.gt(bPrice)) {
          return -1;
        } else {
          return 1;
        }
      })
      .filter((token) => {
        return (
          token.chainInfo.chainName
            .toLowerCase()
            .includes(trimSearch.toLowerCase()) ||
          token.token.currency.coinDenom
            .toLowerCase()
            .includes(trimSearch.toLowerCase())
        );
      });
  }, [
    ibcBalancesNonZero,
    priceStore,
    stakableBalancesNonZero,
    tokenBalancesNonZero,
    trimSearch,
  ]);

  const TokenViewData: {
    title: string;
    balance: ViewToken[];
    lenAlwaysShown: number;
    tooltip?: string | React.ReactElement;
  }[] = [
    {
      title: "Balance",
      balance: isFirstTime ? [] : allBalancesNonZeroSearchFiltered,
      lenAlwaysShown: 10,
      tooltip: "TODO: Lorem ipsum dolor sit amet",
    },
  ];

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

  const [isFoundTokenModalOpen, setIsFoundTokenModalOpen] = useState(false);

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

      {numFoundToken > 0 ? (
        <Box padding="0.75rem">
          <TextButton
            text={`${numFoundToken} new token(s) found`}
            size="small"
            onClick={() => setIsFoundTokenModalOpen(true)}
          />
        </Box>
      ) : null}

      <Modal
        isOpen={isFoundTokenModalOpen && numFoundToken > 0}
        align="bottom"
        close={() => setIsFoundTokenModalOpen(false)}
      >
        <TokenFoundModal close={() => setIsFoundTokenModalOpen(false)} />
      </Modal>
    </React.Fragment>
  );
});
