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

import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

import { useStore } from "../../../stores";
import {
  useGasSimulator,
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks";
import { useNavigate } from "react-router";
import { AmountInput, RecipientInput } from "../../../components/input";
import { TokenItem } from "../../main/components";
import { Caption2, Subtitle3 } from "../../../components/typography";
import { Box } from "../../../components/box";
import { MemoInput } from "../../../components/input/memo-input";
import { XAxis, YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { FeeControl } from "../../../components/input/fee-control";
import { useNotification } from "../../../hooks/notification";
import { DenomHelper, ExtensionKVStore } from "@keplr-wallet/common";
import { ICNSInfo } from "../../../config.ui";
import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import { ColorPalette } from "../../../styles";
import { openPopupWindow } from "@keplr-wallet/popup";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import {
  LogAnalyticsEventMsg,
  SendTxAndRecordMsg,
} from "@keplr-wallet/background";
import { FormattedMessage, useIntl } from "react-intl";
import { useTxConfigsQueryString } from "../../../hooks/use-tx-config-query-string";
import { LayeredHorizontalRadioGroup } from "../../../components/radio-group";
import { Modal } from "../../../components/modal";
import {
  DestinationChainView,
  IBCTransferSelectDestinationModal,
} from "./ibc-transfer";
import { useIBCChannelConfigQueryString } from "../../../hooks/use-ibc-channel-config-query-string";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { GuideBox } from "../../../components/guide-box";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { amountToAmbiguousAverage } from "../../../utils";
import { EthTxStatus } from "@keplr-wallet/types";

const Styles = {
  Flex1: styled.div`
    flex: 1;
  `,
};

export const SendAmountPage: FunctionComponent = observer(() => {
  const {
    analyticsStore,
    accountStore,
    ethereumAccountStore,
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

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const chainInfo = chainStore.getChain(chainId);
  const isEvmChain = chainStore.isEvmChain(chainId);
  const coinMinimalDenom =
    initialCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);
  const isErc20 = new DenomHelper(currency.coinMinimalDenom).type === "erc20";

  const [isIBCTransfer, setIsIBCTransfer] = useState(false);
  const [
    isIBCTransferDestinationModalOpen,
    setIsIBCTransferDestinationModalOpen,
  ] = useState(false);

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

  const [isEvmTx, setIsEvmTx] = useState(isErc20);

  const account = accountStore.getAccount(chainId);
  const ethereumAccount = ethereumAccountStore.getAccount(chainId);

  const queryBalances = queriesStore.get(chainId).queryBalances;
  const sender = isEvmTx ? account.ethereumHexAddress : account.bech32Address;
  const balance = isEvmTx
    ? queryBalances.getQueryEthereumHexAddress(sender).getBalance(currency)
    : queryBalances.getQueryBech32Address(sender).getBalance(currency);

  const sendConfigs = useSendMixedIBCTransferConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    // TODO: 이 값을 config 밑으로 빼자
    300000,
    isIBCTransfer,
    {
      allowHexAddressToBech32Address:
        !isEvmChain &&
        !chainStore.getChain(chainId).chainId.startsWith("injective"),
      allowHexAddressOnly: isEvmTx,
      icns: ICNSInfo,
      computeTerraClassicTax: true,
    }
  );
  sendConfigs.amountConfig.setCurrency(currency);

  const gasSimulatorKey = useMemo(() => {
    const txType: "evm" | "cosmos" = isEvmTx ? "evm" : "cosmos";

    if (sendConfigs.amountConfig.currency) {
      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom
      );

      if (denomHelper.type !== "native") {
        if (denomHelper.type === "cw20" || denomHelper.type === "erc20") {
          // Probably, the gas can be different per cw20 according to how the contract implemented.
          return `${txType}/${denomHelper.type}/${denomHelper.contractAddress}`;
        }

        return `${txType}/${denomHelper.type}`;
      }
    }

    return `${txType}/native`;
  }, [isEvmTx, sendConfigs.amountConfig.currency]);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.main.send"),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    isIBCTransfer ? `ibc/${gasSimulatorKey}` : gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      if (isIBCTransfer) {
        if (
          sendConfigs.channelConfig.uiProperties.loadingState ===
            "loading-block" ||
          sendConfigs.channelConfig.uiProperties.error != null
        ) {
          throw new Error("Not ready to simulate tx");
        }
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

      if (isIBCTransfer) {
        return account.cosmos.makePacketForwardIBCTransferTx(
          sendConfigs.channelConfig.channels,
          sendConfigs.amountConfig.amount[0].toDec().toString(),
          sendConfigs.amountConfig.amount[0].currency,
          sendConfigs.recipientConfig.recipient
        );
      }

      const isEvmTx =
        isEvmChain && sendConfigs.recipientConfig.isRecipientEthereumHexAddress;
      if (isEvmTx) {
        return {
          simulate: () =>
            ethereumAccount.simulateGas({
              currency: sendConfigs.amountConfig.amount[0].currency,
              amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
              sender: sendConfigs.senderConfig.sender,
              recipient: sendConfigs.recipientConfig.recipient,
            }),
        };
      }

      return account.makeSendTokenTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        sendConfigs.amountConfig.amount[0].currency,
        sendConfigs.recipientConfig.recipient
      );
    }
  );

  useEffect(() => {
    const newIsEvmTx =
      new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
        .type === "erc20" ||
      (isEvmChain && sendConfigs.recipientConfig.isRecipientEthereumHexAddress);

    const newSenderAddress = newIsEvmTx
      ? account.ethereumHexAddress
      : account.bech32Address;

    sendConfigs.senderConfig.setValue(newSenderAddress);
    setIsEvmTx(newIsEvmTx);
    ethereumAccount.setIsSendingTx(false);
  }, [
    account,
    ethereumAccount,
    isEvmChain,
    sendConfigs.amountConfig.currency.coinMinimalDenom,
    sendConfigs.recipientConfig.isRecipientEthereumHexAddress,
    sendConfigs.senderConfig,
  ]);

  useEffect(() => {
    // To simulate secretwasm, we need to include the signature in the tx.
    // With the current structure, this approach is not possible.
    if (
      sendConfigs.amountConfig.currency &&
      new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
        .type === "secret20"
    ) {
      gasSimulator.forceDisable(
        new Error(
          intl.formatMessage({ id: "error.simulating-secret-20-not-supported" })
        )
      );
      sendConfigs.gasConfig.setValue(
        // TODO: 이 값을 config 밑으로 빼자
        250000
      );
    } else {
      gasSimulator.forceDisable(false);
      gasSimulator.setEnabled(true);
    }
  }, [
    gasSimulator,
    intl,
    sendConfigs.amountConfig.currency,
    sendConfigs.gasConfig,
  ]);

  useTxConfigsQueryString(chainId, {
    ...sendConfigs,
    gasSimulator,
  });
  useIBCChannelConfigQueryString(sendConfigs.channelConfig, (channels) => {
    if (channels && channels.length > 0) {
      setIsIBCTransfer(true);
    }
  });

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  // IBC Send일때 auto fill일때는 recipient input에서 paragraph로 auto fill되었다는 것을 알려준다.
  const [isIBCRecipientSetAuto, setIsIBCRecipientSetAuto] = useState(false);
  // 유저가 주소를 수정했을때 auto fill이라는 state를 해제하기 위해서 마지막으로 auto fill된 주소를 기억한다.
  const [ibcRecipientAddress, setIBCRecipientAddress] = useState("");

  useEffect(() => {
    if (
      !isIBCTransfer ||
      sendConfigs.recipientConfig.value !== ibcRecipientAddress
    ) {
      setIsIBCRecipientSetAuto(false);
    }
    // else 문을 써서 같다면 setAuto를 true로 해주면 안된다.
    // 의도상 한번 바꾸면 다시 auto fill 값과 같더라도 유저가 수정한걸로 간주한다.
  }, [ibcRecipientAddress, sendConfigs.recipientConfig.value, isIBCTransfer]);

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

  const isDetachedMode = searchParams.get("detached") === "true";

  const historyType = isIBCTransfer ? "basic-send/ibc" : "basic-send";

  const [isSendingIBCToken, setIsSendingIBCToken] = useState(false);
  useEffect(() => {
    if (!isIBCTransfer) {
      if (
        new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
          .type === "native" &&
        sendConfigs.amountConfig.currency.coinMinimalDenom.startsWith("ibc/")
      ) {
        setIsSendingIBCToken(true);
        return;
      }
    }

    setIsSendingIBCToken(false);
  }, [isIBCTransfer, sendConfigs.amountConfig.currency]);

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
      title={intl.formatMessage({ id: "page.send.amount.title" })}
      displayFlex={true}
      fixedMinHeight={true}
      left={<BackButton />}
      right={
        !isDetachedMode ? (
          <Box
            paddingRight="1rem"
            cursor="pointer"
            onClick={async (e) => {
              e.preventDefault();

              analyticsStore.logEvent("click_popOutButton");
              const url = window.location.href + "&detached=true";

              await openPopupWindow(url, undefined);
              window.close();
            }}
          >
            <DetachIcon size="1.5rem" color={ColorPalette["gray-300"]} />
          </Box>
        ) : null
      }
      bottomButton={{
        disabled: txConfigsValidate.interactionBlocked,
        text: intl.formatMessage({ id: "button.next" }),
        color: "primary",
        size: "large",
        isLoading: isEvmTx
          ? ethereumAccount.isSendingTx
          : accountStore.getAccount(chainId).isSendingMsg ===
            (!isIBCTransfer ? "send" : "ibcTransfer"),
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        if (!txConfigsValidate.interactionBlocked) {
          try {
            if (isEvmTx && sendConfigs.feeConfig.type !== "manual") {
              ethereumAccount.setIsSendingTx(true);
              const { maxFeePerGas, maxPriorityFeePerGas } =
                sendConfigs.feeConfig.getEIP1559TxFees(
                  sendConfigs.feeConfig.type
                );

              const unsignedTx = await ethereumAccount.makeSendTokenTx({
                currency: sendConfigs.amountConfig.amount[0].currency,
                amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
                from: sender,
                to: sendConfigs.recipientConfig.recipient,
                gasLimit: sendConfigs.gasConfig.gas,
                maxFeePerGas: maxFeePerGas.toString(),
                maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
              });
              await ethereumAccount.sendEthereumTx(sender, unsignedTx, {
                onFulfill: (txReceipt) => {
                  if (txReceipt.status === EthTxStatus.Success) {
                    notification.show(
                      "success",
                      intl.formatMessage({
                        id: "notification.transaction-success",
                      }),
                      ""
                    );
                  } else {
                    notification.show(
                      "failed",
                      intl.formatMessage({ id: "error.transaction-failed" }),
                      ""
                    );
                  }
                },
              });
              ethereumAccount.setIsSendingTx(false);
            } else {
              const tx = isIBCTransfer
                ? accountStore
                    .getAccount(chainId)
                    .cosmos.makePacketForwardIBCTransferTx(
                      sendConfigs.channelConfig.channels,
                      sendConfigs.amountConfig.amount[0].toDec().toString(),
                      sendConfigs.amountConfig.amount[0].currency,
                      sendConfigs.recipientConfig.recipient
                    )
                : accountStore
                    .getAccount(chainId)
                    .makeSendTokenTx(
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
                      historyType,
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
                    if (isIBCTransfer) {
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

                    if (!isIBCTransfer) {
                      const inCurrencyPrice =
                        await priceStore.waitCalculatePrice(
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
                        denom:
                          sendConfigs.amountConfig.amount[0].currency
                            .coinMinimalDenom,
                        commonDenom: (() => {
                          const currency =
                            sendConfigs.amountConfig.amount[0].currency;
                          if ("paths" in currency && currency.originCurrency) {
                            return currency.originCurrency.coinDenom;
                          }
                          return currency.coinDenom;
                        })(),
                        chainId: sendConfigs.recipientConfig.chainId,
                        chainIdentifier: ChainIdHelper.parse(
                          sendConfigs.recipientConfig.chainId
                        ).identifier,
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
                        new LogAnalyticsEventMsg("send", params)
                      );
                    } else if (ibcChannelFluent != null) {
                      const pathChainIds = [chainId].concat(
                        ...ibcChannelFluent.channels.map(
                          (channel) => channel.counterpartyChainId
                        )
                      );
                      const intermediateChainIds: string[] = [];
                      if (pathChainIds.length > 2) {
                        intermediateChainIds.push(...pathChainIds.slice(1, -1));
                      }

                      const inCurrencyPrice =
                        await priceStore.waitCalculatePrice(
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
                      notification.show(
                        "failed",
                        intl.formatMessage({ id: "error.transaction-failed" }),
                        ""
                      );
                      return;
                    }
                    notification.show(
                      "success",
                      intl.formatMessage({
                        id: "notification.transaction-success",
                      }),
                      ""
                    );
                  },
                }
              );
            }

            if (!isDetachedMode) {
              navigate("/", {
                replace: true,
              });
            } else {
              window.close();
            }
          } catch (e) {
            if (e?.message === "Request rejected") {
              return;
            }

            if (isEvmTx) {
              ethereumAccount.setIsSendingTx(false);
            }

            console.log(e);
            notification.show(
              "failed",
              intl.formatMessage({ id: "error.transaction-failed" }),
              ""
            );
            if (!isDetachedMode) {
              navigate("/", {
                replace: true,
              });
            } else {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              window.close();
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

          {!isErc20 && (
            <LayeredHorizontalRadioGroup
              size="large"
              selectedKey={isIBCTransfer ? "ibc-transfer" : "send"}
              items={[
                {
                  key: "send",
                  text: intl.formatMessage({
                    id: "page.send.type.send",
                  }),
                },
                {
                  key: "ibc-transfer",
                  text: intl.formatMessage({
                    id: "page.send.type.ibc-transfer",
                  }),
                },
              ]}
              onSelect={(key) => {
                if (key === "ibc-transfer") {
                  if (sendConfigs.channelConfig.channels.length === 0) {
                    setIsIBCTransferDestinationModalOpen(true);
                  }
                } else {
                  sendConfigs.channelConfig.setChannels([]);
                  setIsIBCTransfer(false);
                }
              }}
            />
          )}

          <VerticalCollapseTransition collapsed={!isIBCTransfer}>
            <DestinationChainView
              ibcChannelConfig={sendConfigs.channelConfig}
              onClick={() => {
                setIsIBCTransferDestinationModalOpen(true);
              }}
            />
            <Gutter size="0.75rem" />
          </VerticalCollapseTransition>
          <Gutter size="0" />

          <RecipientInput
            ref={addressRef}
            historyType={historyType}
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            currency={sendConfigs.amountConfig.currency}
            permitAddressBookSelfKeyInfo={isIBCTransfer}
            bottom={
              <VerticalCollapseTransition
                collapsed={!isIBCRecipientSetAuto}
                transitionAlign="top"
              >
                <Gutter size="0.25rem" />
                <XAxis>
                  <Gutter size="0.5rem" />
                  <Caption2 color={ColorPalette["platinum-200"]}>
                    <FormattedMessage id="page.send.amount.ibc-send-recipient-auto-filled" />
                  </Caption2>
                </XAxis>
              </VerticalCollapseTransition>
            }
          />

          <AmountInput amountConfig={sendConfigs.amountConfig} />

          {!isEvmTx && (
            <MemoInput
              memoConfig={sendConfigs.memoConfig}
              placeholder={
                // IBC Send일때는 어차피 밑에서 cex로 보내지 말라고 경고가 뜬다.
                // 근데 memo의 placeholder는 cex로 보낼때 메모를 꼭 확인하라고 하니 서로 모순이라 이상하다.
                // 그래서 IBC Send일때는 memo의 placeholder를 없앤다.
                isIBCTransfer
                  ? undefined
                  : intl.formatMessage({
                      id: "page.send.amount.memo-placeholder",
                    })
              }
            />
          )}

          <VerticalCollapseTransition collapsed={!isIBCTransfer}>
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.send.amount.ibc-transfer-warning.title",
              })}
            />
            <Gutter size="0.75rem" />
          </VerticalCollapseTransition>
          <Gutter size="0" />
          <VerticalCollapseTransition collapsed={!isSendingIBCToken}>
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: "page.send.amount.avoid-cex-warning.title",
              })}
            />
            <Gutter size="0.75rem" />
          </VerticalCollapseTransition>
          <Gutter size="0" />

          <Styles.Flex1 />
          <Gutter size="0" />

          <FeeControl
            senderConfig={sendConfigs.senderConfig}
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
            gasSimulator={gasSimulator}
          />
        </Stack>
      </Box>

      <Modal
        isOpen={isIBCTransferDestinationModalOpen}
        align="bottom"
        close={() => {
          setIsIBCTransferDestinationModalOpen(false);
        }}
      >
        <IBCTransferSelectDestinationModal
          chainId={chainId}
          denom={currency.coinMinimalDenom}
          recipientConfig={sendConfigs.recipientConfig}
          ibcChannelConfig={sendConfigs.channelConfig}
          setIsIBCTransfer={setIsIBCTransfer}
          setAutomaticRecipient={(address: string) => {
            setIsIBCRecipientSetAuto(true);
            setIBCRecipientAddress(address);
          }}
          setIBCChannelsInfoFluent={setIBCChannelFluent}
          close={() => {
            setIsIBCTransferDestinationModalOpen(false);
          }}
        />
      </Modal>
    </HeaderLayout>
  );
});

const DetachIcon: FunctionComponent<{
  size: string;
  color: string;
}> = ({ size, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
};
