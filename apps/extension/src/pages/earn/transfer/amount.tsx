import React, {
  Fragment,
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { Stack } from "../../../components/stack";

import { useSearchParams } from "react-router-dom";

import { useStore } from "../../../stores";
import {
  EmptyAmountError,
  useGasSimulator,
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { useNavigate } from "react-router";
import { Body2, MobileH3, Subtitle3 } from "../../../components/typography";
import { Box } from "../../../components/box";
import { Gutter } from "../../../components/gutter";
import { useNotification } from "../../../hooks/notification";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import {
  GetIBCHistoriesMsg,
  LogAnalyticsEventMsg,
  RemoveIBCHistoryMsg,
  SendTxAndRecordMsg,
} from "@keplr-wallet/background";
import { useIntl } from "react-intl";
import { useIBCChannelConfigQueryString } from "../../../hooks/use-ibc-channel-config-query-string";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { amountToAmbiguousAverage } from "../../../utils";
import { WalletStatus } from "@keplr-wallet/stores";
import { ColorPalette } from "../../../styles";
import { Input } from "../components/input";
import { NOBLE_CHAIN_ID } from "../../../config.ui";
import { DenomHelper, ExtensionKVStore } from "@keplr-wallet/common";
import { XAxis, YAxis } from "../../../components/axis";
import { LongArrowDownIcon } from "../../../components/icon/long-arrow-down";
import { useTheme } from "styled-components";
import { IBCCurrency } from "@keplr-wallet/types";
import {
  useAutoFeeCurrencySelectionOnInit,
  useFeeOptionSelectionOnInit,
} from "../../../components/input/fee-control";
import { HorizontalCollapseTransition } from "../../../components/transition/horizontal-collapse";

export const EarnTransferAmountPage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const {
    accountStore,
    chainStore,
    queriesStore,
    skipQueriesStore,
    priceStore,
    uiConfigStore,
  } = useStore();
  const addressRef = useRef<HTMLInputElement | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const intl = useIntl();

  const initialChainId = searchParams.get("chainId");
  const initialCoinMinimalDenom = searchParams.get("coinMinimalDenom");
  const initialIBCTransferDestinationChainId = searchParams.get(
    "ibcTransferDestinationChainId"
  );
  if (!initialChainId || !initialCoinMinimalDenom) {
    throw new Error("Invalid params");
  }

  const chainId = initialChainId;
  const ibcTransferDestinationChainId =
    initialIBCTransferDestinationChainId ?? NOBLE_CHAIN_ID;
  const chainInfo = chainStore.getChain(chainId);
  const ibcTransferDestinationChainInfo = chainStore.getChain(
    ibcTransferDestinationChainId
  );

  const currency = chainInfo.forceFindCurrency(initialCoinMinimalDenom);
  const account = accountStore.getAccount(chainId);

  const queryBalances = queriesStore.get(chainId).queryBalances;
  const sender = account.bech32Address;
  const balance =
    queryBalances.getQueryBech32Address(sender).getBalance(currency)?.balance ??
    new CoinPretty(currency, new Dec("0"));

  useEffect(() => {
    if (addressRef.current) {
      addressRef.current.focus();
    }
  }, []);

  const sendConfigs = useSendMixedIBCTransferConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    300000,
    true
  );
  sendConfigs.amountConfig.setCurrency(currency);

  useGasSimulator(
    // 어차피 일반 send랑 똑같으니 send 페이지랑 똑같이 쓴다.
    new ExtensionKVStore("gas-simulator.main.send"),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    "cosmos/native",
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      if (
        sendConfigs.channelConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.channelConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.amountConfig.uiProperties.error != null ||
        sendConfigs.recipientConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.recipientConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );
      // I don't know why, but simulation does not work for secret20
      if (denomHelper.type === "secret20") {
        throw new Error("Simulating secret wasm not supported");
      }

      return account.cosmos.makePacketForwardIBCTransferTx(
        accountStore,
        sendConfigs.channelConfig.channels,
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        sendConfigs.amountConfig.amount[0].currency,
        sendConfigs.recipientConfig.recipient
      );
    }
  );

  useIBCChannelConfigQueryString(sendConfigs.channelConfig);

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
  });

  const [ibcChannelFluent, setIBCChannelFluent] = useState<
    | {
        destinationChainId: string;
        originDenom: string;
        originChainId: string;

        channels: {
          portId: string;
          channelId: string;

          counterpartyChainId: string;
        }[];
      }
    | undefined
  >(undefined);

  const initialIBCTransferChannels =
    skipQueriesStore.queryIBCPacketForwardingTransfer.getIBCChannels(
      chainId,
      currency.coinMinimalDenom
    );

  useEffect(() => {
    if (initialIBCTransferChannels && initialIBCTransferDestinationChainId) {
      (async () => {
        const channel = initialIBCTransferChannels.find(
          (channel) =>
            channel.destinationChainId === initialIBCTransferDestinationChainId
        );

        if (channel && channel.channels.length > 0) {
          const lastChainId =
            channel.channels[channel.channels.length - 1].counterpartyChainId;

          const account = accountStore.getAccount(lastChainId);

          if (account.walletStatus === WalletStatus.NotInit) {
            await account.init();
          }

          sendConfigs.channelConfig.setChannels(channel.channels);
          setIBCChannelFluent(channel);
          if (account.walletStatus === WalletStatus.Loaded) {
            sendConfigs.recipientConfig.setValue(account.bech32Address);
          }
        }
      })();
    }
  }, [
    accountStore,
    initialIBCTransferChannels,
    initialIBCTransferDestinationChainId,
    sendConfigs.channelConfig,
    sendConfigs.recipientConfig,
  ]);

  // Prefetch IBC channels to reduce the UI flickering(?) when open ibc channel modal.
  try {
    skipQueriesStore.queryIBCPacketForwardingTransfer.getIBCChannels(
      chainId,
      currency.coinMinimalDenom
    );
  } catch (e) {
    console.log(e);
  }

  const error = useMemo(() => {
    const uiProperties = sendConfigs.amountConfig.uiProperties;

    const err =
      uiProperties.error ||
      uiProperties.warning ||
      sendConfigs.feeConfig.uiProperties.error ||
      sendConfigs.feeConfig.uiProperties.warning;

    if (err instanceof EmptyAmountError) {
      return;
    }

    if (err instanceof ZeroAmountError) {
      return;
    }

    if (err) {
      return err.message || err.toString();
    }
  }, [
    sendConfigs.amountConfig.uiProperties,
    sendConfigs.feeConfig.uiProperties,
  ]);

  useFeeOptionSelectionOnInit(uiConfigStore, sendConfigs.feeConfig, false);

  useAutoFeeCurrencySelectionOnInit(
    chainStore,
    queriesStore,
    sendConfigs.senderConfig,
    sendConfigs.feeConfig,
    false
  );

  const isSubmissionBlocked =
    sendConfigs.amountConfig.amount[0].toDec().equals(new Dec("0")) ||
    !!error ||
    txConfigsValidate.interactionBlocked;

  return (
    <HeaderLayout
      title={""} // No title for this page
      displayFlex={true}
      fixedMinHeight={true}
      left={<BackButton />}
      animatedBottomButtons={true}
      hideBottomButtons={isSubmissionBlocked}
      bottomButtons={[
        {
          disabled: isSubmissionBlocked,
          text: intl.formatMessage({ id: "button.next" }),
          color: "primary",
          size: "large",
          type: "submit",
          isLoading:
            accountStore.getAccount(chainId).isSendingMsg === "ibcTransfer",
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        if (!isSubmissionBlocked) {
          try {
            const tx = accountStore
              .getAccount(chainId)
              .cosmos.makePacketForwardIBCTransferTx(
                accountStore,
                sendConfigs.channelConfig.channels,
                sendConfigs.amountConfig.amount[0].toDec().toString(),
                sendConfigs.amountConfig.amount[0].currency,
                sendConfigs.recipientConfig.recipient
              );

            await tx.send(
              sendConfigs.feeConfig.toStdFee(),
              sendConfigs.memoConfig.memo,
              {
                preferNoSetMemo: true,
                preferNoSetFee: sendConfigs.amountConfig.fraction === 1,

                sendTx: async (chainId, tx, mode) => {
                  let msg: Message<Uint8Array> = new SendTxAndRecordMsg(
                    "noble/transfer/earn",
                    chainId,
                    sendConfigs.recipientConfig.chainId,
                    tx,
                    mode,
                    false,
                    sendConfigs.senderConfig.sender,
                    sendConfigs.recipientConfig.recipient,
                    sendConfigs.amountConfig.amount.map((amount) => {
                      return {
                        amount: DecUtils.getTenExponentN(
                          amount.currency.coinDecimals
                        )
                          .mul(amount.toDec())
                          .toString(),
                        denom: amount.currency.coinMinimalDenom,
                      };
                    }),
                    sendConfigs.memoConfig.memo
                  );
                  if (msg instanceof SendTxAndRecordMsg) {
                    msg = msg.withIBCPacketForwarding(
                      sendConfigs.channelConfig.channels,
                      {
                        currencies: chainStore.getChain(chainId).currencies,
                      }
                    );
                  } else {
                    throw new Error("Invalid message type");
                  }

                  return await new InExtensionMessageRequester().sendMessage(
                    BACKGROUND_PORT,
                    msg
                  );
                },
              },
              {
                onBroadcasted: async () => {
                  chainStore.enableVaultsWithCosmosAddress(
                    sendConfigs.recipientConfig.chainId,
                    sendConfigs.recipientConfig.recipient
                  );
                  if (ibcChannelFluent != null) {
                    const pathChainIds = [chainId].concat(
                      ...ibcChannelFluent.channels.map(
                        (channel) => channel.counterpartyChainId
                      )
                    );
                    const intermediateChainIds: string[] = [];
                    if (pathChainIds.length > 2) {
                      intermediateChainIds.push(...pathChainIds.slice(1, -1));
                    }

                    const inCurrencyPrice = await priceStore.waitCalculatePrice(
                      sendConfigs.amountConfig.amount[0],
                      "usd"
                    );

                    // TODO: analytics를 noble earn 전용으로 수정해야할 것 같음.
                    const params: Record<
                      string,
                      | number
                      | string
                      | boolean
                      | number[]
                      | string[]
                      | undefined
                    > = {
                      originDenom: ibcChannelFluent.originDenom,
                      originCommonDenom: (() => {
                        const currency = chainStore
                          .getChain(ibcChannelFluent.originChainId)
                          .forceFindCurrency(ibcChannelFluent.originDenom);
                        if ("paths" in currency && currency.originCurrency) {
                          return currency.originCurrency.coinDenom;
                        }
                        return currency.coinDenom;
                      })(),
                      originChainId: ibcChannelFluent.originChainId,
                      originChainIdentifier: ChainIdHelper.parse(
                        ibcChannelFluent.originChainId
                      ).identifier,
                      sourceChainId: chainId,
                      sourceChainIdentifier:
                        ChainIdHelper.parse(chainId).identifier,
                      destinationChainId: ibcChannelFluent.destinationChainId,
                      destinationChainIdentifier: ChainIdHelper.parse(
                        ibcChannelFluent.destinationChainId
                      ).identifier,
                      pathChainIds,
                      pathChainIdentifiers: pathChainIds.map(
                        (chainId) => ChainIdHelper.parse(chainId).identifier
                      ),
                      intermediateChainIds,
                      intermediateChainIdentifiers: intermediateChainIds.map(
                        (chainId) => ChainIdHelper.parse(chainId).identifier
                      ),
                      isToOrigin:
                        ibcChannelFluent.destinationChainId ===
                        ibcChannelFluent.originChainId,
                      inAvg: amountToAmbiguousAverage(
                        sendConfigs.amountConfig.amount[0]
                      ),
                    };
                    if (inCurrencyPrice) {
                      params["inFiatAvg"] =
                        amountToAmbiguousAverage(inCurrencyPrice);
                    }
                    new InExtensionMessageRequester().sendMessage(
                      BACKGROUND_PORT,
                      new LogAnalyticsEventMsg("ibc_send", params)
                    );
                  }
                },
                onFulfill: (tx: any) => {
                  if (tx.code != null && tx.code !== 0) {
                    console.log(tx.log ?? tx.raw_log);

                    if (initialIBCTransferDestinationChainId) {
                      navigate("/tx-result/failed");
                    } else {
                      notification.show(
                        "failed",
                        intl.formatMessage({
                          id: "error.transaction-failed",
                        }),
                        ""
                      );
                    }
                    return;
                  }

                  if (initialIBCTransferDestinationChainId) {
                    (async () => {
                      while (
                        // tx pending 페이지에서만 처리되어야하는데 문제는 이미 tx pending page로 넘어갔기 때문에
                        // 이 페이지에서 unmount 등을 파악할 수가 없다...
                        // 그렇다고 tx pending page의 로직에서 처리하면 로직이 복잡해져서 그냥 여기서 url을 보고 파악한다.
                        window.location.hash.startsWith("#/tx-result/pending")
                      ) {
                        await new Promise((resolve) =>
                          setTimeout(resolve, 1000)
                        );

                        const requester = new InExtensionMessageRequester();
                        const msg = new GetIBCHistoriesMsg();
                        const res = await requester.sendMessage(
                          BACKGROUND_PORT,
                          msg
                        );
                        if (res.length === 0) {
                          // 이 경우 먼가 잘못된건데 방법이 없다...
                          navigate("/", {
                            replace: true,
                          });
                          break;
                        }

                        // 어차피 이 tx pending page를 벗어나지 않았을 것으로 가정해야하기 때문에
                        // 그냥 최근의 기록이 방금 보낸 tx라고 가정한다.
                        const recent = res[0];
                        if (recent.ibcHistory.some((h) => h.error != null)) {
                          // 이 경우 ibc가 실패한 것이다...
                          navigate("/tx-result/failed");
                          break;
                        }
                        if (
                          recent.txFulfilled &&
                          !recent.ibcHistory.some((h) => !h.completed)
                        ) {
                          // 이 경우 ibc가 완료된 것이다...
                          // 이미 여기서 ibc 성공까지 기다렸기 때문에 메인에서 보이는 history는 자동으로 삭제해준다...
                          const msg = new RemoveIBCHistoryMsg(recent.id);
                          await requester.sendMessage(BACKGROUND_PORT, msg);

                          const destinationAccount = accountStore.getAccount(
                            ibcTransferDestinationChainId
                          );
                          if (
                            destinationAccount.walletStatus ===
                            WalletStatus.NotInit
                          ) {
                            await destinationAccount.init();
                          }
                          const balances = queriesStore
                            .get(ibcTransferDestinationChainId)
                            .queryBalances.getQueryBech32Address(
                              destinationAccount.bech32Address
                            ).balances;
                          if (balances.length > 0) {
                            // native 토큰에 대해서 refresh를 해야하는데
                            // 어차피 cosmos-sdk의 balance 쿼리는 묶어서 이뤄지기 때문에
                            // 하나만 refresh를 하면 된다.
                            // 거의 무조건 첫번째 currency는 native 토큰이기 때문에 첫번째 currency에 대해서만 refresh를 한다.
                            balances[0].waitFreshResponse();
                          }

                          navigate(
                            "/tx-result/success?isFromEarnTransfer=true"
                          );
                          break;
                        }
                      }
                    })();
                  } else {
                    notification.show(
                      "success",
                      intl.formatMessage({
                        id: "notification.transaction-success",
                      }),
                      ""
                    );
                  }
                },
              }
            );

            if (initialIBCTransferDestinationChainId) {
              navigate("/tx-result/pending?isFromEarnTransfer=true");
            } else {
              navigate("/", {
                replace: true,
              });
            }
          } catch (e) {
            if (e?.message === "Request rejected") {
              return;
            }

            console.log(e);
            notification.show(
              "failed",
              intl.formatMessage({ id: "error.transaction-failed" }),
              ""
            );

            if (initialIBCTransferDestinationChainId) {
              navigate("/tx-result/failed");
            } else {
              navigate("/", {
                replace: true,
              });
            }
          }
        }
      }}
    >
      <Box
        paddingTop="2rem"
        paddingX="1.5rem"
        style={{
          flex: 1,
        }}
      >
        <Stack flex={1}>
          <MobileH3
            color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}
          >
            {intl.formatMessage(
              { id: "page.earn.transfer.amount.title" },
              {
                br: <br />,
              }
            )}
          </MobileH3>

          <Gutter size="2rem" />
          <Input
            type="text"
            placeholder={balance.trim(true).hideIBCMetadata(true).toString()}
            value={sendConfigs.amountConfig.value}
            warning={error != null}
            onChange={(e) => {
              sendConfigs.amountConfig.setValue(e.target.value);
            }}
            autoComplete="off"
            suffix={(currency as IBCCurrency)?.originCurrency?.coinDenom ?? ""}
          />
          <Gutter size="0.75rem" />
          <Box padding="0.25rem 0">
            <XAxis alignY="center">
              <HorizontalCollapseTransition collapsed={!isSubmissionBlocked}>
                <XAxis alignY="center">
                  <Box
                    padding="0.25rem 0.375rem"
                    backgroundColor={
                      isLightMode
                        ? ColorPalette.white
                        : ColorPalette["gray-550"]
                    }
                    borderRadius="0.5rem"
                    width="fit-content"
                    cursor="pointer"
                    onClick={() => {
                      sendConfigs.amountConfig.setFraction(1);
                    }}
                  >
                    <Subtitle3
                      color={
                        isLightMode
                          ? ColorPalette["gray-400"]
                          : ColorPalette["gray-200"]
                      }
                      style={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      {balance.trim(true).hideIBCMetadata(true).toString()}
                    </Subtitle3>
                  </Box>

                  <Gutter size="0.25rem" />
                </XAxis>
              </HorizontalCollapseTransition>
              <Subtitle3 color={ColorPalette["gray-300"]}>
                {`on ${chainInfo.chainName}`}
              </Subtitle3>
            </XAxis>
          </Box>

          {error && (
            <Box marginTop="0.75rem">
              <Body2 color={ColorPalette["red-300"]}>{error}</Body2>
            </Box>
          )}

          {sendConfigs.amountConfig.amount[0].toDec().gt(new Dec("0")) && (
            <Fragment>
              <YAxis alignX="center">
                <LongArrowDownIcon
                  width="1.5rem"
                  height="1.5rem"
                  color={
                    isLightMode
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-400"]
                  }
                />
              </YAxis>
              <Gutter size="1rem" />

              <Box paddingLeft="0.25rem">
                <MobileH3>
                  {sendConfigs.amountConfig.amount[0]
                    .trim(true)
                    .hideIBCMetadata(true)
                    .toString()}
                </MobileH3>
              </Box>
              <Gutter size="0.5rem" />
              <Subtitle3 color={ColorPalette["gray-300"]}>
                {`on ${ibcTransferDestinationChainInfo.chainName}`}
              </Subtitle3>
            </Fragment>
          )}
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
