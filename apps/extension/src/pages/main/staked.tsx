import React, { FunctionComponent, useMemo } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { MainEmptyView, TokenItem, TokenTitleView } from "./components";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { useStore } from "../../stores";
import { TextButton } from "../../components/button-text";
import { ArrowRightSolidIcon } from "../../components/icon";
import { ColorPalette } from "../../styles";
import { useIntl } from "react-intl";
import { ViewToken } from ".";

type ViewTokenDelegation = ViewToken & {
  price: PricePretty | undefined;
  stakingUrl?: string;
};

const useCosmosViewTokenDelegations = () => {
  const { hugeQueriesStore } = useStore();
  const intl = useIntl();

  const delegations: ViewTokenDelegation[] = useMemo(
    () =>
      hugeQueriesStore.delegations.filter((token) => {
        return token.token.toDec().gt(new Dec(0));
      }),
    [hugeQueriesStore.delegations]
  );

  const unbondings: {
    viewToken: ViewTokenDelegation;
    altSentence: string;
  }[] = useMemo(
    () =>
      hugeQueriesStore.unbondings
        .filter((unbonding) => {
          return unbonding.viewToken.token.toDec().gt(new Dec(0));
        })
        .map((unbonding) => {
          const relativeTime = formatRelativeTime(unbonding.completeTime);

          return {
            viewToken: {
              ...unbonding.viewToken,
              stakingUrl: unbonding.viewToken.chainInfo.walletUrlForStaking,
            },
            altSentence: intl.formatRelativeTime(
              relativeTime.value,
              relativeTime.unit
            ),
          };
        }),
    [hugeQueriesStore.unbondings, intl]
  );

  return {
    delegations,
    unbondings,
  };
};

const useStarknetViewTokenDelegations = () => {
  const { chainStore, priceStore, starknetQueriesStore, accountStore } =
    useStore();

  const intl = useIntl();

  const chainId = "starknet:SN_MAIN";
  const modularChainInfo = chainStore.getModularChain(chainId);

  const account = accountStore.getAccount(chainId);

  const queryValidators = starknetQueriesStore.get(chainId).queryValidators;
  const validators = queryValidators.validators;
  const queryStakingInfo = queryValidators
    .getQueryPoolMemberInfoMap(account.starknetHexAddress)
    ?.getQueryStakingInfo(validators);

  const delegation: ViewTokenDelegation | undefined = useMemo(() => {
    const token = queryStakingInfo?.totalStakedAmount;
    if (!token) {
      return;
    }

    const price = priceStore.calculatePrice(token);

    return {
      chainInfo: modularChainInfo,
      token,
      price,
      isFetching: queryStakingInfo?.isFetching,
      error: queryValidators.error,
    };
  }, [
    modularChainInfo,
    priceStore,
    queryStakingInfo?.isFetching,
    queryStakingInfo?.totalStakedAmount,
    queryValidators.error,
  ]);

  const unbondings: {
    viewToken: ViewTokenDelegation;
    altSentence: string;
  }[] = useMemo(() => {
    const unbondings = queryStakingInfo?.unbondings;
    if (!unbondings) {
      return [];
    }

    return unbondings.unbondings.map((unbonding) => {
      const relativeTime = formatRelativeTime(unbonding.completeTime * 1000);

      return {
        viewToken: {
          chainInfo: modularChainInfo,
          token: unbonding.amount,
          price: priceStore.calculatePrice(unbonding.amount),
          isFetching: queryStakingInfo?.isFetching,
          error: queryValidators.error,
          stakingUrl: "https://dashboard.endur.fi/stake",
        },
        altSentence: intl.formatRelativeTime(
          relativeTime.value,
          relativeTime.unit
        ),
      };
    });
  }, [
    intl,
    modularChainInfo,
    priceStore,
    queryStakingInfo?.isFetching,
    queryStakingInfo?.unbondings,
    queryValidators.error,
  ]);

  return {
    delegation,
    unbondings,
  };
};

export const StakedTabView: FunctionComponent<{
  onMoreTokensClosed: () => void;
}> = observer(({ onMoreTokensClosed }) => {
  const { uiConfigStore } = useStore();
  const intl = useIntl();

  const { delegations: cosmosDelegations, unbondings: cosmosUnbondings } =
    useCosmosViewTokenDelegations();
  const { delegation: starknetDelegation, unbondings: starknetUnbondings } =
    useStarknetViewTokenDelegations();

  const delegations = useMemo(() => {
    if (!starknetDelegation) {
      return cosmosDelegations;
    }

    return [...cosmosDelegations, starknetDelegation].sort((a, b) => {
      const priceA = a.price?.toDec() || new Dec(0);
      const priceB = b.price?.toDec() || new Dec(0);
      if (priceA.equals(priceB)) {
        return 0;
      }
      return priceA.gt(priceB) ? -1 : 1;
    });
  }, [cosmosDelegations, starknetDelegation]);

  const unbondings = useMemo(() => {
    if (!starknetUnbondings) {
      return cosmosUnbondings;
    }
    return [...cosmosUnbondings, ...starknetUnbondings].sort((a, b) => {
      const priceA = a.viewToken.price?.toDec() || new Dec(0);
      const priceB = b.viewToken.price?.toDec() || new Dec(0);
      if (priceA.equals(priceB)) {
        return 0;
      }
      return priceA.gt(priceB) ? -1 : 1;
    });
  }, [cosmosUnbondings, starknetUnbondings]);

  const TokenViewData: {
    title: string;
    balance:
      | ViewTokenDelegation[]
      | {
          viewToken: ViewTokenDelegation;
          altSentence: string;
        }[];
    lenAlwaysShown: number;
    tooltip?: string | React.ReactElement;
  }[] = [
    {
      title: intl.formatMessage({
        id: "page.main.staked.staked-balance-title",
      }),
      balance: delegations,
      lenAlwaysShown: 5,
      tooltip: intl.formatMessage({
        id: "page.main.staked.staked-balance-tooltip",
      }),
    },
    {
      title: intl.formatMessage({
        id: "page.main.staked.unstaking-balance-title",
      }),
      balance: unbondings,
      lenAlwaysShown: 3,
      tooltip: intl.formatMessage({
        id: "page.main.staked.unstaking-balance-tooltip",
      }),
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
              hideNumInTitle={uiConfigStore.isPrivacyMode}
              onCollapse={(isCollapsed) => {
                if (isCollapsed) {
                  onMoreTokensClosed();
                }
              }}
              title={<TokenTitleView title={title} tooltip={tooltip} />}
              lenAlwaysShown={lenAlwaysShown}
              items={balance.map((viewToken) => {
                if ("altSentence" in viewToken) {
                  return (
                    <TokenItem
                      viewToken={viewToken.viewToken}
                      key={`${viewToken.viewToken.chainInfo.chainId}-${viewToken.viewToken.token.currency.coinMinimalDenom}`}
                      disabled={!viewToken.viewToken.stakingUrl}
                      onClick={() => {
                        if (viewToken.viewToken.stakingUrl) {
                          browser.tabs.create({
                            url: viewToken.viewToken.stakingUrl,
                          });
                        }
                      }}
                      altSentence={viewToken.altSentence}
                    />
                  );
                }

                return (
                  <TokenItem
                    viewToken={viewToken}
                    key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                    disabled={!viewToken.stakingUrl}
                    onClick={() => {
                      if (viewToken.stakingUrl) {
                        browser.tabs.create({
                          url: viewToken.stakingUrl,
                        });
                      }
                    }}
                  />
                );
              })}
            />
          );
        })}
      </Stack>

      {delegations.length === 0 && unbondings.length === 0 ? (
        <MainEmptyView
          image={
            <img
              src={require("../../public/assets/img/main-empty-staking.png")}
              style={{
                width: "6.25rem",
                height: "6.25rem",
              }}
              alt="empty staking image"
            />
          }
          title={intl.formatMessage({
            id: "page.main.staked.empty-view-title",
          })}
          paragraph={intl.formatMessage({
            id: "page.main.staked.empty-view-paragraph",
          })}
          button={
            <TextButton
              text={intl.formatMessage({
                id: "page.main.staked.go-to-dashboard-button",
              })}
              size="small"
              right={
                <ArrowRightSolidIcon
                  width="1.125rem"
                  height="1.125rem"
                  color={ColorPalette["gray-10"]}
                />
              }
              onClick={async () => {
                await browser.tabs.create({
                  url: "https://wallet.keplr.app/?modal=staking",
                });

                close();
              }}
            />
          }
        />
      ) : null}
    </React.Fragment>
  );
});

function formatRelativeTime(time: string | number): {
  unit: "minute" | "hour" | "day";
  value: number;
} {
  let timeMs: number;
  if (typeof time === "number") {
    timeMs = time;
  } else {
    const parsed = Number(time);
    if (!isNaN(parsed)) {
      timeMs = parsed;
    } else {
      timeMs = new Date(time).getTime();
    }
  }

  const remaining = timeMs - Date.now();

  if (remaining <= 0) {
    return {
      unit: "minute",
      value: 1,
    };
  }

  const remainingSeconds = remaining / 1000;
  const remainingMinutes = remainingSeconds / 60;
  if (remainingMinutes < 1) {
    return {
      unit: "minute",
      value: 1,
    };
  }

  const remainingHours = remainingMinutes / 60;
  const remainingDays = remainingHours / 24;

  if (remainingDays >= 1) {
    return {
      unit: "day",
      value: Math.ceil(remainingDays),
    };
  }

  if (remainingHours >= 1) {
    return {
      unit: "hour",
      value: Math.ceil(remainingHours),
    };
  }

  return {
    unit: "minute",
    value: Math.ceil(remainingMinutes),
  };
}
