import React, {
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
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { useNavigate } from "react-router";
import {
  Body2,
  H2,
  Subtitle3,
  Subtitle4,
} from "../../../components/typography";
import { Box } from "../../../components/box";
import { Gutter } from "../../../components/gutter";
import { useNotification } from "../../../hooks/notification";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import {
  LogAnalyticsEventMsg,
  SendTxAndRecordMsg,
} from "@keplr-wallet/background";
import { useIntl } from "react-intl";
import { useIBCChannelConfigQueryString } from "../../../hooks/use-ibc-channel-config-query-string";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { amountToAmbiguousAverage } from "../../../utils";
import { WalletStatus } from "@keplr-wallet/stores";
import { ColorPalette } from "../../../styles";
import { Input } from "../components/input";

export const EarnTransferAmountPage: FunctionComponent = observer(() => {
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
  const ibcTransferDestinationChainId =
    initialIBCTransferDestinationChainId ?? "noble-1";
  const chainInfo = chainStore.getChain(chainId);
  const ibcTransferDestinationChainInfo = chainStore.getChain(
    ibcTransferDestinationChainId
  );

  const [errorMessage, setErrorMessage] = useState("");

  const coinMinimalDenom =
    initialCoinMinimalDenom || chainInfo.currencies[0].coinMinimalDenom;
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);
  const coinDenom = useMemo(() => {
    if ("originCurrency" in currency && currency.originCurrency) {
      return currency.originCurrency.coinDenom;
    }
    return currency.coinDenom;
  }, [currency]);

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

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigate(
        `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
          "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
        )}`
      );
    }
  }, [navigate, initialChainId, initialCoinMinimalDenom]);

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

  const error = useMemo(() => {
    const uiProperties = sendConfigs.amountConfig.uiProperties;

    const err = uiProperties.error || uiProperties.warning;

    if (err instanceof EmptyAmountError) {
      return;
    }

    if (err instanceof ZeroAmountError) {
      return;
    }

    if (err) {
      return err.message || err.toString();
    }
  }, [sendConfigs.amountConfig.uiProperties]);

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
        paddingTop="2rem"
        paddingX="1.5rem"
        style={{
          flex: 1,
        }}
      >
        <Stack flex={1}>
          <H2 color={ColorPalette["white"]}>
            {intl.formatMessage(
              { id: "page.earn.transfer.amount.from" },
              {
                token: `${coinDenom} on ${chainInfo.chainName}`,
              }
            )}
          </H2>
          <Gutter size="0.75rem" />
          <Subtitle3 color={ColorPalette["white"]}>
            {balance.hideIBCMetadata(true).toString()}{" "}
            <span style={{ color: ColorPalette["gray-300"] }}>
              {`on ${chainInfo.chainName}`}
            </span>
          </Subtitle3>
          <Gutter size="1.75rem" />
          <H2 color={ColorPalette["white"]}>
            {intl.formatMessage(
              { id: "page.earn.transfer.amount.to" },
              {
                token: `${coinDenom} on ${ibcTransferDestinationChainInfo.chainName}`,
              }
            )}
          </H2>
          <Gutter size="2.25rem" />
          <Input
            type="number"
            placeholder={intl.formatMessage({
              id: "page.earn.transfer.amount.input.placeholder",
            })}
            value={sendConfigs.amountConfig.value}
            warning={error != null}
            onChange={(e) => {
              sendConfigs.amountConfig.setValue(e.target.value);
              if (new Dec(e.target.value || "0").gt(balance.toDec())) {
                setErrorMessage(
                  intl.formatMessage({
                    id: "page.earn.amount.error.insufficient-balance",
                  })
                );
              } else {
                setErrorMessage("");
              }
            }}
            autoComplete="off"
          />
          <Gutter size="0.75rem" />
          <Box
            padding="0.25rem 0.5rem"
            backgroundColor={ColorPalette["gray-550"]}
            borderRadius="0.5rem"
            width="fit-content"
            cursor="pointer"
            onClick={() => {
              sendConfigs.amountConfig.setValue(
                balance.hideDenom(true).toString()
              );
            }}
          >
            <Subtitle4 color={ColorPalette["gray-200"]}>
              {balance.hideIBCMetadata(true).toString()}
            </Subtitle4>
          </Box>

          {errorMessage && (
            <Box marginTop="0.75rem">
              <Body2 color={ColorPalette["red-300"]}>{errorMessage}</Body2>
            </Box>
          )}
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
