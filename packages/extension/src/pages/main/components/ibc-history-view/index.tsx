import React, { FunctionComponent, useState } from "react";
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
import { XMarkIcon } from "../../../../components/icon";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { IChainInfoImpl } from "@keplr-wallet/stores";
import { ChainImageFallback } from "../../../../components/image";

export const IbcHistoryView: FunctionComponent<{
  isNotReady: boolean;
}> = observer(({ isNotReady }) => {
  const [histories, setHistories] = useState<IBCTransferHistory[]>([]);
  useLayoutEffectOnce(() => {
    const fn = () => {
      const requester = new InExtensionMessageRequester();
      const msg = new GetIBCTransferHistories();
      requester.sendMessage(BACKGROUND_PORT, msg).then((histories) => {
        setHistories(histories);
      });
    };

    fn();
    const interval = setInterval(fn, 3000);

    return () => {
      clearInterval(interval);
    };
  });

  if (isNotReady) {
    return null;
  }

  return (
    <Stack gutter="0.75rem">
      {histories.reverse().map((history) => {
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
      {histories.length > 0 ? <Gutter size="0.75rem" /> : null}
    </Stack>
  );
});

const IbcHistoryViewItem: FunctionComponent<{
  history: IBCTransferHistory;
  removeHistory: (id: string) => void;
}> = observer(({ history, removeHistory }) => {
  const { chainStore } = useStore();

  const theme = useTheme();

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
    >
      <YAxis>
        <XAxis alignY="center">
          {
            // TODO: Add icon here.
          }
          <Subtitle4
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-10"]
            }
          >
            IBC Transfer in Progress
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
              ? ColorPalette["gray-500"]
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

            return `Transfer ${assets} from ${sourceChain.chainName} to ${destinationChain.chainName}`;
          })()}
        </Body2>

        <Gutter size="1rem" />

        <Box
          borderRadius="9999999px"
          padding="0.625rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["blue-50"]
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
                    isLast={chainIds.length - 1 === i}
                  />
                );
              });
            })()}
          </XAxis>
        </Box>

        {!historyCompleted ? (
          <React.Fragment>
            <Gutter size="1rem" />
            <Box
              height="1px"
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["gray-50"]
                  : ColorPalette["gray-500"]
              }
            />
            <Gutter size="1rem" />

            <XAxis alignY="center">
              <Subtitle3>Estimated Duration</Subtitle3>
              <div
                style={{
                  flex: 1,
                }}
              />
              <Body2>
                ~{history.ibcHistory.filter((h) => !h.completed).length} min
              </Body2>
            </XAxis>

            <Gutter size="1rem" />

            <Caption2>
              You may close the extension while the transfer is in progress.
            </Caption2>
          </React.Fragment>
        ) : null}
      </YAxis>
    </Box>
  );
});

const IbcHistoryViewItemChainImage: FunctionComponent<{
  chainInfo: IChainInfoImpl;

  completed: boolean;
  isLast: boolean;
}> = ({ chainInfo, completed, isLast }) => {
  return (
    <XAxis alignY="center">
      <ChainImageFallback
        style={{
          width: "2rem",
          height: "2rem",
          opacity: completed ? 1 : 0.33333,
        }}
        src={chainInfo.chainSymbolImageUrl}
        alt="chain image"
      />
      {!isLast ? <Gutter size="0.25rem" /> : null}
    </XAxis>
  );
};
