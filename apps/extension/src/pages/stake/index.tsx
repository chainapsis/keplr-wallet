import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { MainHeaderLayout } from "../main/layouts/header";
import { ColorPalette } from "../../styles";
import { Box } from "../../components/box";
import { XAxis } from "../../components/axis";
import { Skeleton } from "../../components/skeleton";
import { MainH1 } from "../../components/typography/main-h1";
import { useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../styles/spring";
import { PrivacyModeButtonStyles, useIsNotReady } from "../main";
import { useStore } from "../../stores";
import { useStakedTotalPrice } from "../../hooks/use-staked-total-price";
import { animated } from "@react-spring/web";
import { EyeIcon, EyeSlashIcon } from "../../components/icon";
import { Gutter } from "../../components/gutter";
import { TextButton } from "../../components/button-text";
import { ViewStakedToken, ViewUnbondingToken } from "../../stores/huge-queries";
import { useIntl } from "react-intl";
import { Dec } from "@keplr-wallet/unit";
import { CollapsibleList } from "../../components/collapsible-list";
import { Stack } from "../../components/stack";
import { TokenItem, TokenTitleView } from "../main/components";
import { StakeExplorePage } from "./explore";
import { StakeEmptyPage } from "./empty";
import { IconProps } from "../../components/icon/types";
import { Subtitle3 } from "../../components/typography";
import { RewardsCard } from "./components/rewards-card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetStakingApr } from "../../hooks/use-get-staking-apr";
import styled from "styled-components";
import { COMMON_HOVER_OPACITY } from "../../styles/constant";

const zeroDec = new Dec(0);

export const StakePage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialExpand = params.get("intitialExpand") === "true";

  const { uiConfigStore, hugeQueriesStore } = useStore();
  const isNotReady = useIsNotReady();

  const animatedPrivacyModeHover = useSpringValue(0, {
    config: defaultSpringConfig,
  });

  const { stakedTotalPrice } = useStakedTotalPrice();

  const { delegations, unbondings } = useViewStakingTokens();

  const hasAnyStakableAsset = useMemo(() => {
    return hugeQueriesStore.stakables.some((token) =>
      token.token.toDec().gt(zeroDec)
    );
  }, [hugeQueriesStore.stakables]);

  const TokenViewData: {
    title: string;
    balance:
      | ViewStakedToken[]
      | {
          unbonding: ViewUnbondingToken;
          altSentence: string;
        }[];
    lenAlwaysShown: number;
  }[] = [
    {
      title: intl.formatMessage({
        id: "page.stake.staked-balance-title",
      }),
      balance: delegations,
      lenAlwaysShown: 5,
    },
    {
      title: intl.formatMessage({
        id: "page.stake.unstaking-balance-title",
      }),
      balance: unbondings,
      lenAlwaysShown: 3,
    },
  ];

  if (!hasAnyStakableAsset) {
    return <StakeExplorePage />;
  }

  if (delegations.length === 0 && unbondings.length === 0) {
    return <StakeEmptyPage />;
  }

  return (
    <MainHeaderLayout>
      <Box paddingX="1rem">
        <Gutter size="1.25rem" />
        <Box paddingLeft="0.25rem">
          <Subtitle3 color={ColorPalette["gray-200"]}>
            {intl.formatMessage({
              id: "page.stake.total-staked-title",
            })}
          </Subtitle3>
        </Box>
        <Gutter size="0.75rem" />
        <BalanceRow
          onHoverStateChange={(isHover) => {
            if (!isNotReady) {
              animatedPrivacyModeHover.start(isHover ? 1 : 0);
            } else {
              animatedPrivacyModeHover.set(0);
            }
          }}
          paddingX="0.25rem"
        >
          <XAxis alignY="center">
            <Skeleton isNotReady={isNotReady} dummyMinWidth="6rem">
              <MainH1>
                {uiConfigStore.hideStringIfPrivacyMode(
                  stakedTotalPrice?.toString() || "-",
                  4
                )}
              </MainH1>
            </Skeleton>

            <animated.div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "1px",
                overflowX: "clip",
                width: animatedPrivacyModeHover.to((v) => `${v * 1.25}rem`),
              }}
            >
              <PrivacyModeButtonStyles.PrivacyModeButton
                as={animated.div}
                style={{
                  position: "absolute",
                  right: 0,
                  cursor: "pointer",
                  opacity: animatedPrivacyModeHover.to((v) =>
                    Math.max(0, (v - 0.3) * (10 / 3))
                  ),
                  marginTop: "2px",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  uiConfigStore.toggleIsPrivacyMode();
                }}
              >
                {uiConfigStore.isPrivacyMode ? (
                  <EyeSlashIcon width="1rem" height="1rem" />
                ) : (
                  <EyeIcon width="1rem" height="1rem" />
                )}
              </PrivacyModeButtonStyles.PrivacyModeButton>
            </animated.div>
          </XAxis>

          <TextButton
            text={intl.formatMessage({
              id: "page.stake.stake-more-button",
            })}
            color="blue"
            onClick={async () => {
              await browser.tabs.create({
                url: "https://wallet.keplr.app/?modal=staking&utm_source=keplrextension&utm_medium=button&utm_campaign=permanent&utm_content=manage_stake",
              });
            }}
            right={<ChevronRightIcon width="1rem" height="1rem" />}
            style={{
              color: ColorPalette["blue-400"],
            }}
            buttonStyle={{
              height: "1.3125rem",
              padding: "0.125rem 0 0.125rem 0.25rem",
            }}
          />
        </BalanceRow>

        <Gutter size="0.75rem" />

        <BackToHomeButton paddingLeft="0.25rem" onClick={() => navigate("/")}>
          <XAxis alignY="center">
            <ChevronLeftIcon
              width="1rem"
              height="1rem"
              color={ColorPalette["gray-300"]}
            />
            <Gutter size="0.125rem" />
            <Subtitle3 color={ColorPalette["gray-300"]}>
              {intl.formatMessage({
                id: "page.stake.back-to-home-button",
              })}
            </Subtitle3>
          </XAxis>
        </BackToHomeButton>

        <Gutter size="1.25rem" />
      </Box>

      <Box paddingX="0.75rem">
        <RewardsCard isNotReady={isNotReady} initialExpand={initialExpand} />

        <Gutter size="1.5rem" />

        <Stack gutter="1.5rem">
          {TokenViewData.map(({ title, balance, lenAlwaysShown }) => {
            if (balance.length === 0) {
              return null;
            }

            return (
              <CollapsibleList
                key={title}
                title={<TokenTitleView title={title} />}
                lenAlwaysShown={lenAlwaysShown}
                items={balance.map((viewToken) => {
                  const chainId =
                    "chainInfo" in viewToken
                      ? viewToken.chainInfo.chainId
                      : viewToken.unbonding.chainInfo.chainId;
                  const stakingAprDec = useGetStakingApr(chainId);

                  const stakingApr = stakingAprDec
                    ? `APR ${stakingAprDec.toString(2)}%`
                    : undefined;

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
                        stakingApr={stakingApr}
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
                      stakingApr={stakingApr}
                    />
                  );
                })}
              />
            );
          })}
        </Stack>

        <Gutter size="1.25rem" />
      </Box>
    </MainHeaderLayout>
  );
});

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
            altSentence: unbonding.completeTime
              ? intl.formatRelativeTime(relativeTime.value, relativeTime.unit)
              : "Caculating",
          };
        }),
    [hugeQueriesStore.unbondings, intl]
  );

  return {
    delegations,
    unbondings,
  };
};

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

const BalanceRow = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
`;

const BackToHomeButton = styled(Box)`
  width: fit-content;
  cursor: pointer;
  &:hover {
    opacity: ${COMMON_HOVER_OPACITY};
  }
`;

export const ChevronRightIcon: FunctionComponent<IconProps> = ({
  width = "1rem",
  height = "1rem",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M5.66669 12.6666L10.3334 7.99992L5.66669 3.33325"
        stroke="currentColor"
        strokeWidth="1.2963"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

const ChevronLeftIcon: FunctionComponent<IconProps> = ({
  width,
  height,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M10.3333 3.33342L5.66665 8.00008L10.3333 12.6667"
        stroke={color || "currentColor"}
        strokeWidth="1.2963"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
