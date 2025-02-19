import React, { FunctionComponent, useMemo } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { MainEmptyView, TokenItem, TokenTitleView } from "./components";
import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { useStore } from "../../stores";
import { TextButton } from "../../components/button-text";
import { ArrowRightSolidIcon } from "../../components/icon";
import { ColorPalette } from "../../styles";
import { useIntl } from "react-intl";
import { ViewStakedToken, ViewUnbondingToken } from "../../stores/huge-queries";

const useViewStakingTokens = () => {
  const { hugeQueriesStore } = useStore();
  const intl = useIntl();

  const delegations: ViewStakedToken[] = useMemo(
    () =>
      hugeQueriesStore.delegations.filter((token) => {
        return token.token.toDec().gt(new Dec(0));
      }),
    [hugeQueriesStore.delegations]
  );

  const unbondings: {
    unbonding: ViewUnbondingToken;
    altSentence: string;
  }[] = useMemo(
    () =>
      hugeQueriesStore.unbondings
        .filter((unbonding) => {
          return unbonding.token.toDec().gt(new Dec(0));
        })
        .map((unbonding) => {
          const relativeTime = formatRelativeTime(
            unbonding.completeTime,
            unbonding.omitCompleteTimeFraction
          );

          return {
            unbonding,
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

export const StakedTabView: FunctionComponent<{
  onMoreTokensClosed: () => void;
}> = observer(({ onMoreTokensClosed }) => {
  const { uiConfigStore } = useStore();
  const intl = useIntl();

  const { delegations, unbondings } = useViewStakingTokens();

  const TokenViewData: {
    title: string;
    balance:
      | ViewStakedToken[]
      | {
          unbonding: ViewUnbondingToken;
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
                      viewToken={viewToken.unbonding}
                      key={`${viewToken.unbonding.chainInfo.chainId}-${viewToken.unbonding.token.currency.coinMinimalDenom}`}
                      disabled={!viewToken.unbonding.stakingUrl}
                      onClick={() => {
                        if (viewToken.unbonding.stakingUrl) {
                          browser.tabs.create({
                            url: viewToken.unbonding.stakingUrl,
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
                  url: "https://wallet.keplr.app/?modal=staking&utm_source=keplrextension&utm_medium=button&utm_campaign=permanent&utm_content=manage_stake",
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

function formatRelativeTime(
  time: string | number,
  discardDecimal?: boolean
): {
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

  const round = discardDecimal ? Math.floor : Math.ceil;

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
      value: round(remainingDays),
    };
  }

  if (remainingHours >= 1) {
    return {
      unit: "hour",
      value: round(remainingHours),
    };
  }

  return {
    unit: "minute",
    value: round(remainingMinutes),
  };
}
