import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  GetIBCTransferHistories,
  IBCTransferHistory,
  RemoveIBCTransferHistory,
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

  const [histories, setHistories] = useState<IBCTransferHistory[]>([]);
  useLayoutEffectOnce(() => {
    let count = 0;
    const alreadyCompletedHistoryMap = new Map<string, boolean>();

    const fn = () => {
      const requester = new InExtensionMessageRequester();
      const msg = new GetIBCTransferHistories();
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
                queriesStore
                  .get(newComplete.destinationChainId)
                  .queryBalances.getQueryBech32Address(newComplete.recipient)
                  .fetch();
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
              const msg = new RemoveIBCTransferHistory(id);
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
  history: IBCTransferHistory;
  removeHistory: (id: string) => void;
}> = observer(({ history, removeHistory }) => {
  const { chainStore } = useStore();

  const theme = useTheme();
  const intl = useIntl();

  const historyCompleted = (() => {
    if (!history.txFulfilled) {
      return false;
    }

    return !history.ibcHistory.some((ibcHistory) => {
      return !ibcHistory.completed;
    });
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
          {!historyCompleted ? (
            <LoadingIcon
              width="1.25rem"
              height="1.25rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette.white
              }
            />
          ) : (
            <CheckCircleIcon
              width="1.25rem"
              height="1.25rem"
              color={ColorPalette["green-400"]}
            />
          )}

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
                  id: "page.main.components.ibc-history-view.item.pending",
                })
              : intl.formatMessage({
                  id: "page.main.components.ibc-history-view.item.succeed",
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

                return (
                  // 일부분 순환하는 경우도 이론적으로 가능은 하기 때문에 chain id를 key로 사용하지 않음.
                  <IbcHistoryViewItemChainImage
                    key={i}
                    chainInfo={chainInfo}
                    completed={completed}
                    notCompletedBlink={(() => {
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
                    isLast={chainIds.length - 1 === i}
                  />
                );
              });
            })()}
          </XAxis>
        </Box>

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
                    history.ibcHistory.filter((h) => !h.completed).length,
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
            <FormattedMessage id="page.main.components.ibc-history-view.help.can-close-extension" />
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
}> = ({ chainInfo, completed, notCompletedBlink, isLast }) => {
  const theme = useTheme();

  const opacity = useSpringValue(completed ? 1 : 0.3, {
    config: defaultSpringConfig,
  });

  useEffect(() => {
    if (completed) {
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
  }, [completed, notCompletedBlink, opacity]);

  return (
    <XAxis alignY="center">
      <ChainImageFallbackAnimated
        style={{
          width: "2rem",
          height: "2rem",
          opacity,
        }}
        src={chainInfo.chainSymbolImageUrl}
        alt="chain image"
      />
      {!isLast ? (
        <React.Fragment>
          <Gutter size="0.25rem" />
          <Box
            style={{
              opacity: completed ? 1 : 0.3,
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

export const ArrowRightIcon: FunctionComponent<IconProps> = ({
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
