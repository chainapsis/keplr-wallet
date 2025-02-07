import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { Stack } from "../../../components/stack";

import { useSearchParams } from "react-router-dom";

import { useStore } from "../../../stores";
import {
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks";
import { useNavigate } from "react-router";
import { AmountInput } from "../../../components/input";
import { TokenItem } from "../../main/components";
import { Subtitle3 } from "../../../components/typography";
import { Box } from "../../../components/box";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { useNotification } from "../../../hooks/notification";
import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import {
  LogAnalyticsEventMsg,
  SendTxAndRecordMsg,
} from "@keplr-wallet/background";
import { FormattedMessage, useIntl } from "react-intl";
import { useIBCChannelConfigQueryString } from "../../../hooks/use-ibc-channel-config-query-string";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { amountToAmbiguousAverage } from "../../../utils";
import { WalletStatus } from "@keplr-wallet/stores";

export const SimpleIBCTransferPage: FunctionComponent = observer(() => {
  const {
    accountStore,
    chainStore,
    queriesStore,
    skipQueriesStore,
    priceStore,
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

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const chainInfo = chainStore.getChain(chainId);

  const coinMinimalDenom =
    initialCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

  useEffect(() => {
    if (addressRef.current) {
      addressRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigate(
        `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
          "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
        )}`
      );
    }
  }, [navigate, initialChainId, initialCoinMinimalDenom]);

  const account = accountStore.getAccount(chainId);

  const queryBalances = queriesStore.get(chainId).queryBalances;
  const sender = account.bech32Address;
  const balance = queryBalances
    .getQueryBech32Address(sender)
    .getBalance(currency);

  const sendConfigs = useSendMixedIBCTransferConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    300000,
    true
  );
  sendConfigs.amountConfig.setCurrency(currency);

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
      coinMinimalDenom
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

  return (
    <HeaderLayout
      title={""} // No title for this page
      displayFlex={true}
      fixedMinHeight={true}
      left={<BackButton />}
      bottomButtons={[
        {
          disabled: txConfigsValidate.interactionBlocked,
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

        if (!txConfigsValidate.interactionBlocked) {
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
                preferNoSetFee: true,
                preferNoSetMemo: true,
                sendTx: async (chainId, tx, mode) => {
                  let msg: Message<Uint8Array> = new SendTxAndRecordMsg(
                    "basic-send/ibc",
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
                    navigate("/tx-result/success");
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
              navigate("/tx-result/pending");
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
        paddingX="0.75rem"
        style={{
          flex: 1,
        }}
      >
        <Stack gutter="0.75rem" flex={1}>
          <YAxis>
            <Subtitle3>
              <FormattedMessage id="page.send.amount.asset-title" />
            </Subtitle3>
            <Gutter size="0.375rem" />
            <TokenItem
              viewToken={{
                token: balance?.balance ?? new CoinPretty(currency, "0"),
                chainInfo: chainStore.getChain(chainId),
                isFetching: balance?.isFetching ?? false,
                error: balance?.error,
              }}
              forChange
              onClick={() => {
                navigate(
                  `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
                    "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
                  )}`
                );
              }}
            />
          </YAxis>

          <Gutter size="0" />

          <AmountInput amountConfig={sendConfigs.amountConfig} />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
