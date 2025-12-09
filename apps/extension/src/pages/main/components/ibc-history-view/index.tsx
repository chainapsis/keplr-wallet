import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  BackgroundTxStatus,
  BackgroundTxType,
  GetIBCHistoriesMsg,
  GetSkipHistoriesMsg,
  GetSwapV2HistoriesMsg,
  GetTxExecutionMsg,
  HideSwapV2HistoryMsg,
  IBCHistory,
  RemoveIBCHistoryMsg,
  RemoveSkipHistoryMsg,
  RemoveSwapV2HistoryMsg,
  ResumeTxMsg,
  SkipHistory,
  SwapV2History,
  SwapV2TxStatus,
  TxExecution,
  TxExecutionStatus,
} from "@keplr-wallet/background";
import { SwapProvider } from "@keplr-wallet/types";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useLayoutEffectOnce } from "../../../../hooks/use-effect-once";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { Button } from "../../../../components/button";
import { Gutter } from "../../../../components/gutter";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import {
  Body2,
  Caption1,
  Caption2,
  Subtitle3,
  Subtitle4,
} from "../../../../components/typography";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  InformationIcon,
  LoadingIcon,
  XMarkIcon,
} from "../../../../components/icon";
import { useStore } from "../../../../stores";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { IChainInfoImpl, MakeTxResponse } from "@keplr-wallet/stores";
import { ChainImageFallback } from "../../../../components/image";
import { IconProps } from "../../../../components/icon/types";
import { useSpringValue, animated, easings } from "@react-spring/web";
import { defaultSpringConfig } from "../../../../styles/spring";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { StepIndicator } from "../../../../components/step-indicator";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useNotification } from "../../../../hooks/notification";

export const IbcHistoryView: FunctionComponent<{
  isNotReady: boolean;
}> = observer(({ isNotReady }) => {
  const { queriesStore, accountStore } = useStore();

  const [histories, setHistories] = useState<IBCHistory[]>([]);
  const [skipHistories, setSkipHistories] = useState<SkipHistory[]>([]);
  const [swapV2Histories, setSwapV2Histories] = useState<SwapV2History[]>([]);

  useLayoutEffectOnce(() => {
    let count = 0;
    const alreadyCompletedHistoryMap = new Map<string, boolean>();
    const requester = new InExtensionMessageRequester();

    const fn = () => {
      const msg = new GetIBCHistoriesMsg();
      requester.sendMessage(BACKGROUND_PORT, msg).then((newHistories) => {
        setHistories((histories) => {
          if (JSON.stringify(histories) !== JSON.stringify(newHistories)) {
            count++;

            // Currently there is no elegant way to automatically refresh when an ibc transfer is complete.
            // For now, deal with it here
            const newCompletes = newHistories.filter((history) => {
              if (alreadyCompletedHistoryMap.get(history.id)) {
                return false;
              }
              return !!(
                history.txFulfilled &&
                !history.ibcHistory.some((h) => !h.completed)
              );
            });
            if (count > 1) {
              // There is no need to refresh balance if first time.
              for (const newComplete of newCompletes) {
                // If IBC transfer
                if ("recipient" in newComplete) {
                  queriesStore
                    .get(newComplete.destinationChainId)
                    .queryBalances.getQueryBech32Address(newComplete.recipient)
                    .fetch();
                } else {
                  // If IBC swap
                  queriesStore
                    .get(newComplete.destinationChainId)
                    .queryBalances.getQueryBech32Address(
                      accountStore.getAccount(newComplete.destinationChainId)
                        .bech32Address
                    )
                    .fetch();
                }
              }
            }
            for (const newComplete of newCompletes) {
              alreadyCompletedHistoryMap.set(newComplete.id, true);
            }

            return newHistories;
          }
          return histories;
        });
      });
    };

    fn();
    const interval = setInterval(fn, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  useLayoutEffectOnce(() => {
    let count = 0;
    const alreadyCompletedHistoryMap = new Map<string, boolean>();
    const requester = new InExtensionMessageRequester();

    const fn = () => {
      const msg = new GetSkipHistoriesMsg();
      requester.sendMessage(BACKGROUND_PORT, msg).then((newHistories) => {
        setSkipHistories((histories) => {
          if (JSON.stringify(histories) !== JSON.stringify(newHistories)) {
            count++;

            // Currently there is no elegant way to automatically refresh when an ibc transfer is complete.
            // For now, deal with it here
            const newCompletes = newHistories.filter((history) => {
              if (alreadyCompletedHistoryMap.get(history.id)) {
                return false;
              }
              return (
                !!history.trackDone &&
                history.routeIndex === history.simpleRoute.length - 1
              );
            });

            if (count > 1) {
              // There is no need to refresh balance if first time. (onMount)
              for (const newComplete of newCompletes) {
                const lastRoute =
                  newComplete.simpleRoute[newComplete.routeIndex];

                if (lastRoute.isOnlyEvm) {
                  queriesStore
                    .get(lastRoute.chainId)
                    .queryBalances.getQueryEthereumHexAddress(
                      newComplete.simpleRoute[newComplete.routeIndex].receiver
                    )
                    .fetch();
                } else {
                  queriesStore
                    .get(newComplete.destinationChainId)
                    .queryBalances.getQueryBech32Address(
                      newComplete.simpleRoute[newComplete.routeIndex].receiver
                    )
                    .fetch();
                }
              }
            }
            for (const newComplete of newCompletes) {
              alreadyCompletedHistoryMap.set(newComplete.id, true);
            }

            return newHistories;
          }
          return histories;
        });
      });
    };

    fn();

    const interval = setInterval(fn, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  useLayoutEffectOnce(() => {
    let count = 0;
    const alreadyCompletedHistoryMap = new Map<string, boolean>();
    const requester = new InExtensionMessageRequester();

    const fn = () => {
      const msg = new GetSwapV2HistoriesMsg();
      requester.sendMessage(BACKGROUND_PORT, msg).then((newHistories) => {
        setSwapV2Histories((histories) => {
          if (JSON.stringify(histories) !== JSON.stringify(newHistories)) {
            count++;

            // Currently there is no elegant way to automatically refresh when an ibc transfer is complete.
            // For now, deal with it here
            const newCompletes = newHistories.filter((history) => {
              if (alreadyCompletedHistoryMap.get(history.id)) {
                return false;
              }
              return (
                !!history.trackDone &&
                history.routeIndex === history.simpleRoute.length - 1
              );
            });

            if (count > 1) {
              // There is no need to refresh balance if first time. (onMount)
              for (const newComplete of newCompletes) {
                const lastRoute =
                  newComplete.simpleRoute[newComplete.routeIndex];

                if (lastRoute.isOnlyEvm) {
                  queriesStore
                    .get(lastRoute.chainId)
                    .queryBalances.getQueryEthereumHexAddress(
                      newComplete.simpleRoute[newComplete.routeIndex].receiver
                    )
                    .fetch();
                } else {
                  queriesStore
                    .get(newComplete.toChainId)
                    .queryBalances.getQueryBech32Address(
                      newComplete.simpleRoute[newComplete.routeIndex].receiver
                    )
                    .fetch();
                }
              }
            }
            for (const newComplete of newCompletes) {
              alreadyCompletedHistoryMap.set(newComplete.id, true);
            }

            return newHistories;
          }
          return histories;
        });
      });
    };

    fn();

    const interval = setInterval(fn, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  const filteredHistories = (() => {
    const filteredIBCHistories = histories.filter((history) => {
      const account = accountStore.getAccount(history.chainId);
      if (account.bech32Address === history.sender) {
        return true;
      }
      return false;
    });

    const filteredSkipHistories = skipHistories.filter((history) => {
      const firstRoute = history.simpleRoute[0];
      const account = accountStore.getAccount(firstRoute.chainId);

      if (firstRoute.isOnlyEvm) {
        if (account.ethereumHexAddress === history.sender) {
          return true;
        }
        return false;
      }

      if (account.bech32Address === history.sender) {
        return true;
      }
      return false;
    });

    const filteredSwapV2Histories = swapV2Histories.filter((history) => {
      const firstRoute = history.simpleRoute[0];
      const account = accountStore.getAccount(firstRoute.chainId);

      if (firstRoute.isOnlyEvm) {
        if (account.ethereumHexAddress === history.sender) {
          return true;
        }
        return false;
      }

      if (account.bech32Address === history.sender) {
        return true;
      }
      return false;
    });

    if (isNotReady) {
      return null;
    }

    return [
      ...filteredIBCHistories,
      ...filteredSkipHistories,
      ...filteredSwapV2Histories,
    ].sort(
      (a, b) => b.timestamp - a.timestamp // The latest history should be shown first
    );
  })();

  return (
    <Stack gutter="0.75rem">
      {filteredHistories?.map((history) => {
        if ("ibcHistory" in history) {
          return (
            <IbcHistoryViewItem
              key={history.id}
              history={history}
              removeHistory={(id) => {
                const requester = new InExtensionMessageRequester();
                const msg = new RemoveIBCHistoryMsg(id);
                requester
                  .sendMessage(BACKGROUND_PORT, msg)
                  .then((histories) => {
                    setHistories(histories);
                  });
              }}
            />
          );
        }

        if ("provider" in history) {
          return (
            <SwapV2HistoryViewItem
              key={history.id}
              history={history}
              removeHistory={(id, shouldHide) => {
                const requester = new InExtensionMessageRequester();
                if (shouldHide) {
                  const msg = new HideSwapV2HistoryMsg(id);
                  requester.sendMessage(BACKGROUND_PORT, msg);
                } else {
                  const msg = new RemoveSwapV2HistoryMsg(id);
                  requester
                    .sendMessage(BACKGROUND_PORT, msg)
                    .then((histories) => {
                      setSwapV2Histories(histories);
                    });
                }
              }}
            />
          );
        }

        return (
          <SkipHistoryViewItem
            key={history.id}
            history={history}
            removeHistory={(id) => {
              const requester = new InExtensionMessageRequester();
              const msg = new RemoveSkipHistoryMsg(id);
              requester.sendMessage(BACKGROUND_PORT, msg).then((histories) => {
                setSkipHistories(histories);
              });
            }}
          />
        );
      })}
      {filteredHistories && filteredHistories.length > 0 ? (
        <Gutter size="0.75rem" />
      ) : null}
    </Stack>
  );
});

const IbcHistoryViewItem: FunctionComponent<{
  history: IBCHistory;
  removeHistory: (id: string) => void;
}> = observer(({ history, removeHistory }) => {
  const { chainStore } = useStore();

  const theme = useTheme();
  const intl = useIntl();

  const isIBCSwap = "swapType" in history;

  const historyCompleted = (() => {
    if (!history.txFulfilled) {
      return false;
    }

    if (history.ibcHistory.some((h) => h.error != null)) {
      return false;
    }

    return !history.ibcHistory.some((ibcHistory) => {
      return !ibcHistory.completed;
    });
  })();
  const failedChannelIndex = (() => {
    return history.ibcHistory.findIndex((h) => h.error != null);
  })();
  const failedChannel = (() => {
    if (failedChannelIndex >= 0) {
      return history.ibcHistory[failedChannelIndex];
    }
  })();
  const lastRewoundChannelIndex = (() => {
    return history.ibcHistory.findIndex((h) => h.rewound);
  })();

  return (
    <Box
      padding="1.25rem"
      borderRadius="1.25rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      style={{
        boxShadow:
          theme.mode === "light"
            ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
            : "none",
      }}
    >
      <YAxis>
        <XAxis alignY="center">
          {(() => {
            if (failedChannelIndex >= 0) {
              return (
                <ErrorIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["orange-400"]
                      : ColorPalette["yellow-400"]
                  }
                />
              );
            }

            if (!historyCompleted) {
              return (
                <LoadingIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette.white
                  }
                />
              );
            }

            return (
              <CheckCircleIcon
                width="1.25rem"
                height="1.25rem"
                color={ColorPalette["green-400"]}
              />
            );
          })()}

          <Gutter size="0.5rem" />

          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-600"]
                : ColorPalette["gray-10"]
            }
          >
            {(() => {
              if (failedChannelIndex >= 0) {
                if (
                  !history.ibcHistory
                    .slice(0, failedChannelIndex + 1)
                    .some((h) => !h.rewound) ||
                  history.ibcHistory
                    .slice(0, failedChannelIndex + 1)
                    .some((h) => h.rewoundButNextRewindingBlocked)
                ) {
                  return intl.formatMessage({
                    id: "page.main.components.ibc-history-view.ibc-swap.item.refund.succeed",
                  });
                }
                return intl.formatMessage({
                  id: "page.main.components.ibc-history-view.ibc-swap.item.refund.pending",
                });
              }

              return !historyCompleted
                ? intl.formatMessage({
                    id: isIBCSwap
                      ? "page.main.components.ibc-history-view.ibc-swap.item.pending"
                      : "page.main.components.ibc-history-view.item.pending",
                  })
                : intl.formatMessage({
                    id: isIBCSwap
                      ? "page.main.components.ibc-history-view.ibc-swap.item.succeed"
                      : "page.main.components.ibc-history-view.item.succeed",
                  });
            })()}
          </Subtitle4>
          <div
            style={{
              flex: 1,
            }}
          />
          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              removeHistory(history.id);
            }}
          >
            <XMarkIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
            />
          </Box>
        </XAxis>

        <Gutter size="1rem" />

        <Body2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-400"]
              : ColorPalette["gray-100"]
          }
        >
          {(() => {
            const sourceChain = chainStore.getChain(history.chainId);
            const destinationChain = chainStore.getChain(
              history.destinationChainId
            );

            if ("swapType" in history) {
              if (historyCompleted && failedChannelIndex < 0) {
                const chainId = history.destinationChainId;
                const chainInfo = chainStore.getChain(chainId);
                const assets = (() => {
                  if (
                    history.resAmount.length !==
                    history.ibcHistory.length + 1
                  ) {
                    return "Unknown";
                  }

                  return history.resAmount[history.ibcHistory.length]
                    .map((amount) => {
                      return new CoinPretty(
                        chainInfo.forceFindCurrency(amount.denom),
                        amount.amount
                      )
                        .hideIBCMetadata(true)
                        .shrink(true)
                        .maxDecimals(6)
                        .inequalitySymbol(true)
                        .trim(true)
                        .toString();
                    })
                    .join(", ");
                })();

                return intl.formatMessage(
                  {
                    id: "page.main.components.ibc-history-view.ibc-swap.succeed.paragraph",
                  },
                  {
                    assets,
                  }
                );
              }

              const assets = history.amount
                .map((amount) => {
                  const currency = sourceChain.forceFindCurrency(amount.denom);
                  const pretty = new CoinPretty(currency, amount.amount);
                  return pretty
                    .hideIBCMetadata(true)
                    .shrink(true)
                    .maxDecimals(6)
                    .inequalitySymbol(true)
                    .trim(true)
                    .toString();
                })
                .join(", ");

              return intl.formatMessage(
                {
                  id: "page.main.components.ibc-history-view.ibc-swap.paragraph",
                },
                {
                  assets,
                  destinationDenom: (() => {
                    const currency = chainStore
                      .getChain(history.destinationAsset.chainId)
                      .forceFindCurrency(history.destinationAsset.denom);

                    if (
                      "originCurrency" in currency &&
                      currency.originCurrency
                    ) {
                      return currency.originCurrency.coinDenom;
                    }

                    return currency.coinDenom;
                  })(),
                }
              );
            }

            const assets = history.amount
              .map((amount) => {
                const currency = sourceChain.forceFindCurrency(amount.denom);
                const pretty = new CoinPretty(currency, amount.amount);
                return pretty
                  .hideIBCMetadata(true)
                  .shrink(true)
                  .maxDecimals(6)
                  .inequalitySymbol(true)
                  .trim(true)
                  .toString();
              })
              .join(", ");

            return intl.formatMessage(
              {
                id: "page.main.components.ibc-history-view.paragraph",
              },
              {
                assets,
                sourceChain: sourceChain.chainName,
                destinationChain: destinationChain.chainName,
              }
            );
          })()}
        </Body2>

        <Gutter size="1rem" />

        <Box
          borderRadius="9999999px"
          padding="0.625rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-500"]
          }
        >
          <XAxis alignY="center">
            {(() => {
              const chainIds = [
                history.chainId,
                ...history.ibcHistory.map((item) => item.counterpartyChainId),
              ];

              return chainIds.map((chainId, i) => {
                const chainInfo = chainStore.getChain(chainId);

                const completed = (() => {
                  if (i === 0) {
                    return history.txFulfilled || false;
                  }

                  return history.ibcHistory[i - 1].completed;
                })();

                const error = (() => {
                  if (i === 0) {
                    return history.txError != null;
                  }

                  return history.ibcHistory[i - 1].error != null;
                })();

                return (
                  // 일부분 순환하는 경우도 이론적으로 가능은 하기 때문에 chain id를 key로 사용하지 않음.
                  <IbcHistoryViewItemChainImage
                    key={i}
                    chainInfo={chainInfo}
                    completed={(() => {
                      if (failedChannel) {
                        if (lastRewoundChannelIndex >= 0) {
                          return i >= lastRewoundChannelIndex && completed;
                        }
                        return false;
                      }

                      return completed;
                    })()}
                    notCompletedBlink={(() => {
                      if (failedChannel) {
                        if (lastRewoundChannelIndex >= 0) {
                          return i === lastRewoundChannelIndex;
                        }
                        return i === failedChannelIndex;
                      }

                      if (completed) {
                        return false;
                      }

                      if (i === 0 && !completed) {
                        return true;
                      }

                      if (!history.txFulfilled) {
                        return false;
                      }

                      const firstNotCompletedIndex =
                        history.ibcHistory.findIndex((item) => !item.completed);

                      return i - 1 === firstNotCompletedIndex;
                    })()}
                    arrowDirection={(() => {
                      if (!failedChannel) {
                        return "right";
                      }

                      return i <= failedChannelIndex ? "left" : "hide";
                    })()}
                    error={error}
                    isLast={chainIds.length - 1 === i}
                  />
                );
              });
            })()}
          </XAxis>
        </Box>

        <VerticalCollapseTransition collapsed={!failedChannel}>
          <Gutter size="0.5rem" />
          <Caption1
            color={
              theme.mode === "light"
                ? ColorPalette["orange-400"]
                : ColorPalette["yellow-400"]
            }
          >
            <FormattedMessage
              id={(() => {
                let complete = false;
                if (failedChannelIndex >= 0) {
                  complete =
                    !history.ibcHistory
                      .slice(0, failedChannelIndex + 1)
                      .find((h) => !h.rewound) ||
                    history.ibcHistory.find(
                      (h) => h.rewoundButNextRewindingBlocked
                    ) != null;
                }

                if (isIBCSwap) {
                  if ("swapRefundInfo" in history && history.swapRefundInfo) {
                    return intl.formatMessage(
                      {
                        id: "page.main.components.ibc-history-view.ibc-swap.failed.after-swap.complete",
                      },
                      {
                        chain: chainStore.getChain(
                          history.swapRefundInfo.chainId
                        ).chainName,
                        assets: history.swapRefundInfo.amount
                          .map((amount) => {
                            return new CoinPretty(
                              chainStore
                                .getChain(history.swapRefundInfo!.chainId)
                                .forceFindCurrency(amount.denom),
                              amount.amount
                            )
                              .hideIBCMetadata(true)
                              .shrink(true)
                              .maxDecimals(6)
                              .inequalitySymbol(true)
                              .trim(true)
                              .toString();
                          })
                          .join(", "),
                      }
                    );
                  }

                  return complete
                    ? "page.main.components.ibc-history-view.ibc-swap.failed.complete"
                    : "page.main.components.ibc-history-view.ibc-swap.failed.in-progress";
                }

                return complete
                  ? "page.main.components.ibc-history-view.failed.complete"
                  : "page.main.components.ibc-history-view.failed.in-progress";
              })()}
            />
          </Caption1>
        </VerticalCollapseTransition>

        <VerticalCollapseTransition
          collapsed={(() => {
            if (historyCompleted) {
              return true;
            }

            if (failedChannelIndex >= 0) {
              if (
                !history.ibcHistory
                  .slice(0, failedChannelIndex + 1)
                  .some((h) => !h.rewound) ||
                history.ibcHistory
                  .slice(0, failedChannelIndex + 1)
                  .some((h) => h.rewoundButNextRewindingBlocked)
              ) {
                return true;
              }
            }

            return false;
          })()}
        >
          <Gutter size="1rem" />
          <Box
            height="1px"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-500"]
            }
          />
          <Gutter size="1rem" />

          <XAxis alignY="center">
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="page.main.components.ibc-history-view.estimated-duration" />
            </Subtitle3>
            <div
              style={{
                flex: 1,
              }}
            />
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-600"]
                  : ColorPalette["gray-10"]
              }
            >
              <FormattedMessage
                id="page.main.components.ibc-history-view.estimated-duration.value"
                values={{
                  minutes: Math.max(
                    (() => {
                      if (failedChannel) {
                        return (
                          history.ibcHistory.length -
                          failedChannelIndex -
                          history.ibcHistory.filter((h) => h.rewound).length -
                          1
                        );
                      }

                      return history.ibcHistory.filter((h) => !h.completed)
                        .length;
                    })(),
                    1
                  ),
                }}
              />
            </Body2>
          </XAxis>

          <Gutter size="1rem" />

          <Caption2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            <FormattedMessage
              id={
                isIBCSwap
                  ? "page.main.components.ibc-history-view.ibc-swap.help.can-close-extension"
                  : "page.main.components.ibc-history-view.help.can-close-extension"
              }
            />
          </Caption2>
        </VerticalCollapseTransition>
      </YAxis>
    </Box>
  );
});

const SkipHistoryViewItem: FunctionComponent<{
  history: SkipHistory;
  removeHistory: (id: string) => void;
}> = observer(({ history, removeHistory }) => {
  const { chainStore } = useStore();

  const theme = useTheme();
  const intl = useIntl();

  const historyCompleted = (() => {
    if (!history.trackDone) {
      return false;
    }

    if (history.trackError) {
      if (history.transferAssetRelease) {
        return history.transferAssetRelease.released;
      }

      return false;
    }

    return (
      history.trackStatus === "STATE_COMPLETED_SUCCESS" &&
      history.routeIndex === history.simpleRoute.length - 1
    );
  })();

  const failedRouteIndex = (() => {
    return history.trackError ? history.routeIndex : -1;
  })();

  const failedRoute = (() => {
    if (failedRouteIndex >= 0) {
      return history.simpleRoute[failedRouteIndex];
    }
  })();

  return (
    <Box
      padding="1.25rem"
      borderRadius="1.25rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      style={{
        boxShadow:
          theme.mode === "light"
            ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
            : "none",
      }}
    >
      <YAxis>
        <XAxis alignY="center">
          {(() => {
            if (failedRouteIndex >= 0) {
              return (
                <ErrorIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["orange-400"]
                      : ColorPalette["yellow-400"]
                  }
                />
              );
            }

            if (!historyCompleted) {
              return (
                <LoadingIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette.white
                  }
                />
              );
            }

            return (
              <CheckCircleIcon
                width="1.25rem"
                height="1.25rem"
                color={ColorPalette["green-400"]}
              />
            );
          })()}

          <Gutter size="0.5rem" />

          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-600"]
                : ColorPalette["gray-10"]
            }
          >
            {(() => {
              if (failedRouteIndex >= 0) {
                if (
                  (history.trackStatus === "STATE_COMPLETED_ERROR" &&
                    history.transferAssetRelease &&
                    history.transferAssetRelease.released) ||
                  history.swapRefundInfo
                ) {
                  return intl.formatMessage({
                    id: "page.main.components.ibc-history-view.ibc-swap.item.refund.succeed",
                  });
                }
                return intl.formatMessage({
                  id: "page.main.components.ibc-history-view.ibc-swap.item.refund.pending",
                });
              }

              if (history.isOnlyUseBridge) {
                return !historyCompleted
                  ? intl.formatMessage({
                      id: "page.main.components.ibc-history-view.send-bridge.item.pending",
                    })
                  : intl.formatMessage({
                      id: "page.main.components.ibc-history-view.send-bridge.item.succeed",
                    });
              }

              return !historyCompleted
                ? intl.formatMessage({
                    id: "page.main.components.ibc-history-view.ibc-swap.item.pending",
                  })
                : intl.formatMessage({
                    id: "page.main.components.ibc-history-view.ibc-swap.item.succeed",
                  });
            })()}
          </Subtitle4>
          <div
            style={{
              flex: 1,
            }}
          />
          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              removeHistory(history.id);
            }}
          >
            <XMarkIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
            />
          </Box>
        </XAxis>

        <Gutter size="1rem" />

        <Body2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-400"]
              : ColorPalette["gray-100"]
          }
        >
          {(() => {
            const sourceChain = chainStore.getChain(history.chainId);

            if (historyCompleted && failedRouteIndex < 0) {
              const destinationAssets = (() => {
                if (!history.resAmount[0]) {
                  return chainStore
                    .getChain(history.destinationAsset.chainId)
                    .forceFindCurrency(history.destinationAsset.denom)
                    .coinDenom;
                }

                return history.resAmount[0]
                  .map((amount) => {
                    return new CoinPretty(
                      chainStore
                        .getChain(history.destinationAsset.chainId)
                        .forceFindCurrency(amount.denom),
                      amount.amount
                    )
                      .hideIBCMetadata(true)
                      .shrink(true)
                      .maxDecimals(6)
                      .inequalitySymbol(true)
                      .trim(true)
                      .toString();
                  })
                  .join(", ");
              })();

              return intl.formatMessage(
                {
                  id: "page.main.components.ibc-history-view.ibc-swap.succeed.paragraph",
                },
                {
                  assets: destinationAssets,
                }
              );
            }

            // skip history의 amount에는 [sourceChain의 amount, destinationChain의 expected amount]가 들어있으므로
            // 첫 번째 amount만 사용
            const assets = (() => {
              const amount = history.amount[0];
              const currency = sourceChain.forceFindCurrency(amount.denom);
              const pretty = new CoinPretty(currency, amount.amount);
              return pretty
                .hideIBCMetadata(true)
                .shrink(true)
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .toString();
            })();

            const destinationDenom = (() => {
              const currency = chainStore
                .getChain(history.destinationAsset.chainId)
                .forceFindCurrency(history.destinationAsset.denom);

              if ("originCurrency" in currency && currency.originCurrency) {
                return currency.originCurrency.coinDenom;
              }

              return currency.coinDenom;
            })();

            if (history.isOnlyUseBridge) {
              const sourceChain = chainStore.getChain(history.chainId);
              const destinationChain = chainStore.getChain(
                history.destinationChainId
              );

              return intl.formatMessage(
                {
                  id: "page.main.components.ibc-history-view.send-bridge.paragraph",
                },
                {
                  assets,
                  sourceChain: sourceChain.chainName,
                  destinationChain: destinationChain.chainName,
                }
              );
            }

            return intl.formatMessage(
              {
                id: "page.main.components.ibc-history-view.ibc-swap.paragraph",
              },
              {
                assets,
                destinationDenom,
              }
            );
          })()}
        </Body2>

        <Gutter size="1rem" />

        <Box
          borderRadius="9999999px"
          padding="0.625rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-500"]
          }
        >
          <XAxis alignY="center">
            {(() => {
              const chainIds = history.simpleRoute.map((route) => {
                return route.chainId;
              });

              return chainIds.map((chainId, i) => {
                const chainInfo = chainStore.getChain(chainId);
                // Only mark as completed based on routeIndex, not trackDone
                const completed =
                  i < history.routeIndex ||
                  (i === history.routeIndex &&
                    !!history.trackDone &&
                    !history.trackError);
                const error = !!history.trackError && i >= failedRouteIndex;

                return (
                  // 일부분 순환하는 경우도 이론적으로 가능은 하기 때문에 chain id를 key로 사용하지 않음.
                  <IbcHistoryViewItemChainImage
                    key={i}
                    chainInfo={chainInfo}
                    completed={!error && completed}
                    notCompletedBlink={(() => {
                      if (failedRoute) {
                        return i === failedRouteIndex;
                      }

                      if (completed) {
                        return false;
                      }

                      if (i === 0 && !completed) {
                        return true;
                      }

                      return i === history.routeIndex;
                    })()}
                    arrowDirection={(() => {
                      if (!failedRoute) {
                        return "right";
                      }

                      return i === failedRouteIndex ? "left" : "hide";
                    })()}
                    error={error}
                    isLast={chainIds.length - 1 === i}
                  />
                );
              });
            })()}
          </XAxis>
        </Box>

        <VerticalCollapseTransition collapsed={!failedRoute}>
          <Gutter size="0.5rem" />
          <Caption1
            color={
              theme.mode === "light"
                ? ColorPalette["orange-400"]
                : ColorPalette["yellow-400"]
            }
          >
            <FormattedMessage
              id={(() => {
                const completedAnyways =
                  history.trackStatus?.includes("COMPLETED");
                const transferAssetRelease = history.transferAssetRelease;

                // status tracking이 오류로 끝난 경우
                if (
                  history.trackDone &&
                  history.trackError &&
                  transferAssetRelease &&
                  transferAssetRelease.released
                ) {
                  if (history.swapRefundInfo) {
                    if (chainStore.hasChain(history.swapRefundInfo.chainId)) {
                      const swapRefundChain = chainStore.getChain(
                        history.swapRefundInfo.chainId
                      );

                      return intl.formatMessage(
                        {
                          id: "page.main.components.ibc-history-view.skip-swap.failed.after-transfer.complete",
                        },
                        {
                          chain: swapRefundChain.chainName,
                          assets: history.swapRefundInfo.amount
                            .map((amount) => {
                              return new CoinPretty(
                                chainStore
                                  .getChain(history.swapRefundInfo!.chainId)
                                  .forceFindCurrency(amount.denom),
                                amount.amount
                              )
                                .hideIBCMetadata(true)
                                .shrink(true)
                                .maxDecimals(6)
                                .inequalitySymbol(true)
                                .trim(true)
                                .toString();
                            })
                            .join(", "),
                        }
                      );
                    }
                  }

                  const isOnlyEvm = parseInt(transferAssetRelease.chain_id) > 0;
                  const chainIdInKeplr = isOnlyEvm
                    ? `eip155:${transferAssetRelease.chain_id}`
                    : transferAssetRelease.chain_id;

                  if (chainStore.hasChain(chainIdInKeplr)) {
                    const releasedChain = chainStore.getChain(chainIdInKeplr);

                    const destinationDenom = (() => {
                      const currency = releasedChain.forceFindCurrency(
                        transferAssetRelease.denom
                      );

                      if (
                        "originCurrency" in currency &&
                        currency.originCurrency
                      ) {
                        return currency.originCurrency.coinDenom;
                      }

                      return currency.coinDenom;
                    })();

                    return intl.formatMessage(
                      {
                        id: "page.main.components.ibc-history-view.skip-swap.failed.after-transfer.complete",
                      },
                      {
                        chain: releasedChain.chainName,
                        assets: destinationDenom,
                      }
                    );
                  }
                }

                return completedAnyways
                  ? "page.main.components.ibc-history-view.ibc-swap.failed.complete"
                  : "page.main.components.ibc-history-view.ibc-swap.failed.in-progress";
              })()}
            />
          </Caption1>
        </VerticalCollapseTransition>

        <VerticalCollapseTransition collapsed={historyCompleted}>
          <Gutter size="1rem" />
          <Box
            height="1px"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-500"]
            }
          />
          <Gutter size="1rem" />

          <XAxis alignY="center">
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="page.main.components.ibc-history-view.estimated-duration" />
            </Subtitle3>
            <div
              style={{
                flex: 1,
              }}
            />
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-600"]
                  : ColorPalette["gray-10"]
              }
            >
              <FormattedMessage
                id="page.main.components.ibc-history-view.estimated-duration.value"
                values={{
                  minutes: (() => {
                    const minutes = Math.floor(
                      history.routeDurationSeconds / 60
                    );
                    const seconds = history.routeDurationSeconds % 60;

                    return minutes + Math.ceil(seconds / 60);
                  })(),
                }}
              />
            </Body2>
          </XAxis>

          <Gutter size="1rem" />

          <Caption2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            <FormattedMessage
              id={
                "page.main.components.ibc-history-view.ibc-swap.help.can-close-extension"
              }
            />
          </Caption2>
        </VerticalCollapseTransition>
      </YAxis>
    </Box>
  );
});

const SwapV2HistoryViewItem: FunctionComponent<{
  history: SwapV2History;
  removeHistory: (id: string, shouldHide: boolean) => void;
}> = observer(({ history, removeHistory }) => {
  const {
    chainStore,
    queriesStore,
    uiConfigStore,
    accountStore,
    ethereumAccountStore,
  } = useStore();

  console.log("history", history);

  const theme = useTheme();
  const intl = useIntl();
  const navigate = useNavigate();
  const notification = useNotification();

  const [txExecution, setTxExecution] = useState<TxExecution | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  console.log("txExecution", txExecution);

  useEffect(() => {
    const backgroundExecutionId = history.backgroundExecutionId;
    if (!backgroundExecutionId) {
      setTxExecution(undefined);
      return;
    }

    const requester = new InExtensionMessageRequester();
    requester
      .sendMessage(
        BACKGROUND_PORT,
        new GetTxExecutionMsg(backgroundExecutionId)
      )
      .then((execution) => {
        setTxExecution(execution);
      })
      .catch((e) => {
        console.error("Failed to get tx execution:", e);
        setTxExecution(undefined);
      });
  }, [history]);

  const historyCompleted = useMemo(() => {
    if (!history.trackDone) {
      return false;
    }

    // If there's a track error, check if assetLocationInfo exists (refund completed)
    if (history.trackError) {
      return !!history.assetLocationInfo;
    }

    // TODO: 임시 조치임
    if (history.assetLocationInfo?.type === "intermediate") {
      return false;
    }

    // SUCCESS 상태에서 assetLocationInfo가 없으면 destination에 도달한 것
    if (
      history.status === SwapV2TxStatus.SUCCESS &&
      !history.assetLocationInfo
    ) {
      return true;
    }

    // Success or partial success with last route completed
    // CHECK: partial success는 어떤 경우에 발생하는가
    return (
      (history.status === SwapV2TxStatus.SUCCESS ||
        history.status === SwapV2TxStatus.PARTIAL_SUCCESS) &&
      history.routeIndex === history.simpleRoute.length - 1
    );
  }, [history]);

  const failedRouteIndex = useMemo(() => {
    // Failed if status is FAILED or if there's a trackError
    if (history.status === SwapV2TxStatus.FAILED || history.trackError) {
      return history.routeIndex;
    }
    return -1;
  }, [history]);

  const failedRoute = useMemo(() => {
    if (failedRouteIndex >= 0) {
      return history.simpleRoute[failedRouteIndex];
    }
  }, [failedRouteIndex, history]);

  const hasExecutableTx = useMemo(() => {
    if (!txExecution || !history.backgroundExecutionId) {
      return false;
    }
    return txExecution.txs.some(
      (tx) =>
        (tx.status === BackgroundTxStatus.PENDING ||
          tx.status === BackgroundTxStatus.BLOCKED) &&
        txExecution.executableChainIds.includes(tx.chainId)
    );
  }, [txExecution, history.backgroundExecutionId]);

  const txExecutionProgress: {
    executedTxCount: number;
    totalTxCount: number;
  } = useMemo(() => {
    if (!txExecution || !history.backgroundExecutionId) {
      return {
        executedTxCount: 0,
        totalTxCount: 0,
      };
    }
    const executedTxCount = txExecution.txs.filter(
      (tx) => tx.status === BackgroundTxStatus.CONFIRMED
    ).length;
    const totalTxCount = txExecution.txs.length;
    return {
      executedTxCount,
      totalTxCount,
    };
  }, [txExecution, history.backgroundExecutionId]);

  const shouldHideOnRemove = useMemo(() => {
    if (!history.backgroundExecutionId || history.resAmount.length !== 0) {
      return false;
    }

    if (history.provider === SwapProvider.SKIP && history.assetLocationInfo) {
      return false;
    }

    return true;
  }, [history]);

  async function handleContinueSigning() {
    if (!history.backgroundExecutionId || !txExecution) {
      console.log("tx execution is not found");
      return;
    }

    const txIndex = txExecution.txs.findIndex(
      (tx) =>
        tx.status === BackgroundTxStatus.PENDING ||
        tx.status === BackgroundTxStatus.BLOCKED
    );
    if (txIndex < 0) {
      console.log("tx index is not found");
      return;
    }

    const tx = txExecution.txs[txIndex];
    if (!tx) {
      console.log("tx is not found");
      return;
    }

    const totalTxCount = txExecution.txs.length;
    const executedTxCount = txExecution.txs.filter(
      (tx) => tx.status === BackgroundTxStatus.CONFIRMED
    ).length;
    if (totalTxCount <= 0 || executedTxCount >= totalTxCount) {
      console.log("tx execution is completed");
      return;
    }

    setIsLoading(true);
    uiConfigStore.ibcSwapConfig.setSignatureProgress(
      totalTxCount,
      executedTxCount
    );

    try {
      // get tx execution
      switch (tx.type) {
        case BackgroundTxType.EVM: {
          const txData = tx.txData;

          const account = accountStore.getAccount(tx.chainId);
          const ethereumAccount = ethereumAccountStore.getAccount(tx.chainId);

          const ethereumQueries = queriesStore.get(tx.chainId).ethereum;

          // estimate gas
          const { gasUsed } = await ethereumAccount.simulateGas(
            account.ethereumHexAddress,
            txData
          );

          // get fee

          // build fee object

          break;
        }
        case BackgroundTxType.COSMOS: {
          const chainId = tx.chainId;
          const txData = tx.txData;
          const aminoMsgs = txData.aminoMsgs;
          if (aminoMsgs == undefined || aminoMsgs.length === 0) {
            throw new Error("aminoMsgs is not found or empty");
          }

          const account = accountStore.getAccount(chainId);

          const msg = aminoMsgs[0];
          let cosmosTx: MakeTxResponse;

          switch (msg.type) {
            case "cosmos-sdk/MsgTransfer": {
              const currency = chainStore
                .getChain(chainId)
                .forceFindCurrency(msg.value.token.denom);
              const normalizedAmount = new Dec(msg.value.token.amount)
                .quo(DecUtils.getPrecisionDec(currency.coinDecimals))
                .toString();

              console.log("msg", msg);

              cosmosTx = account.cosmos.makeIBCTransferTx(
                {
                  portId: msg.value.source_port,
                  channelId: msg.value.source_channel,
                  counterpartyChainId: "", // NOTE: counterpartyChainId is not included in the server response
                },
                normalizedAmount,
                currency,
                msg.value.receiver,
                msg.value.memo
              );
              cosmosTx.ui.overrideType("ibc-swap");
              break;
            }
            case "wasm/MsgExecuteContract": {
              cosmosTx = account.cosmwasm.makeExecuteContractTx(
                "unknown",
                msg.value.contract,
                msg.value.msg,
                msg.value.funds
              );
              cosmosTx.ui.overrideType("ibc-swap");
              break;
            }
            case "cctp/DepositForBurn": {
              cosmosTx = account.cosmos.makeCCTPDepositForBurnTx(
                msg.value.from,
                msg.value.amount,
                msg.value.destination_domain,
                msg.value.mint_recipient,
                msg.value.burn_token
              );
              break;
            }
            case "cctp/DepositForBurnWithCaller": {
              // DepositForBurnWithCaller and MsgSend should be together on skip
              // as squid don't charge cctp fee, this message won't appear frequently...
              if (aminoMsgs.length !== 2) {
                throw new Error(
                  "Invalid number of messages for DepositForBurnWithCaller"
                );
              }

              const sendMsg = aminoMsgs[1];
              if (sendMsg.type !== "cosmos-sdk/MsgSend") {
                throw new Error(
                  "Second message should be MsgSend for DepositForBurnWithCaller"
                );
              }

              const cctpMsgValue = {
                from: msg.value.from,
                amount: msg.value.amount,
                destination_domain: msg.value.destination_domain,
                mint_recipient: msg.value.mint_recipient,
                burn_token: msg.value.burn_token,
                destination_caller: msg.value.destination_caller,
              };

              const sendMsgValue = {
                from_address: sendMsg.value.from_address,
                to_address: sendMsg.value.to_address,
                amount: sendMsg.value.amount,
              };

              cosmosTx = account.cosmos.makeCCTPDepositForBurnWithCallerTx(
                JSON.stringify(cctpMsgValue),
                JSON.stringify(sendMsgValue)
              );
              break;
            }
            default:
              throw new Error("Unsupported message type");
          }

          const simulateResult = await cosmosTx.simulate({}, txData.memo);

          const pseudoFee = {
            amount: [
              {
                denom:
                  chainStore.getChain(chainId).currencies[0].coinMinimalDenom,
                amount: "1",
              },
            ],
            // TODO: margin 값 정해야함
            gas: Math.floor(simulateResult.gasUsed * 1.3).toString(),
          };

          const signResult = await cosmosTx.sign(pseudoFee, txData.memo, {
            preferNoSetFee: false,
            preferNoSetMemo: false,
            // CHECK: topup 처리?
          });

          // resume background tx execution
          const executeResult =
            await new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              new ResumeTxMsg(
                history.backgroundExecutionId,
                txIndex,
                Buffer.from(signResult.tx).toString("base64")
              )
            );
          if (executeResult.status === TxExecutionStatus.FAILED) {
            throw new Error(
              executeResult.error ?? "Transaction execution failed"
            );
          }

          notification.show(
            "success",
            intl.formatMessage({ id: "notification.transaction-success" }),
            ""
          );

          uiConfigStore.ibcSwapConfig.incrementCompletedSignature();

          break;
        }
        default: {
          throw new Error("Invalid tx type");
        }
      }
    } catch (error) {
      console.error("Failed to continue signing:", error);
      notification.show(
        "failed",
        intl.formatMessage({ id: "error.transaction-failed" }),
        ""
      );
    } finally {
      // navigate to home
      // CHECK: 실패했을 때 홈으로 안가고 이상한데로 감
      navigate("/");
      setIsLoading(false);
      uiConfigStore.ibcSwapConfig.resetSignatureProgress();
    }
  }

  if (history.hidden) {
    return null;
  }

  return (
    <Box
      padding="1.25rem"
      borderRadius="1.25rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      style={{
        boxShadow:
          theme.mode === "light"
            ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
            : "none",
      }}
    >
      <YAxis>
        <XAxis alignY="center">
          {(() => {
            if (failedRouteIndex >= 0) {
              return (
                <ErrorIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["orange-400"]
                      : ColorPalette["yellow-400"]
                  }
                />
              );
            }

            if (hasExecutableTx) {
              return (
                <InformationIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={ColorPalette["gray-200"]}
                />
              );
            }

            if (!historyCompleted) {
              return (
                <LoadingIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette.white
                  }
                />
              );
            }

            return (
              <CheckCircleIcon
                width="1.25rem"
                height="1.25rem"
                color={ColorPalette["green-400"]}
              />
            );
          })()}

          <Gutter size="0.5rem" />

          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-600"]
                : ColorPalette["gray-10"]
            }
          >
            {(() => {
              if (failedRouteIndex >= 0) {
                if (
                  history.status === SwapV2TxStatus.FAILED &&
                  history.assetLocationInfo
                ) {
                  return intl.formatMessage({
                    id: "page.main.components.ibc-history-view.ibc-swap.item.refund.succeed",
                  });
                }
                return intl.formatMessage({
                  id: "page.main.components.ibc-history-view.ibc-swap.item.refund.pending",
                });
              }

              if (history.isOnlyUseBridge) {
                return !historyCompleted
                  ? intl.formatMessage({
                      id: "page.main.components.ibc-history-view.send-bridge.item.pending",
                    })
                  : intl.formatMessage({
                      id: "page.main.components.ibc-history-view.send-bridge.item.succeed",
                    });
              }

              if (hasExecutableTx) {
                return intl.formatMessage({
                  id: "page.main.components.ibc-history-view.ibc-swap.item.action-required",
                });
              }

              return !historyCompleted
                ? intl.formatMessage({
                    id: "page.main.components.ibc-history-view.ibc-swap.item.pending",
                  })
                : intl.formatMessage({
                    id: "page.main.components.ibc-history-view.ibc-swap.item.succeed",
                  });
            })()}
          </Subtitle4>
          <div
            style={{
              flex: 1,
            }}
          />
          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();
              removeHistory(history.id, shouldHideOnRemove);
            }}
          >
            <XMarkIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
            />
          </Box>
        </XAxis>

        <Gutter size="1rem" />

        <Body2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-400"]
              : ColorPalette["gray-100"]
          }
        >
          {(() => {
            const sourceChain = chainStore.getChain(history.fromChainId);

            if (historyCompleted && failedRouteIndex < 0) {
              const destinationAssets = (() => {
                if (!history.resAmount[0]) {
                  return chainStore
                    .getChain(history.destinationAsset.chainId)
                    .forceFindCurrency(history.destinationAsset.denom)
                    .coinDenom;
                }

                return history.resAmount[0]
                  .map((amount) => {
                    return new CoinPretty(
                      chainStore
                        .getChain(history.destinationAsset.chainId)
                        .forceFindCurrency(amount.denom),
                      amount.amount
                    )
                      .hideIBCMetadata(true)
                      .shrink(true)
                      .maxDecimals(6)
                      .inequalitySymbol(true)
                      .trim(true)
                      .toString();
                  })
                  .join(", ");
              })();

              return intl.formatMessage(
                {
                  id: "page.main.components.ibc-history-view.ibc-swap.succeed.paragraph",
                },
                {
                  assets: destinationAssets,
                }
              );
            }

            // swap v2 history의 amount에는 [sourceChain의 amount, destinationChain의 expected amount]가 들어있으므로
            // 첫 번째 amount만 사용
            const assets = (() => {
              const amount = history.amount[0];
              const currency = sourceChain.forceFindCurrency(amount.denom);
              const pretty = new CoinPretty(currency, amount.amount);
              return pretty
                .hideIBCMetadata(true)
                .shrink(true)
                .maxDecimals(6)
                .inequalitySymbol(true)
                .trim(true)
                .toString();
            })();

            const destinationDenom = (() => {
              const currency = chainStore
                .getChain(history.destinationAsset.chainId)
                .forceFindCurrency(history.destinationAsset.denom);

              if ("originCurrency" in currency && currency.originCurrency) {
                return currency.originCurrency.coinDenom;
              }

              return currency.coinDenom;
            })();

            if (history.isOnlyUseBridge) {
              const sourceChain = chainStore.getChain(history.fromChainId);
              const destinationChain = chainStore.getChain(history.toChainId);

              return intl.formatMessage(
                {
                  id: "page.main.components.ibc-history-view.send-bridge.paragraph",
                },
                {
                  assets,
                  sourceChain: sourceChain.chainName,
                  destinationChain: destinationChain.chainName,
                }
              );
            }

            return intl.formatMessage(
              {
                id: "page.main.components.ibc-history-view.ibc-swap.paragraph",
              },
              {
                assets,
                destinationDenom,
              }
            );
          })()}
        </Body2>

        <Gutter size="1rem" />

        <Box
          borderRadius="9999999px"
          padding="0.625rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-500"]
          }
        >
          <XAxis alignY="center">
            {(() => {
              const chainIds = history.simpleRoute.map((route) => {
                return route.chainId;
              });

              // assetLocationInfo가 있으면 해당 체인까지는 asset이 릴리즈된 것이므로 성공으로 처리
              const assetReleasedRouteIndex = (() => {
                if (history.assetLocationInfo) {
                  const idx = chainIds.findIndex(
                    (chainId) => chainId === history.assetLocationInfo!.chainId
                  );
                  if (idx >= 0) {
                    return idx;
                  }
                }
                return -1;
              })();

              return chainIds.map((chainId, i) => {
                const chainInfo = chainStore.getChain(chainId);
                // Asset이 릴리즈된 체인까지는 성공으로 처리
                const completed =
                  i < history.routeIndex ||
                  (i === history.routeIndex &&
                    !!history.trackDone &&
                    !history.trackError) ||
                  (assetReleasedRouteIndex >= 0 &&
                    i <= assetReleasedRouteIndex);

                // 에러는 assetReleasedRouteIndex보다 큰 인덱스에서만 표시
                const error =
                  !!history.trackError &&
                  i >= failedRouteIndex &&
                  (assetReleasedRouteIndex < 0 || i > assetReleasedRouteIndex);

                // 환불된 체인인지 확인 (에러가 있고, assetLocationInfo가 있고, 해당 체인이 환불 목적지인 경우)
                const refunded =
                  !!history.trackError &&
                  assetReleasedRouteIndex >= 0 &&
                  history.assetLocationInfo?.type === "refund" &&
                  i === assetReleasedRouteIndex;

                return (
                  // 일부분 순환하는 경우도 이론적으로 가능은 하기 때문에 chain id를 key로 사용하지 않음.
                  <IbcHistoryViewItemChainImage
                    key={i}
                    chainInfo={chainInfo}
                    completed={!error && !refunded && completed}
                    notCompletedBlink={(() => {
                      if (failedRoute) {
                        // asset이 릴리즈된 체인까지는 blink하지 않음
                        if (
                          assetReleasedRouteIndex >= 0 &&
                          i <= assetReleasedRouteIndex
                        ) {
                          return false;
                        }
                        return i === failedRouteIndex;
                      }

                      if (completed) {
                        return false;
                      }

                      if (i === 0 && !completed) {
                        return true;
                      }

                      return i === history.routeIndex;
                    })()}
                    arrowDirection={(() => {
                      if (!failedRoute) {
                        return "right";
                      }

                      // asset이 릴리즈된 체인이 있으면
                      if (assetReleasedRouteIndex >= 0) {
                        // 환불이 진행중인 라우트보다 뒤로 돌아간 경우
                        if (assetReleasedRouteIndex < history.routeIndex) {
                          // 환불 체인 ~ 실패 체인 사이는 왼쪽 화살표 (환불 경로 표시)
                          if (
                            i >= assetReleasedRouteIndex &&
                            i < history.routeIndex
                          ) {
                            return "left";
                          }
                          // 실패 체인 이후는 숨김
                          if (i >= history.routeIndex) {
                            return "hide";
                          }
                        } else {
                          // 환불된 체인 이후의 화살표는 숨김
                          if (i >= assetReleasedRouteIndex) {
                            return "hide";
                          }
                        }
                        return "right";
                      }

                      return i === failedRouteIndex ? "left" : "right";
                    })()}
                    arrowWarning={(() => {
                      // 환불 시 왼쪽 화살표에 경고 색상 적용 (에러가 있을 때만)
                      if (
                        !!history.trackError &&
                        assetReleasedRouteIndex >= 0 &&
                        assetReleasedRouteIndex < history.routeIndex &&
                        i >= assetReleasedRouteIndex &&
                        i < history.routeIndex
                      ) {
                        return true;
                      }
                      return false;
                    })()}
                    error={error}
                    refunded={refunded}
                    isLast={chainIds.length - 1 === i}
                  />
                );
              });
            })()}
          </XAxis>
        </Box>

        <VerticalCollapseTransition collapsed={!failedRoute}>
          <Gutter size="0.5rem" />
          <Caption1
            color={
              theme.mode === "light"
                ? ColorPalette["orange-400"]
                : ColorPalette["yellow-400"]
            }
          >
            <FormattedMessage
              id={(() => {
                const completedAnyways =
                  history.status === SwapV2TxStatus.SUCCESS ||
                  history.status === SwapV2TxStatus.PARTIAL_SUCCESS;

                // status tracking이 오류로 끝난 경우
                // SwapV2에서는 assetLocationInfo를 사용하여 환불 정보 표시
                if (
                  history.trackDone &&
                  (history.trackError ||
                    history.status === SwapV2TxStatus.FAILED)
                ) {
                  if (history.assetLocationInfo) {
                    if (
                      chainStore.hasChain(history.assetLocationInfo.chainId)
                    ) {
                      const assetLocationChain = chainStore.getChain(
                        history.assetLocationInfo.chainId
                      );

                      return intl.formatMessage(
                        {
                          id: "page.main.components.ibc-history-view.skip-swap.failed.after-transfer.complete",
                        },
                        {
                          chain: assetLocationChain.chainName,
                          assets: history.assetLocationInfo.amount
                            .map((amount) => {
                              return new CoinPretty(
                                chainStore
                                  .getChain(history.assetLocationInfo!.chainId)
                                  .forceFindCurrency(amount.denom),
                                amount.amount
                              )
                                .hideIBCMetadata(true)
                                .shrink(true)
                                .maxDecimals(6)
                                .inequalitySymbol(true)
                                .trim(true)
                                .toString();
                            })
                            .join(", "),
                        }
                      );
                    }
                  }
                }

                return completedAnyways
                  ? "page.main.components.ibc-history-view.ibc-swap.failed.complete"
                  : "page.main.components.ibc-history-view.ibc-swap.failed.in-progress";
              })()}
            />
          </Caption1>
        </VerticalCollapseTransition>
        <VerticalCollapseTransition collapsed={historyCompleted}>
          <Gutter size="1rem" />
          <Box
            height="1px"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-500"]
            }
          />
          {/* only show estimated duration when there is no executable tx */}
          {!hasExecutableTx && (
            <React.Fragment>
              <Gutter size="1rem" />

              <XAxis alignY="center">
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"]
                  }
                >
                  <FormattedMessage id="page.main.components.ibc-history-view.estimated-duration" />
                </Subtitle3>
                <div
                  style={{
                    flex: 1,
                  }}
                />
                <Body2
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-600"]
                      : ColorPalette["gray-10"]
                  }
                >
                  <FormattedMessage
                    id="page.main.components.ibc-history-view.estimated-duration.value"
                    values={{
                      minutes: (() => {
                        const minutes = Math.floor(
                          history.routeDurationSeconds / 60
                        );
                        const seconds = history.routeDurationSeconds % 60;

                        return minutes + Math.ceil(seconds / 60);
                      })(),
                    }}
                  />
                </Body2>
              </XAxis>
            </React.Fragment>
          )}
          {/* only show close message when there is no tx execution */}
          {!txExecution && (
            <React.Fragment>
              <Gutter size="1rem" />
              <Caption2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
              >
                <FormattedMessage
                  id={
                    "page.main.components.ibc-history-view.ibc-swap.help.can-close-extension"
                  }
                />
              </Caption2>
            </React.Fragment>
          )}
          {/* only show continue transaction button when there is tx execution */}
          {txExecution && (
            <React.Fragment>
              <Gutter size="1rem" />
              <XAxis alignY="center">
                <StepIndicator
                  totalCount={txExecutionProgress.totalTxCount}
                  completedCount={txExecutionProgress.executedTxCount}
                  blinkCurrentStep={hasExecutableTx}
                />
                <Gutter size="0.375rem" />
                <Subtitle4
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"]
                  }
                >
                  <FormattedMessage
                    id="page.main.components.ibc-history-view.swap-v2.approvals"
                    values={{
                      executed: txExecutionProgress.executedTxCount,
                      total: txExecutionProgress.totalTxCount,
                    }}
                  />
                </Subtitle4>
                <div style={{ flex: 1 }} />
                {hasExecutableTx ? (
                  <Button
                    text={intl.formatMessage({
                      id: "page.main.components.ibc-history-view.swap-v2.continue-signing",
                    })}
                    size="small"
                    color="secondary"
                    mode="ghost"
                    buttonStyle={{
                      color:
                        theme.mode === "light"
                          ? ColorPalette["gray-600"]
                          : ColorPalette["gray-50"],
                    }}
                    isLoading={isLoading}
                    right={
                      isLoading ? null : (
                        <ChevronRightIcon width="1rem" height="1rem" />
                      )
                    }
                    onClick={handleContinueSigning}
                  />
                ) : (
                  <Subtitle4
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-200"]
                    }
                  >
                    {"⏳ "}
                    <FormattedMessage id="page.main.components.ibc-history-view.swap-v2.wait-for-confirmation" />
                  </Subtitle4>
                )}
              </XAxis>
            </React.Fragment>
          )}
        </VerticalCollapseTransition>
      </YAxis>
    </Box>
  );
});

const ChainImageFallbackAnimated = animated(ChainImageFallback);

const IbcHistoryViewItemChainImage: FunctionComponent<{
  chainInfo: IChainInfoImpl;

  completed: boolean;
  notCompletedBlink: boolean;
  isLast: boolean;

  // 원래 fail에 대해서 처리 안하다가 나중에 추가되면서
  // prop이 괴상해졌다...
  // TODO: 나중에 시간나면 다시 정리한다
  error: boolean;
  refunded?: boolean;
  arrowDirection: "left" | "right" | "hide";
  arrowWarning?: boolean;
}> = ({
  chainInfo,
  completed,
  notCompletedBlink,
  isLast,
  error,
  refunded,
  arrowDirection,
  arrowWarning,
}) => {
  const theme = useTheme();

  const opacity = useSpringValue(
    (() => {
      if (error || refunded) {
        return 0.3;
      }
      return completed ? 1 : 0.3;
    })(),
    {
      config: defaultSpringConfig,
    }
  );

  useEffect(() => {
    if (error || refunded) {
      opacity.start(0.3);
    } else if (completed) {
      opacity.start(1);
    } else if (notCompletedBlink) {
      opacity.start({
        loop: {
          reverse: true,
        },
        from: 0.3,
        to: 0.6,
        config: {
          easing: easings.easeOutSine,
          duration: 600,
        },
      });
    } else {
      opacity.start(0.3);
    }
  }, [completed, error, refunded, notCompletedBlink, opacity]);

  return (
    <XAxis alignY="center">
      <Box position="relative">
        <ChainImageFallbackAnimated
          chainInfo={chainInfo}
          size="2rem"
          style={{
            opacity,
          }}
        />
        {error || refunded ? (
          <Box
            position="absolute"
            style={{
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            alignX="center"
            alignY="center"
          >
            <ErrorIcon
              width="1.25rem"
              height="1.25rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["orange-400"]
                  : ColorPalette["yellow-400"]
              }
            />
          </Box>
        ) : null}
      </Box>
      {!isLast ? (
        <React.Fragment>
          <Gutter size="0.25rem" />
          <Box
            style={{
              opacity: arrowWarning ? 1 : completed ? 1 : 0.3,
              ...(() => {
                if (arrowDirection === "left") {
                  return {
                    transform: "rotate(180deg)",
                  };
                } else if (arrowDirection === "hide") {
                  return {
                    opacity: 0,
                  };
                }
              })(),
            }}
          >
            <ArrowRightIcon
              width="0.75rem"
              height="0.75rem"
              color={
                arrowWarning
                  ? theme.mode === "light"
                    ? ColorPalette["orange-400"]
                    : ColorPalette["yellow-400"]
                  : theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-10"]
              }
            />
          </Box>
          <Gutter size="0.25rem" />
        </React.Fragment>
      ) : null}
    </XAxis>
  );
};

const ArrowRightIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 12 12"
    >
      <path
        fill="none"
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.198"
        d="M6.75 2.25L10.5 6m0 0L6.75 9.75M10.5 6h-9"
      />
    </svg>
  );
};

const ErrorIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      stroke="none"
      viewBox="0 0 20 20"
    >
      <path
        fill={color || "currentColor"}
        fillRule="evenodd"
        d="M1.875 10a8.125 8.125 0 1116.25 0 8.125 8.125 0 01-16.25 0zM10 6.875c.345 0 .625.28.625.625v3.125a.625.625 0 11-1.25 0V7.5c0-.345.28-.625.625-.625zm0 6.875a.625.625 0 100-1.25.625.625 0 000 1.25z"
        clipRule="evenodd"
      />
    </svg>
  );
};
