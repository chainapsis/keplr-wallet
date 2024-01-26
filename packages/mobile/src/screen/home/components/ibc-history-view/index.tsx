import React, {FunctionComponent, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../stores';
import {
  GetIBCHistoriesMsg,
  IBCHistory,
  RemoveIBCHistoryMsg,
} from '@keplr-wallet/background';
import {BACKGROUND_PORT} from '@keplr-wallet/router';
import {useLayoutEffectOnce} from '../../../../hooks';
import {RNMessageRequesterInternal} from '../../../../router';
import {Stack} from '../../../../components/stack';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {XAxis, YAxis} from '../../../../components/axis';
import {IconProps} from '../../../../components/icon/types';
import {Path, Svg} from 'react-native-svg';
import {SVGLoadingIcon} from '../../../../components/spinner';
import {Gutter} from '../../../../components/gutter';
import {Animated, Text} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {RectButton} from '../../../../components/rect-button';
import {CoinPretty} from '@keplr-wallet/unit';
import {VerticalCollapseTransition} from '../../../../components/transition';
import {IChainInfoImpl} from '@keplr-wallet/stores';
import {ChainImageFallback} from '../../../../components/image';
import {ArrowRightSolidIcon} from '../../../../components/icon/arrow-right-solid';
import {withSpring} from 'react-native-reanimated';

export const IbcHistoryView: FunctionComponent<{
  isNotReady: boolean;
}> = observer(({isNotReady}) => {
  const {queriesStore, accountStore} = useStore();

  const [histories, setHistories] = useState<IBCHistory[]>([]);

  useLayoutEffectOnce(() => {
    let count = 0;
    const alreadyCompletedHistoryMap = new Map<string, boolean>();

    const fn = () => {
      const requester = new RNMessageRequesterInternal();
      const msg = new GetIBCHistoriesMsg();
      requester.sendMessage(BACKGROUND_PORT, msg).then(newHistories => {
        setHistories(histories => {
          if (JSON.stringify(histories) !== JSON.stringify(newHistories)) {
            count++;

            // Currently there is no elegant way to automatically refresh when an ibc transfer is complete.
            // For now, deal with it here
            const newCompletes = newHistories.filter(history => {
              if (alreadyCompletedHistoryMap.get(history.id)) {
                return false;
              }
              return !!(
                history.txFulfilled &&
                !history.ibcHistory.some(h => !h.completed)
              );
            });
            if (count > 1) {
              // There is no need to refresh balance if first time.
              for (const newComplete of newCompletes) {
                // If IBC transfer
                if ('recipient' in newComplete) {
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
                        .bech32Address,
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

  const filteredHistories = histories.filter(history => {
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
    <Stack gutter={12}>
      {filteredHistories.reverse().map(history => {
        return (
          <IbcHistoryViewItem
            key={history.id}
            history={history}
            removeHistory={id => {
              const requester = new RNMessageRequesterInternal();
              const msg = new RemoveIBCHistoryMsg(id);
              requester.sendMessage(BACKGROUND_PORT, msg).then(histories => {
                setHistories(histories);
              });
            }}
          />
        );
      })}
    </Stack>
  );
});

const IbcHistoryViewItem: FunctionComponent<{
  history: IBCHistory;
  removeHistory: (id: string) => void;
}> = observer(({history, removeHistory}) => {
  const intl = useIntl();
  const style = useStyle();
  const {chainStore} = useStore();

  const isIBCSwap = 'swapType' in history;

  const historyCompleted = (() => {
    if (!history.txFulfilled) {
      return false;
    }

    if (history.ibcHistory.some(h => h.error != null)) {
      return false;
    }

    return !history.ibcHistory.some(ibcHistory => {
      return !ibcHistory.completed;
    });
  })();
  const failedChannelIndex = (() => {
    return history.ibcHistory.findIndex(h => h.error != null);
  })();
  const failedChannel = (() => {
    if (failedChannelIndex >= 0) {
      return history.ibcHistory[failedChannelIndex];
    }
  })();
  const lastRewoundChannelIndex = (() => {
    return history.ibcHistory.findIndex(h => h.rewound);
  })();

  return (
    <Box
      padding={20}
      borderRadius={6}
      backgroundColor={style.get('color-gray-600').color}>
      <YAxis>
        <XAxis alignY="center">
          {(() => {
            if (failedChannelIndex >= 0) {
              return (
                <ErrorIcon
                  size={20}
                  color={style.get('color-yellow-400').color}
                />
              );
            }

            if (!historyCompleted) {
              return (
                <SVGLoadingIcon
                  size={20}
                  color={style.get('color-white').color}
                />
              );
            }

            return (
              <CheckCircleIcon
                size={20}
                color={style.get('color-green-400').color}
              />
            );
          })()}

          <Gutter size={8} />

          <Text
            style={style.flatten(['subtitle4', 'color-text-high', 'flex-1'])}>
            {(() => {
              if (failedChannelIndex >= 0) {
                if (
                  !history.ibcHistory
                    .slice(0, failedChannelIndex + 1)
                    .some(h => !h.rewound) ||
                  history.ibcHistory
                    .slice(0, failedChannelIndex + 1)
                    .some(h => h.rewoundButNextRewindingBlocked)
                ) {
                  return intl.formatMessage({
                    id: 'page.main.components.ibc-history-view.ibc-swap.item.refund.succeed',
                  });
                }
                return intl.formatMessage({
                  id: 'page.main.components.ibc-history-view.ibc-swap.item.refund.pending',
                });
              }

              return !historyCompleted
                ? intl.formatMessage({
                    id: isIBCSwap
                      ? 'page.main.components.ibc-history-view.ibc-swap.item.pending'
                      : 'page.main.components.ibc-history-view.item.pending',
                  })
                : intl.formatMessage({
                    id: isIBCSwap
                      ? 'page.main.components.ibc-history-view.ibc-swap.item.succeed'
                      : 'page.main.components.ibc-history-view.item.succeed',
                  });
            })()}
          </Text>

          <RectButton
            onPress={() => {
              removeHistory(history.id);
            }}>
            <XMarkIcon size={24} color={style.get('color-gray-300').color} />
          </RectButton>
        </XAxis>

        <Gutter size={16} />

        <Text style={style.flatten(['body2', 'color-text-middle'])}>
          {(() => {
            const sourceChain = chainStore.getChain(history.chainId);
            const destinationChain = chainStore.getChain(
              history.destinationChainId,
            );

            if ('swapType' in history) {
              if (historyCompleted && failedChannelIndex < 0) {
                const chainId = history.destinationChainId;
                const chainInfo = chainStore.getChain(chainId);
                const assets = (() => {
                  if (
                    history.resAmount.length !==
                    history.ibcHistory.length + 1
                  ) {
                    return 'Unknown';
                  }

                  return history.resAmount[history.ibcHistory.length]
                    .map(amount => {
                      return new CoinPretty(
                        chainInfo.forceFindCurrency(amount.denom),
                        amount.amount,
                      )
                        .hideIBCMetadata(true)
                        .shrink(true)
                        .maxDecimals(6)
                        .inequalitySymbol(true)
                        .trim(true)
                        .toString();
                    })
                    .join(', ');
                })();

                return intl.formatMessage(
                  {
                    id: 'page.main.components.ibc-history-view.ibc-swap.succeed.paragraph',
                  },
                  {
                    assets,
                  },
                );
              }

              const assets = history.amount
                .map(amount => {
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
                .join(', ');

              return intl.formatMessage(
                {
                  id: 'page.main.components.ibc-history-view.ibc-swap.paragraph',
                },
                {
                  assets,
                  destinationDenom: (() => {
                    const currency = chainStore
                      .getChain(history.destinationAsset.chainId)
                      .forceFindCurrency(history.destinationAsset.denom);

                    if (
                      'originCurrency' in currency &&
                      currency.originCurrency
                    ) {
                      return currency.originCurrency.coinDenom;
                    }

                    return currency.coinDenom;
                  })(),
                },
              );
            }

            const assets = history.amount
              .map(amount => {
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
              .join(', ');

            return intl.formatMessage(
              {
                id: 'page.main.components.ibc-history-view.paragraph',
              },
              {
                assets,
                sourceChain: sourceChain.chainName,
                destinationChain: destinationChain.chainName,
              },
            );
          })()}
        </Text>

        <Gutter size={16} />

        <Box
          borderRadius={999}
          padding={10}
          backgroundColor={style.get('color-gray-500').color}>
          <XAxis alignY="center">
            {(() => {
              const chainIds = [
                history.chainId,
                ...history.ibcHistory.map(item => item.counterpartyChainId),
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
                        history.ibcHistory.findIndex(item => !item.completed);

                      return i - 1 === firstNotCompletedIndex;
                    })()}
                    arrowDirection={(() => {
                      if (!failedChannel) {
                        return 'right';
                      }

                      return i <= failedChannelIndex ? 'left' : 'hide';
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
          <Text style={style.flatten(['text-caption2', 'color-text-low'])}>
            <FormattedMessage
              id={(() => {
                let complete = false;
                if (failedChannelIndex >= 0) {
                  complete =
                    !history.ibcHistory
                      .slice(0, failedChannelIndex + 1)
                      .find(h => !h.rewound) ||
                    history.ibcHistory.find(
                      h => h.rewoundButNextRewindingBlocked,
                    ) != null;
                }

                if (isIBCSwap) {
                  if ('swapRefundInfo' in history && history.swapRefundInfo) {
                    return intl.formatMessage(
                      {
                        id: 'page.main.components.ibc-history-view.ibc-swap.failed.after-swap.complete',
                      },
                      {
                        chain: chainStore.getChain(
                          history.swapRefundInfo.chainId,
                        ).chainName,
                        assets: history.swapRefundInfo.amount
                          .map(amount => {
                            return new CoinPretty(
                              chainStore
                                .getChain(history.swapRefundInfo!.chainId)
                                .forceFindCurrency(amount.denom),
                              amount.amount,
                            )
                              .hideIBCMetadata(true)
                              .shrink(true)
                              .maxDecimals(6)
                              .inequalitySymbol(true)
                              .trim(true)
                              .toString();
                          })
                          .join(', '),
                      },
                    );
                  }

                  return complete
                    ? 'page.main.components.ibc-history-view.ibc-swap.failed.complete'
                    : 'page.main.components.ibc-history-view.ibc-swap.failed.in-progress';
                }

                return complete
                  ? 'page.main.components.ibc-history-view.failed.complete'
                  : 'page.main.components.ibc-history-view.failed.in-progress';
              })()}
            />
          </Text>
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
                  .some(h => !h.rewound) ||
                history.ibcHistory
                  .slice(0, failedChannelIndex + 1)
                  .some(h => h.rewoundButNextRewindingBlocked)
              ) {
                return true;
              }
            }

            return false;
          })()}>
          <Box height={1} backgroundColor={style.get('color-gray-500').color} />

          <Gutter size={16} />

          <XAxis alignY="center">
            <Text
              style={style.flatten([
                'subtitle3',
                'color-text-middle',
                'flex-1',
              ])}>
              <FormattedMessage id="page.main.components.ibc-history-view.estimated-duration" />
            </Text>

            <Text style={style.flatten(['body2', 'color-text-high'])}>
              <FormattedMessage
                id="page.main.components.ibc-history-view.estimated-duration.value"
                values={{
                  minutes: Math.max(
                    (() => {
                      if (failedChannel) {
                        return (
                          history.ibcHistory.length -
                          failedChannelIndex -
                          history.ibcHistory.filter(h => h.rewound).length -
                          1
                        );
                      }

                      return history.ibcHistory.filter(h => !h.completed)
                        .length;
                    })(),
                    1,
                  ),
                }}
              />
            </Text>
          </XAxis>

          <Gutter size={16} />

          <Text style={style.flatten(['text-caption2', 'color-text-low'])}>
            <FormattedMessage
              id={
                isIBCSwap
                  ? 'page.main.components.ibc-history-view.ibc-swap.help.can-close-extension'
                  : 'page.main.components.ibc-history-view.help.can-close-extension'
              }
            />
          </Text>
        </VerticalCollapseTransition>
      </YAxis>
    </Box>
  );
});

const ChainImageFallbackAnimated =
  Animated.createAnimatedComponent(ChainImageFallback);

const IbcHistoryViewItemChainImage: FunctionComponent<{
  chainInfo: IChainInfoImpl;

  completed: boolean;
  notCompletedBlink: boolean;
  isLast: boolean;

  // 원래 fail에 대해서 처리 안하다가 나중에 추가되면서
  // prop이 괴상해졌다...
  // TODO: 나중에 시간나면 다시 정리한다
  error: boolean;
  arrowDirection: 'left' | 'right' | 'hide';
}> = ({
  chainInfo,
  completed,
  notCompletedBlink,
  isLast,
  error,
  arrowDirection,
}) => {
  const style = useStyle();

  // const opacity = withSpring(
  //   (() => {
  //     if (error) {
  //       return 0.3;
  //     }
  //     return completed ? 1 : 0.3;
  //   })(),
  //   {
  //     mass: 0.8,
  //     damping: 26,
  //     stiffness: 210,
  //   },
  // );

  const opacity = Animated.spring(
    new Animated.Value(error ? 0.3 : completed ? 1 : 0.3),
    {
      friction: 1,
      toValue: 0,
      tension: 20,
      useNativeDriver: true,
    },
  );

  return (
    <XAxis alignY="center">
      <ChainImageFallbackAnimated
        src={chainInfo.chainSymbolImageUrl}
        alt={chainInfo.chainName}
        style={{width: 32, height: 32}}
      />

      {error ? (
        <Box position="absolute" style={style.flatten(['absolute-fill'])}>
          <ErrorIcon size={32} color={style.get('color-yellow-400').color} />
        </Box>
      ) : null}

      {!isLast ? (
        <React.Fragment>
          <Gutter size={4} />

          <Box
            style={{
              opacity: completed ? 1 : 0.3,
              ...(() => {
                if (arrowDirection === 'left') {
                  return {
                    transform: 'rotate(180deg)',
                  };
                } else if (arrowDirection === 'hide') {
                  return {
                    opacity: 0,
                  };
                }
              })(),
            }}>
            <ArrowRightSolidIcon
              size={12}
              color={style.get('color-gray-10').color}
            />
          </Box>

          <Gutter size={4} />
        </React.Fragment>
      ) : null}
    </XAxis>
  );
};
const ErrorIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.875 10C1.875 5.51269 5.51269 1.875 10 1.875C14.4873 1.875 18.125 5.51269 18.125 10C18.125 14.4873 14.4873 18.125 10 18.125C5.51269 18.125 1.875 14.4873 1.875 10ZM10 6.875C10.3452 6.875 10.625 7.15482 10.625 7.5V10.625C10.625 10.9702 10.3452 11.25 10 11.25C9.65482 11.25 9.375 10.9702 9.375 10.625V7.5C9.375 7.15482 9.65482 6.875 10 6.875ZM10 13.75C10.3452 13.75 10.625 13.4702 10.625 13.125C10.625 12.7798 10.3452 12.5 10 12.5C9.65482 12.5 9.375 12.7798 9.375 13.125C9.375 13.4702 9.65482 13.75 10 13.75Z"
        fill={color}
      />
    </Svg>
  );
};

const CheckCircleIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M8.83366 13.8333L14.7087 7.95829L13.542 6.79163L8.83366 11.5L6.45866 9.12496L5.29199 10.2916L8.83366 13.8333ZM10.0003 18.3333C8.84755 18.3333 7.76421 18.1144 6.75033 17.6766C5.73644 17.2388 4.85449 16.6452 4.10449 15.8958C3.35449 15.1458 2.76088 14.2638 2.32366 13.25C1.88644 12.2361 1.66755 11.1527 1.66699 9.99996C1.66699 8.84718 1.88588 7.76385 2.32366 6.74996C2.76144 5.73607 3.35505 4.85413 4.10449 4.10413C4.85449 3.35413 5.73644 2.76051 6.75033 2.32329C7.76421 1.88607 8.84755 1.66718 10.0003 1.66663C11.1531 1.66663 12.2364 1.88551 13.2503 2.32329C14.2642 2.76107 15.1462 3.35468 15.8962 4.10413C16.6462 4.85413 17.24 5.73607 17.6778 6.74996C18.1156 7.76385 18.3342 8.84718 18.3337 9.99996C18.3337 11.1527 18.1148 12.2361 17.677 13.25C17.2392 14.2638 16.6456 15.1458 15.8962 15.8958C15.1462 16.6458 14.2642 17.2397 13.2503 17.6775C12.2364 18.1152 11.1531 18.3338 10.0003 18.3333Z"
        fill={color}
      />
    </Svg>
  );
};

const XMarkIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 25" fill="none">
      <Path
        d="M7.5364 7.02935C7.18492 6.67788 6.61508 6.67788 6.2636 7.02935C5.91213 7.38082 5.91213 7.95067 6.2636 8.30214L10.7272 12.7657L6.2636 17.2294C5.91213 17.5808 5.91213 18.1507 6.2636 18.5021C6.61508 18.8536 7.18492 18.8536 7.5364 18.5021L12 14.0385L16.4636 18.5021C16.8151 18.8536 17.3849 18.8536 17.7364 18.5021C18.0879 18.1507 18.0879 17.5808 17.7364 17.2294L13.2728 12.7657L17.7364 8.30214C18.0879 7.95067 18.0879 7.38082 17.7364 7.02935C17.3849 6.67788 16.8151 6.67788 16.4636 7.02935L12 11.493L7.5364 7.02935Z"
        fill={color}
      />
    </Svg>
  );
};
