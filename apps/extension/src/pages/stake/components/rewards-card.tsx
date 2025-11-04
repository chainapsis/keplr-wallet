import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Column, Columns } from "../../../components/column";
import { Stack } from "../../../components/stack";
import { Box } from "../../../components/box";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { Body3, Subtitle2, Subtitle3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import styled, { useTheme } from "styled-components";
import {
  CoinsPlusOutlineIcon,
  LoadingIcon,
  WarningIcon,
} from "../../../components/icon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Tooltip } from "../../../components/tooltip";
import { Skeleton } from "../../../components/skeleton";
import { XAxis, YAxis } from "../../../components/axis";
import { FormattedMessage, useIntl } from "react-intl";
import { CurrencyImageFallback } from "../../../components/image";
import { ClaimAllEachState } from "../../../hooks/claim";
import {
  animated,
  useTransition,
  useSpringRef,
  easings,
} from "@react-spring/web";
import {
  DescendantHeightPxRegistry,
  useVerticalSizeInternalContext,
} from "../../../components/transition/vertical-size/internal";
import { PortalTooltip } from "../../../components/tooltip/portal";
import { useRewards, ViewClaimToken } from "../../../hooks/use-rewards";
import { TextButton } from "../../../components/button-text";

export const RewardsCard: FunctionComponent<{
  isNotReady?: boolean;
  initialExpand?: boolean;
}> = observer(({ isNotReady, initialExpand }) => {
  const { analyticsStore, uiConfigStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const [isExpanded, setIsExpanded] = useState(false);
  const [disableHover, setDisableHover] = useState(false);

  const {
    viewClaimTokens,
    totalPrice,
    isLedger,
    isKeystone,
    claimAll,
    claimAllDisabled,
    claimAllIsLoading,
    states,
    getClaimAllEachState,
  } = useRewards();

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

  useEffect(() => {
    if (initialExpand) {
      setIsExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Styles.Container
      isNotReady={isNotReady}
      onClick={() => {
        analyticsStore.logEvent("click_claimExpandButton");
        if (viewClaimTokens.length > 0) {
          setIsExpanded(!isExpanded);
        }
      }}
      isExpanded={isExpanded}
      disableHover={disableHover}
    >
      <Columns sum={1} alignY="center">
        <Box paddingY="0.875rem" paddingX="1rem">
          <Stack gutter="0.5rem">
            <YAxis alignX="left">
              <Skeleton layer={1} isNotReady={isNotReady}>
                <XAxis alignY="center">
                  <Body3 style={{ color: ColorPalette["gray-300"] }}>
                    <FormattedMessage id="page.stake.components.rewards-card.title" />
                  </Body3>
                  <ArrowIcon direction={isExpanded ? "up" : "down"} />
                </XAxis>
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
        </Box>

        <Column weight={1} />

        <Skeleton type="button" layer={1} isNotReady={isNotReady}>
          {/*
                 ledger일 경우 특수한 행동을 하진 못하고 그냥 collapse를 펼치기만 한다.
                 특수한 기능이 없다는 것을 암시하기 위해서 ledger일때는 일반 버튼으로 처리한다.
               */}
          {isLedger || isKeystone ? (
            <TextButton
              text={intl.formatMessage({
                id: isExpanded
                  ? "page.stake.components.rewards-card.hide-all-button"
                  : "page.stake.components.rewards-card.show-all-button",
              })}
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              color="default"
            />
          ) : (
            <div
              onMouseEnter={() => setDisableHover(true)}
              onMouseLeave={() => setDisableHover(false)}
            >
              <TextButton
                text={intl.formatMessage({
                  id: "page.stake.components.rewards-card.claim-all-button",
                })}
                size="small"
                disabled={claimAllDisabled}
                onClick={claimAll}
                color="blue"
                right={
                  claimAllIsLoading ? (
                    <LoadingIcon width="1rem" height="1rem" />
                  ) : null
                }
              />
            </div>
          )}
        </Skeleton>
      </Columns>

      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <VerticalCollapseTransition
          collapsed={!isExpanded}
          opacityLeft={0}
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
          {viewClaimTokens.map((viewClaimToken, index) => (
            <ViewClaimTokenItem
              key={`${viewClaimToken.modularChainInfo.chainId}-${viewClaimToken.token.currency.coinMinimalDenom}`}
              viewClaimToken={viewClaimToken}
              state={getClaimAllEachState(
                viewClaimToken.modularChainInfo.chainId
              )}
              itemsLength={viewClaimTokens.length}
              isLastItem={index === viewClaimTokens.length - 1}
            />
          ))}
        </VerticalCollapseTransition>
      </div>
    </Styles.Container>
  );
});

const ViewClaimTokenItem: FunctionComponent<{
  viewClaimToken: ViewClaimToken;
  state: ClaimAllEachState;
  itemsLength: number;
  isLastItem: boolean;
}> = observer(({ viewClaimToken, state, itemsLength, isLastItem }) => {
  if ("starknet" in viewClaimToken.modularChainInfo) {
    return (
      <ViewStarknetClaimTokenItem
        viewClaimToken={viewClaimToken}
        state={state}
        itemsLength={itemsLength}
        isLastItem={isLastItem}
      />
    );
  }

  if ("cosmos" in viewClaimToken.modularChainInfo) {
    return (
      <ViewCosmosClaimTokenItem
        viewClaimToken={viewClaimToken}
        state={state}
        itemsLength={itemsLength}
        isLastItem={isLastItem}
      />
    );
  }

  return null;
});

const ViewCosmosClaimTokenItem: FunctionComponent<{
  viewClaimToken: ViewClaimToken;
  state: ClaimAllEachState;
  itemsLength: number;
  isLastItem: boolean;
}> = observer(({ viewClaimToken, state, itemsLength, isLastItem }) => {
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
      isLastItem={isLastItem}
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
  isLastItem: boolean;
}> = observer(({ viewClaimToken, state, itemsLength, isLastItem }) => {
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
      isLastItem={isLastItem}
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
  isLastItem: boolean;
  onClick: () => void | Promise<void>;
}> = observer(
  ({ viewClaimToken, state, itemsLength, isLoading, isLastItem, onClick }) => {
    const verticalSizeInternalContext = useVerticalSizeInternalContext();
    const parentHeightPxAnim = (() => {
      if (
        !verticalSizeInternalContext ||
        !verticalSizeInternalContext.registry
      ) {
        return;
      }
      if (
        verticalSizeInternalContext.registry instanceof
        DescendantHeightPxRegistry
      ) {
        return verticalSizeInternalContext.registry.heightPx;
      }
      return;
    })();

    const theme = useTheme();
    const { uiConfigStore, keyRingStore } = useStore();
    const intl = useIntl();

    const [isHover, setIsHover] = useState(false);

    const coinDenom = useMemo(() => {
      if ("paths" in viewClaimToken.token.currency) {
        const originDenom =
          viewClaimToken.token.currency.originCurrency?.coinDenom;
        if (originDenom) {
          return `${originDenom} (${viewClaimToken.modularChainInfo.chainName})`;
        }
      }

      return viewClaimToken.token.currency.coinDenom;
    }, [
      viewClaimToken.modularChainInfo.chainName,
      viewClaimToken.token.currency,
    ]);

    const showClaimButton = isHover || isLoading || !!state.failedReason;

    const buttonWrapperRef = useSpringRef();

    const transitions = useTransition(showClaimButton, {
      ref: buttonWrapperRef,
      from: {
        opacity: 0,
        width: "0rem",
      },
      enter: {
        opacity: 1,
        width: "1.875rem",
      },
      leave: {
        opacity: 0,
        width: "0rem",
      },
      config: {
        easing: easings.easeInOutQuart,
        duration: 250,
      },
    });

    const isLedger = !!(
      keyRingStore.selectedKeyInfo &&
      keyRingStore.selectedKeyInfo.type === "ledger"
    );

    const isKeystone = !!(
      keyRingStore.selectedKeyInfo &&
      keyRingStore.selectedKeyInfo.type === "keystone"
    );

    useEffect(() => {
      buttonWrapperRef.start();
    }, [buttonWrapperRef, showClaimButton]);

    return (
      <animated.div
        style={{
          transform: parentHeightPxAnim
            ? parentHeightPxAnim
                .to((v) => {
                  // 처음에 초기화가 되기 전에는 -1이기 때문에 이때는 처리를 하지 않는다.
                  if (v < 0) {
                    return 1;
                  }

                  // 얘는 react rendering과 상관없이 동작해야 하기 때문에 여기서 처리해야한다.
                  const parentExpandHeight = (() => {
                    if (
                      !verticalSizeInternalContext ||
                      !verticalSizeInternalContext.registry
                    ) {
                      return;
                    }
                    if (
                      verticalSizeInternalContext.registry instanceof
                      DescendantHeightPxRegistry
                    ) {
                      return verticalSizeInternalContext.registry.expandHeight;
                    }
                    return;
                  })();

                  // parentExpandHeight도 초기화 전에는 -1일 수 있다
                  // 뒤에서 나누기를 해야하기 때문에 0일때도 처리하면 안된다.
                  if (!parentExpandHeight || parentExpandHeight < 0) {
                    return 1;
                  }

                  return v / parentExpandHeight;
                })
                .to([0.1, 0.95], [0.85, 1], "clamp")
                .to((v) => {
                  if (v === 1) {
                    return "";
                  }
                  return `scale(${v})`;
                })
            : undefined,
        }}
      >
        <Styles.ItemContentBox
          isLastItem={isLastItem}
          showButton={showClaimButton}
          onHoverStateChange={setIsHover}
          onClick={() => {
            if (isLoading) {
              return;
            }
            setIsHover(false); // 아래 아이콘이 포함된 애니메이션 wrapper 영역을 클릭하면 포커스가 해제되지 않아서 수동으로 해줌
            onClick();
          }}
          style={{
            cursor: isLoading ? "default" : "pointer",
          }}
        >
          <Columns sum={1} alignY="center" gutter="0.75rem">
            <CurrencyImageFallback
              chainInfo={viewClaimToken.modularChainInfo}
              currency={viewClaimToken.token.currency}
              size="2rem"
            />

            <Column weight={1}>
              <Stack gutter="0.25rem">
                <Subtitle2
                  style={{
                    color:
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["white"],
                  }}
                >
                  {coinDenom}
                </Subtitle2>
                <Body3
                  style={{
                    color: ColorPalette["gray-300"],
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {viewClaimToken.modularChainInfo.chainName}
                </Body3>
              </Stack>
            </Column>
            <XAxis alignY="center">
              <Stack gutter="0.25rem" alignX="right">
                <Subtitle3
                  style={{
                    color:
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["white"],
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
                </Subtitle3>
                <Subtitle3
                  style={{
                    color: ColorPalette["gray-300"],
                  }}
                >
                  {uiConfigStore.hideStringIfPrivacyMode(
                    viewClaimToken.price?.toString() ?? "-",
                    2
                  )}
                </Subtitle3>
              </Stack>

              {transitions(
                (styles, item) =>
                  item && (
                    <animated.div
                      style={{
                        ...styles,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Tooltip
                        enabled={!!state.failedReason}
                        content={
                          state.failedReason?.message ||
                          state.failedReason?.toString()
                        }
                        allowedPlacements={
                          itemsLength === 1
                            ? ["left"]
                            : isLastItem
                            ? ["top"]
                            : undefined
                        }
                      >
                        {isLoading ? (
                          <LoadingIcon
                            width="1rem"
                            height="1rem"
                            color={
                              ColorPalette[
                                theme.mode === "light" ? "gray-200" : "gray-300"
                              ]
                            }
                          />
                        ) : state.failedReason ? (
                          <WarningIcon
                            width="1rem"
                            height="1rem"
                            color={
                              ColorPalette[
                                theme.mode === "light" ? "gray-200" : "gray-300"
                              ]
                            }
                          />
                        ) : isLedger || isKeystone ? (
                          <PortalTooltip
                            content={intl.formatMessage({
                              id: "page.stake.components.rewards-card.claim-button",
                            })}
                            isAlwaysOpen={isHover}
                          >
                            <ClaimCoinIcon isLedgerOrKeystone={true} />
                          </PortalTooltip>
                        ) : (
                          <ClaimCoinIcon />
                        )}
                      </Tooltip>
                    </animated.div>
                  )
              )}
            </XAxis>
          </Columns>
        </Styles.ItemContentBox>
      </animated.div>
    );
  }
);

const ArrowIcon = ({ direction }: { direction: "up" | "down" }) => {
  return (
    <div
      style={{
        transform: direction === "up" ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease",
      }}
    >
      <ArrowDownIcon />
    </div>
  );
};

const ArrowDownIcon = () => {
  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M8.78087 10.0239C8.38054 10.5243 7.61946 10.5243 7.21913 10.0239L5.29976 7.6247C4.77595 6.96993 5.24212 6 6.08063 6L9.91938 6C10.7579 6 11.2241 6.96993 10.7002 7.6247L8.78087 10.0239Z"
          fill={ColorPalette["gray-300"]}
        />
      </svg>
    </div>
  );
};

const ClaimCoinIcon: FunctionComponent<{
  isLedgerOrKeystone?: boolean;
}> = ({ isLedgerOrKeystone }) => {
  const theme = useTheme();
  return (
    <CoinsPlusOutlineIcon
      color={
        isLedgerOrKeystone
          ? ColorPalette[theme.mode === "light" ? "gray-700" : "white"]
          : ColorPalette[theme.mode === "light" ? "gray-200" : "gray-300"]
      }
    />
  );
};

const Styles = {
  Container: styled.div<{
    isNotReady?: boolean;
    isExpanded?: boolean;
    disableHover?: boolean;
  }>`
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
    border-radius: 1.25rem;

    cursor: pointer;

    &:hover {
      opacity: ${(props) => (props.isExpanded || props.disableHover ? 1 : 0.7)};
    }
  `,
  ItemContentBox: styled(Box)<{ showButton?: boolean; isLastItem?: boolean }>`
    padding: 0.875rem 1rem;
    padding-right: ${(props) => (props.showButton ? "0.625rem" : "1rem")};
    border-radius: 1rem;

    margin: 0 0.5rem;
    margin-bottom: ${(props) => (props.isLastItem ? "0.75rem" : "0")};

    &:hover {
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-600"]};
    }

    &:active {
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-550"]};
    }
  `,
};
