import React, { FunctionComponent, useEffect, useState } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { Body2, Subtitle2, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { ViewToken } from "../../index";
import styled, { css, useTheme } from "styled-components";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  WarningIcon,
} from "../../../../components/icon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ModularChainInfo } from "@keplr-wallet/types";
import { Tooltip } from "../../../../components/tooltip";
import { Skeleton } from "../../../../components/skeleton";
import { YAxis } from "../../../../components/axis";
import Color from "color";
import { SpecialButton } from "../../../../components/special-button";
import { Gutter } from "../../../../components/gutter";
import { FormattedMessage, useIntl } from "react-intl";
import { CurrencyImageFallback } from "../../../../components/image";
import {
  ClaimAllEachState,
  useCosmosClaimRewards,
  useClaimAllEachState,
  useStarknetClaimRewards,
} from "../../../../hooks/claim";

interface ViewClaimToken extends Omit<ViewToken, "chainInfo"> {
  modularChainInfo: ModularChainInfo;
  price?: PricePretty;
  onClaimAll: (
    chainId: string,
    rewardToken: CoinPretty,
    state: ClaimAllEachState
  ) => void | Promise<void>;
  onClaimSingle: (
    chainId: string,
    state: ClaimAllEachState
  ) => void | Promise<void>;
}

const Styles = {
  Container: styled.div<{ isNotReady?: boolean }>`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette.white
        : ColorPalette["gray-650"]};

    box-shadow: ${(props) =>
      props.theme.mode === "light" && !props.isNotReady
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none"};
    padding: 0.75rem 0 0 0;
    border-radius: 0.375rem;
  `,
  ExpandButton: styled(Box)<{ viewTokenCount: number }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 1.5rem;

    cursor: pointer;

    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;

    ${({ viewTokenCount }) => {
      if (viewTokenCount === 0) {
        return css`
          cursor: not-allowed;
        `;
      }

      return css`
        :hover {
          background-color: ${(props) =>
            props.theme.mode === "light"
              ? ColorPalette["gray-10"]
              : Color(ColorPalette["gray-600"]).alpha(0.5).toString()};
        }

        :active {
          background-color: ${(props) =>
            props.theme.mode === "light"
              ? ColorPalette["gray-50"]
              : ColorPalette["gray-500"]};
        }
      `;
    }};
  `,
};

const zeroDec = new Dec(0);

export const ClaimAll: FunctionComponent<{ isNotReady?: boolean }> = observer(
  ({ isNotReady }) => {
    const {
      analyticsStore,
      chainStore,
      accountStore,
      queriesStore,
      starknetQueriesStore,
      priceStore,
      keyRingStore,
      uiConfigStore,
    } = useStore();
    const intl = useIntl();
    const theme = useTheme();

    const [isExpanded, setIsExpanded] = useState(false);
    const { states, getClaimAllEachState } = useClaimAllEachState();

    const { handleCosmosClaimAllEach, handleCosmosClaimSingle } =
      useCosmosClaimRewards();
    const { handleStarknetClaimAllEach, handleStarknetClaimSingle } =
      useStarknetClaimRewards();

    const viewClaimTokens: ViewClaimToken[] = (() => {
      const res: ViewClaimToken[] = [];
      for (const modularChainInfo of chainStore.modularChainInfos) {
        const chainId = modularChainInfo.chainId;

        if ("cosmos" in modularChainInfo) {
          const chainInfo = chainStore.getChain(chainId);
          const accountAddress = accountStore.getAccount(chainId).bech32Address;
          const queries = queriesStore.get(chainId);
          const queryRewards =
            queries.cosmos.queryRewards.getQueryBech32Address(accountAddress);

          const targetDenom = (() => {
            if (chainInfo.chainIdentifier === "dydx-mainnet") {
              return "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5";
            }

            if (chainInfo.chainIdentifier === "elys") {
              return "ueden";
            }

            return chainInfo.stakeCurrency?.coinMinimalDenom;
          })();

          if (targetDenom) {
            const currency = chainInfo.findCurrency(targetDenom);
            if (currency) {
              const reward = queryRewards.rewards.find(
                (r) => r.currency.coinMinimalDenom === targetDenom
              );
              if (reward) {
                res.push({
                  token: reward,
                  price: priceStore.calculatePrice(reward),
                  modularChainInfo: modularChainInfo,
                  isFetching: queryRewards.isFetching,
                  error: queryRewards.error,
                  onClaimAll: handleCosmosClaimAllEach,
                  onClaimSingle: handleCosmosClaimSingle,
                });
              }
            }
          }
        } else if ("starknet" in modularChainInfo) {
          if (chainId !== "starknet:SN_MAIN") {
            continue;
          }

          const starknetChainInfo = chainStore.getModularChain(chainId);
          const queryStakingInfo = starknetQueriesStore
            .get(chainId)
            .stakingInfoManager.getStakingInfo(
              accountStore.getAccount(starknetChainInfo.chainId)
                .starknetHexAddress
            );

          const totalClaimableRewardAmount =
            queryStakingInfo?.totalClaimableRewardAmount;

          if (totalClaimableRewardAmount?.toDec().gt(zeroDec)) {
            res.push({
              token: totalClaimableRewardAmount,
              modularChainInfo: starknetChainInfo,
              isFetching: queryStakingInfo?.isFetching ?? false,
              error: queryStakingInfo?.error, // ignore queryStakingInfo error
              onClaimAll: handleStarknetClaimAllEach,
              onClaimSingle: handleStarknetClaimSingle,
            });
          }
        }
      }

      return res
        .filter((viewToken) => viewToken.token.toDec().gt(zeroDec))
        .sort((a, b) => {
          const aPrice = priceStore.calculatePrice(a.token)?.toDec() ?? zeroDec;
          const bPrice = priceStore.calculatePrice(b.token)?.toDec() ?? zeroDec;

          if (aPrice.equals(bPrice)) {
            return 0;
          }
          return aPrice.gt(bPrice) ? -1 : 1;
        })
        .sort((a, b) => {
          const aHasError =
            getClaimAllEachState(a.modularChainInfo.chainId).failedReason !=
            null;
          const bHasError =
            getClaimAllEachState(b.modularChainInfo.chainId).failedReason !=
            null;

          if (aHasError || bHasError) {
            if (aHasError && bHasError) {
              return 0;
            } else if (aHasError) {
              return 1;
            } else {
              return -1;
            }
          }

          return 0;
        });
    })();

    const totalPrice = (() => {
      const fiatCurrency = priceStore.getFiatCurrency(
        priceStore.defaultVsCurrency
      );
      if (!fiatCurrency) {
        return undefined;
      }

      let res = new PricePretty(fiatCurrency, 0);

      for (const viewClaimToken of viewClaimTokens) {
        const price = priceStore.calculatePrice(viewClaimToken.token);
        if (price) {
          res = res.add(price);
        }
      }

      return res;
    })();

    const isLedger =
      keyRingStore.selectedKeyInfo &&
      keyRingStore.selectedKeyInfo.type === "ledger";

    const isKeystone =
      keyRingStore.selectedKeyInfo &&
      keyRingStore.selectedKeyInfo.type === "keystone";

    const claimAll = () => {
      analyticsStore.logEvent("click_claimAll");

      if (viewClaimTokens.length > 0) {
        setIsExpanded(true);
      }

      if (isLedger || isKeystone) {
        // Ledger에서 현실적으로 이 기능을 처리해주기 난감하다.
        // disable하기보다는 일단 눌렀을때 expand를 시켜주고 아무것도 하지 않는다.
        return;
      }

      for (const viewClaimToken of viewClaimTokens) {
        const state = getClaimAllEachState(
          viewClaimToken.modularChainInfo.chainId
        );

        viewClaimToken.onClaimAll(
          viewClaimToken.modularChainInfo.chainId,
          viewClaimToken.token,
          state
        );
      }
    };

    const claimAllDisabled = (() => {
      if (viewClaimTokens.length === 0) {
        return true;
      }

      for (const viewClaimToken of viewClaimTokens) {
        if (viewClaimToken.token.toDec().gt(new Dec(0))) {
          return false;
        }
      }

      return true;
    })();

    const claimAllIsLoading = (() => {
      for (const chainInfo of chainStore.chainInfosInUI) {
        const state = getClaimAllEachState(chainInfo.chainId);
        if (state.isLoading) {
          return true;
        }
      }
      return false;
    })();

    useEffect(() => {
      if (isExpanded) {
        if (!claimAllIsLoading) {
          // Clear errors when collapsed.
          for (const state of states) {
            state.setFailedReason(undefined);
          }
        }
      }
      // 펼쳐지면서 그 때 loading 중이 아닐 경우에 에러를 지워준다.
      // 펼쳐지는 순간에만 발생해야하기 때문에 claimAllIsLoading는 deps에서 없어야한다.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    return (
      <Styles.Container isNotReady={isNotReady}>
        <Box paddingX="1rem" paddingBottom="0.25rem">
          <Columns sum={1} alignY="center">
            <Stack gutter="0.5rem">
              <YAxis alignX="left">
                <Skeleton layer={1} isNotReady={isNotReady}>
                  <Body2 style={{ color: ColorPalette["gray-300"] }}>
                    <FormattedMessage id="page.main.components.claim-all.title" />
                  </Body2>
                </Skeleton>
              </YAxis>

              <YAxis alignX="left">
                <Skeleton
                  layer={1}
                  isNotReady={isNotReady}
                  dummyMinWidth="5.125rem"
                >
                  <Subtitle2
                    style={{
                      color:
                        theme.mode === "light"
                          ? ColorPalette["gray-700"]
                          : ColorPalette["gray-10"],
                    }}
                  >
                    {uiConfigStore.hideStringIfPrivacyMode(
                      totalPrice ? totalPrice.separator(" ").toString() : "?",
                      3
                    )}
                  </Subtitle2>
                </Skeleton>
              </YAxis>
            </Stack>

            <Column weight={1} />

            <Skeleton type="button" layer={1} isNotReady={isNotReady}>
              {/*
                 ledger일 경우 특수한 행동을 하진 못하고 그냥 collapse를 펼치기만 한다.
                 특수한 기능이 없다는 것을 암시하기 위해서 ledger일때는 일반 버튼으로 처리한다.
               */}
              {isLedger || isKeystone ? (
                <Button
                  text={intl.formatMessage({
                    id: "page.main.components.claim-all.button",
                  })}
                  size="small"
                  isLoading={claimAllIsLoading}
                  disabled={claimAllDisabled}
                  onClick={claimAll}
                />
              ) : (
                <SpecialButton
                  text={intl.formatMessage({
                    id: "page.main.components.claim-all.button",
                  })}
                  size="small"
                  isLoading={claimAllIsLoading}
                  disabled={claimAllDisabled}
                  onClick={claimAll}
                />
              )}
            </Skeleton>
          </Columns>
        </Box>

        <Styles.ExpandButton
          paddingX="0.125rem"
          alignX="center"
          viewTokenCount={viewClaimTokens.length}
          onClick={() => {
            analyticsStore.logEvent("click_claimExpandButton");
            if (viewClaimTokens.length > 0) {
              setIsExpanded(!isExpanded);
            }
          }}
        >
          <Box
            style={{
              opacity: isNotReady ? 0 : 1,
            }}
          >
            {!isExpanded ? (
              <ArrowDownIcon
                width="1.25rem"
                height="1.25rem"
                color={ColorPalette["gray-300"]}
              />
            ) : (
              <ArrowUpIcon
                width="1.25rem"
                height="1.25rem"
                color={ColorPalette["gray-300"]}
              />
            )}
          </Box>
        </Styles.ExpandButton>

        <VerticalCollapseTransition
          collapsed={!isExpanded}
          onTransitionEnd={() => {
            if (!isExpanded) {
              if (!claimAllIsLoading) {
                // Clear errors when collapsed.
                for (const state of states) {
                  state.setFailedReason(undefined);
                }
              }
            }
          }}
        >
          {viewClaimTokens.map((viewClaimToken) => (
            <ViewClaimTokenItem
              key={`${viewClaimToken.modularChainInfo.chainId}-${viewClaimToken.token.currency.coinMinimalDenom}`}
              viewClaimToken={viewClaimToken}
              state={getClaimAllEachState(
                viewClaimToken.modularChainInfo.chainId
              )}
              itemsLength={viewClaimTokens.length}
            />
          ))}
        </VerticalCollapseTransition>
      </Styles.Container>
    );
  }
);

// TODO: 상위 컴포넌트에서 claim 함수를 전달해주는 방식으로 변경
const ViewClaimTokenItem: FunctionComponent<{
  viewClaimToken: ViewClaimToken;
  state: ClaimAllEachState;
  itemsLength: number;
}> = observer(({ viewClaimToken, state, itemsLength }) => {
  if ("starknet" in viewClaimToken.modularChainInfo) {
    return (
      <ViewStarknetClaimTokenItem
        viewClaimToken={viewClaimToken}
        state={state}
        itemsLength={itemsLength}
      />
    );
  }

  if ("cosmos" in viewClaimToken.modularChainInfo) {
    return (
      <ViewCosmosClaimTokenItem
        viewClaimToken={viewClaimToken}
        state={state}
        itemsLength={itemsLength}
      />
    );
  }

  return null;
});

const ViewCosmosClaimTokenItem: FunctionComponent<{
  viewClaimToken: ViewClaimToken;
  state: ClaimAllEachState;
  itemsLength: number;
}> = observer(({ viewClaimToken, state, itemsLength }) => {
  const { accountStore } = useStore();

  const isLoading =
    accountStore.getAccount(viewClaimToken.modularChainInfo.chainId)
      .isSendingMsg === "withdrawRewards" ||
    state.isLoading ||
    state.isSimulating;

  return (
    <ViewClaimTokenItemContent
      viewClaimToken={viewClaimToken}
      state={state}
      itemsLength={itemsLength}
      isLoading={isLoading}
      onClick={() => {
        viewClaimToken.onClaimSingle(
          viewClaimToken.modularChainInfo.chainId,
          state
        );
      }}
    />
  );
});

const ViewStarknetClaimTokenItem: FunctionComponent<{
  viewClaimToken: ViewClaimToken;
  state: ClaimAllEachState;
  itemsLength: number;
}> = observer(({ viewClaimToken, state, itemsLength }) => {
  const { starknetAccountStore } = useStore();

  const isLoading =
    starknetAccountStore.getAccount(viewClaimToken.modularChainInfo.chainId)
      .isSendingTx ||
    state.isSimulating ||
    state.isLoading;

  return (
    <ViewClaimTokenItemContent
      viewClaimToken={viewClaimToken}
      state={state}
      itemsLength={itemsLength}
      isLoading={isLoading}
      onClick={() => {
        viewClaimToken.onClaimSingle(
          viewClaimToken.modularChainInfo.chainId,
          state
        );
      }}
    />
  );
});

const ViewClaimTokenItemContent: FunctionComponent<{
  viewClaimToken: ViewClaimToken;
  state: ClaimAllEachState;
  itemsLength: number;
  isLoading: boolean;
  onClick: () => void | Promise<void>;
}> = observer(({ viewClaimToken, state, itemsLength, isLoading, onClick }) => {
  const theme = useTheme();
  const intl = useIntl();

  const { uiConfigStore } = useStore();

  return (
    <Box padding="1rem">
      <Columns sum={1} alignY="center">
        {viewClaimToken.token.currency.coinImageUrl && (
          <CurrencyImageFallback
            chainInfo={viewClaimToken.modularChainInfo}
            currency={viewClaimToken.token.currency}
            size="2rem"
          />
        )}

        <Gutter size="0.75rem" />

        <Column weight={1}>
          <Stack gutter="0.375rem">
            <Subtitle3
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["gray-300"],
              }}
            >
              {(() => {
                if ("paths" in viewClaimToken.token.currency) {
                  const originDenom =
                    viewClaimToken.token.currency.originCurrency?.coinDenom;
                  if (originDenom) {
                    return `${originDenom} (${viewClaimToken.modularChainInfo.chainName})`;
                  }
                }

                return viewClaimToken.token.currency.coinDenom;
              })()}
            </Subtitle3>
            <Subtitle2
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-10"],
              }}
            >
              {uiConfigStore.hideStringIfPrivacyMode(
                viewClaimToken.token
                  .maxDecimals(6)
                  .shrink(true)
                  .inequalitySymbol(true)
                  .hideDenom(true)
                  .toString(),
                2
              )}
            </Subtitle2>
          </Stack>
        </Column>

        <Tooltip
          enabled={!!state.failedReason}
          content={
            state.failedReason?.message || state.failedReason?.toString()
          }
          // 아이템이 한개만 있으면 tooltip이 VerticalCollapseTransition가 overflow: hidden이라
          // 위/아래로 나타나면 가려져서 유저가 오류 메세지를 볼 방법이 없다.
          // VerticalCollapseTransition가 overflow: hidden이여야 하는건 필수적이므로 이 부분을 수정할 순 없기 때문에
          // 대충 아이템이 한개면 tooltip이 왼족에 나타나도록 한다.
          allowedPlacements={itemsLength === 1 ? ["left"] : undefined}
        >
          <Button
            text={intl.formatMessage({
              id: "page.main.components.claim-all.claim-button",
            })}
            size="small"
            color="secondary"
            isLoading={isLoading}
            disabled={viewClaimToken.token.toDec().lte(new Dec(0))}
            textOverrideIcon={
              state.failedReason ? (
                <WarningIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette["gray-200"]}
                />
              ) : undefined
            }
            onClick={onClick}
          />
        </Tooltip>
      </Columns>
    </Box>
  );
});
