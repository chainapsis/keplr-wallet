import React, { FunctionComponent, useMemo, useState } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import {
  MainEmptyView,
  TokenFoundModal,
  TokenItem,
  TokenTitleView,
} from "./components";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ViewToken } from "./index";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { Button } from "../../components/button";
import { useStore } from "../../stores";
import { TextButton } from "../../components/button-text";
import { Box } from "../../components/box";
import { Modal } from "../../components/modal";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { useNavigate } from "react-router";
import { YAxis } from "../../components/axis";

const zeroDec = new Dec(0);

export const AvailableTabView: FunctionComponent<{
  search: string;
  isNotReady?: boolean;

  // 초기 유저에게 뜨는 alternative에서 get started 버튼을 누르면 copy address modal을 띄워야된다...
  // 근데 컴포넌트가 분리되어있는데 이거 하려고 context api 쓰긴 귀찮아서 그냥 prop으로 대충 처리한다.
  onClickGetStarted: () => void;
}> = observer(({ search, isNotReady, onClickGetStarted }) => {
  const { hugeQueriesStore, chainStore } = useStore();
  const navigate = useNavigate();

  const allBalances = hugeQueriesStore.getAllBalances(true);
  const allBalancesNonZero = useMemo(() => {
    return allBalances.filter((token) => {
      return token.token.toDec().gt(zeroDec);
    });
  }, [allBalances]);

  const isFirstTime = allBalancesNonZero.length === 0;
  const trimSearch = search.trim();
  const allBalancesSearchFiltered = useMemo(() => {
    return allBalances.filter((token) => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });
  }, [allBalances, trimSearch]);

  const TokenViewData: {
    title: string;
    balance: ViewToken[];
    lenAlwaysShown: number;
    tooltip?: string | React.ReactElement;
  }[] = [
    {
      title: "Available Balance",
      balance: allBalancesSearchFiltered,
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
      {isNotReady ? (
        <TokenItem
          viewToken={{
            token: new CoinPretty(
              chainStore.chainInfos[0].stakeCurrency,
              new Dec(0)
            ),
            chainInfo: chainStore.chainInfos[0],
            isFetching: false,
            error: undefined,
          }}
          isNotReady={isNotReady}
        />
      ) : (
        <React.Fragment>
          <Stack gutter="0.5rem">
            {TokenViewData.map(
              ({ title, balance, lenAlwaysShown, tooltip }) => {
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
                        onClick={() =>
                          navigate(
                            `/send?chainId=${viewToken.chainInfo.chainId}&coinMinimalDenom=${viewToken.token.currency.coinMinimalDenom}`
                          )
                        }
                      />
                    ))}
                  />
                );
              }
            )}
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
              button={
                <Button
                  text="Get Started"
                  color="primary"
                  size="small"
                  onClick={onClickGetStarted}
                />
              }
            />
          ) : null}

          {numFoundToken > 0 ? (
            <Box padding="0.75rem">
              <YAxis alignX="center">
                <TextButton
                  text={`${numFoundToken} new token(s) found`}
                  size="small"
                  onClick={() => setIsFoundTokenModalOpen(true)}
                />
              </YAxis>
            </Box>
          ) : null}
        </React.Fragment>
      )}

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
