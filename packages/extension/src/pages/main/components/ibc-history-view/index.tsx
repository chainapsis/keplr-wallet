import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  GetIBCHistoriesMsg,
  IBCHistory,
  RemoveIBCHistoryMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useLayoutEffectOnce } from "../../../../hooks/use-effect-once";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
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
  LoadingIcon,
  XMarkIcon,
} from "../../../../components/icon";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { IChainInfoImpl } from "@keplr-wallet/stores";
import { ChainImageFallback } from "../../../../components/image";
import { IconProps } from "../../../../components/icon/types";
import { useSpringValue, animated, easings } from "@react-spring/web";
import { defaultSpringConfig } from "../../../../styles/spring";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { FormattedMessage, useIntl } from "react-intl";

export const IbcHistoryView: FunctionComponent<{
  isNotReady: boolean;
}> = observer(({ isNotReady }) => {
  const { queriesStore, accountStore } = useStore();

  const [histories, setHistories] = useState<IBCHistory[]>([]);
  useLayoutEffectOnce(() => {
    let count = 0;
    const alreadyCompletedHistoryMap = new Map<string, boolean>();

    const fn = () => {
      const requester = new InExtensionMessageRequester();
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

  const filteredHistories = histories.filter((history) => {
    const account = accountStore.getAccount(history.chainId);
    if (account.bech32Address === history.sender) {
      return true;
    }
    return false;
  });

  if (isNotReady) {
    return null;
  }

  return (
    <Stack gutter="0.75rem">
      {filteredHistories.reverse().map((history) => {
        return (
          <IbcHistoryViewItem
            key={history.id}
            history={history}
            removeHistory={(id) => {
              const requester = new InExtensionMessageRequester();
              const msg = new RemoveIBCHistoryMsg(id);
              requester.sendMessage(BACKGROUND_PORT, msg).then((histories) => {
                setHistories(histories);
              });
            }}
          />
        );
      })}
      {filteredHistories.length > 0 ? <Gutter size="0.75rem" /> : null}
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
      borderRadius="0.375rem"
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
            if (history.ibcHistory.find((h) => h.error != null)) {
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
            {!historyCompleted
              ? intl.formatMessage({
                  id: isIBCSwap
                    ? "page.main.components.ibc-history-view.ibc-swap.item.pending"
                    : "page.main.components.ibc-history-view.item.pending",
                })
              : intl.formatMessage({
                  id: isIBCSwap
                    ? "page.main.components.ibc-history-view.ibc-swap.item.succeed"
                    : "page.main.components.ibc-history-view.item.succeed",
                })}
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
              if (historyCompleted) {
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
                const errorIndex = history.ibcHistory.findIndex(
                  (h) => h.error != null
                );
                if (errorIndex >= 0) {
                  complete = !history.ibcHistory
                    .slice(0, errorIndex + 1)
                    .find((h) => !h.rewound);
                }

                if (isIBCSwap) {
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
  arrowDirection: "left" | "right" | "hide";
}> = ({
  chainInfo,
  completed,
  notCompletedBlink,
  isLast,
  error,
  arrowDirection,
}) => {
  const theme = useTheme();

  const opacity = useSpringValue(
    (() => {
      if (error) {
        return 0.3;
      }
      return completed ? 1 : 0.3;
    })(),
    {
      config: defaultSpringConfig,
    }
  );

  useEffect(() => {
    if (error) {
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
  }, [completed, error, notCompletedBlink, opacity]);

  return (
    <XAxis alignY="center">
      <Box position="relative">
        <ChainImageFallbackAnimated
          style={{
            width: "2rem",
            height: "2rem",
            opacity,
          }}
          src={chainInfo.chainSymbolImageUrl}
          alt="chain image"
        />
        {error ? (
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
              opacity: completed ? 1 : 0.3,
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
                theme.mode === "light"
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
