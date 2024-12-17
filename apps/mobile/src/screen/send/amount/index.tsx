import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';
import {PageWithScrollView} from '../../../components/page';
import {
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useStore} from '../../../stores';
import {
  useGasSimulator,
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
} from '@keplr-wallet/hooks';
import {ICNSInfo} from '../../../config.ui';
import {DenomHelper} from '@keplr-wallet/common';
import {AsyncKVStore} from '../../../common';
import {TokenItem} from '../../../components/token-view';
import {CoinPretty, DecUtils} from '@keplr-wallet/unit';
import {Label} from '../../../components/input/label';
import {RecipientInput} from '../../../components/input/reciepient-input';
import {AmountInput} from '../../../components/input/amount-input';
import {FormattedMessage, useIntl} from 'react-intl';
import {MemoInput} from '../../../components/input/memo-input';
import {Stack} from '../../../components/stack';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {Button} from '../../../components/button';
import {FeeControl} from '../../../components/input/fee-control';
import {Gutter} from '../../../components/gutter';
import {BACKGROUND_PORT, Message} from '@keplr-wallet/router';
import {
  LogAnalyticsEventMsg,
  SendTxAndRecordMsg,
} from '@keplr-wallet/background';
import {RNMessageRequesterInternal} from '../../../router';
import {RootStackParamList, StackNavProp} from '../../../navigation';
import {useNotification} from '../../../hooks/notification';
import {useFocusAfterRouting} from '../../../hooks/use-focus';
import {LayeredHorizontalRadioGroup} from '../../../components/radio-group';
import {VerticalCollapseTransition} from '../../../components/transition';
import {
  DestinationChainView,
  IBCTransferSelectDestinationModal,
} from './ibc-transfer';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {amountToAmbiguousAverage} from '../../../utils';
import {GuideBox} from '../../../components/guide-box';
import {Text} from 'react-native';
import {EthTxStatus} from '@keplr-wallet/types';

export const SendAmountScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    ethereumAccountStore,
    queriesStore,
    skipQueriesStore,
    priceStore,
    uiConfigStore,
  } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'Send'>>();
  const navigation = useNavigation<StackNavProp>();
  const intl = useIntl();
  const style = useStyle();
  const notification = useNotification();
  const addressRef = useFocusAfterRouting();

  const initialChainId = route.params['chainId'];
  const initialCoinMinimalDenom = route.params['coinMinimalDenom'];
  const initialRecipientAddress = route.params['recipientAddress'];

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const chainInfo = chainStore.getChain(chainId);
  const isEvmChain = chainStore.isEvmChain(chainId);
  const coinMinimalDenom =
    initialCoinMinimalDenom || chainInfo.currencies[0].coinMinimalDenom;
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);
  const isErc20 = new DenomHelper(currency.coinMinimalDenom).type === 'erc20';

  const [isIBCTransfer, setIsIBCTransfer] = useState(false);
  const [
    isIBCTransferDestinationModalOpen,
    setIsIBCTransferDestinationModalOpen,
  ] = useState(false);

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigation.goBack();
    }
  }, [navigation, initialChainId, initialCoinMinimalDenom]);

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
        !isEvmTx &&
        !chainStore.getChain(chainId).chainId.startsWith('injective'),
      allowHexAddressOnly: isEvmTx,
      icns: ICNSInfo,
      computeTerraClassicTax: true,
    },
  );

  sendConfigs.amountConfig.setCurrency(currency);

  useEffect(() => {
    sendConfigs.recipientConfig.setValue(initialRecipientAddress || '');
  }, [initialRecipientAddress, sendConfigs.recipientConfig]);

  const gasSimulatorKey = useMemo(() => {
    const txType: 'evm' | 'cosmos' = isEvmTx ? 'evm' : 'cosmos';

    if (sendConfigs.amountConfig.currency) {
      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom,
      );

      if (denomHelper.type !== 'native') {
        if (denomHelper.type === 'cw20' || denomHelper.type === 'erc20') {
          // Probably, the gas can be different per cw20 according to how the contract implemented.
          return `${txType}/${denomHelper.type}/${denomHelper.contractAddress}`;
        }

        return `${txType}/${denomHelper.type}`;
      }
    }

    return `${txType}/native`;
  }, [isEvmTx, sendConfigs.amountConfig.currency]);

  const gasSimulator = useGasSimulator(
    new AsyncKVStore('gas-simulator.screen.send/send'),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    isIBCTransfer ? `ibc/${gasSimulatorKey}` : gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error(
          intl.formatMessage({id: 'error.send-currency-not-set'}),
        );
      }

      if (isIBCTransfer) {
        if (
          sendConfigs.channelConfig.uiProperties.loadingState ===
            'loading-block' ||
          sendConfigs.channelConfig.uiProperties.error != null
        ) {
          throw new Error('Not ready to simulate tx');
        }
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.uiProperties.loadingState ===
          'loading-block' ||
        sendConfigs.amountConfig.uiProperties.error != null ||
        sendConfigs.recipientConfig.uiProperties.loadingState ===
          'loading-block' ||
        sendConfigs.recipientConfig.uiProperties.error != null
      ) {
        throw new Error(intl.formatMessage({id: 'error.not-read-simulate-tx'}));
      }

      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom,
      );
      // I don't know why, but simulation does not work for secret20
      if (denomHelper.type === 'secret20') {
        throw new Error(
          intl.formatMessage({
            id: 'error.simulating-secret-wasm-not-supported',
          }),
        );
      }

      if (isIBCTransfer) {
        return account.cosmos.makePacketForwardIBCTransferTx(
          accountStore,
          sendConfigs.channelConfig.channels,
          sendConfigs.amountConfig.amount[0].toDec().toString(),
          sendConfigs.amountConfig.amount[0].currency,
          sendConfigs.recipientConfig.recipient,
        );
      }

      if (
        isEvmChain &&
        sendConfigs.recipientConfig.isRecipientEthereumHexAddress
      ) {
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
        sendConfigs.recipientConfig.recipient,
      );
    },
  );

  const currentFeeCurrencyCoinMinimalDenom =
    sendConfigs.feeConfig.fees[0]?.currency.coinMinimalDenom;
  useEffect(() => {
    const chainInfo = chainStore.getChain(chainId);
    // feemarket 이상하게 만들어서 simulate하면 더 적은 gas가 나온다 귀찮아서 대충 처리.
    if (chainInfo.hasFeature('feemarket')) {
      if (
        currentFeeCurrencyCoinMinimalDenom !==
        chainInfo.currencies[0].coinMinimalDenom
      ) {
        gasSimulator.setGasAdjustmentValue('2');
      } else {
        gasSimulator.setGasAdjustmentValue('1.6');
      }
    }
  }, [chainId, chainStore, gasSimulator, currentFeeCurrencyCoinMinimalDenom]);

  useEffect(() => {
    if (isEvmChain) {
      const sendingDenomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom,
      );
      const isERC20 = sendingDenomHelper.type === 'erc20';
      const isSendingNativeToken =
        sendingDenomHelper.type === 'native' &&
        (chainInfo.stakeCurrency?.coinMinimalDenom ??
          chainInfo.currencies[0].coinMinimalDenom) ===
          sendingDenomHelper.denom;
      const newIsEvmTx =
        sendConfigs.recipientConfig.isRecipientEthereumHexAddress &&
        (isERC20 || isSendingNativeToken);

      const newSenderAddress = newIsEvmTx
        ? account.ethereumHexAddress
        : account.bech32Address;

      sendConfigs.senderConfig.setValue(newSenderAddress);
      setIsEvmTx(newIsEvmTx);
      ethereumAccount.setIsSendingTx(false);
    }
  }, [
    account,
    ethereumAccount,
    isEvmChain,
    sendConfigs.amountConfig.currency.coinMinimalDenom,
    sendConfigs.recipientConfig.isRecipientEthereumHexAddress,
    sendConfigs.senderConfig,
    chainInfo.stakeCurrency?.coinMinimalDenom,
    chainInfo.currencies,
  ]);

  useEffect(() => {
    // To simulate secretwasm, we need to include the signature in the tx.
    // With the current structure, this approach is not possible.
    if (
      sendConfigs.amountConfig.currency &&
      new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
        .type === 'secret20'
    ) {
      gasSimulator.forceDisable(
        new Error(
          intl.formatMessage({
            id: 'error.simulating-secret-20-not-supported',
          }),
        ),
      );
      sendConfigs.gasConfig.setValue(
        // TODO: 이 값을 config 밑으로 빼자
        250000,
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

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  // IBC Send일때 auto fill일때는 recipient input에서 paragraph로 auto fill되었다는 것을 알려준다.
  const [isIBCRecipientSetAuto, setIsIBCRecipientSetAuto] = useState(false);
  // 유저가 주소를 수정했을때 auto fill이라는 state를 해제하기 위해서 마지막으로 auto fill된 주소를 기억한다.
  const [ibcRecipientAddress, setIBCRecipientAddress] = useState('');

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

  const historyType = isIBCTransfer ? 'basic-send/ibc' : 'basic-send';

  const [isSendingIBCToken, setIsSendingIBCToken] = useState(false);
  useEffect(() => {
    if (!isIBCTransfer) {
      if (
        new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
          .type === 'native' &&
        sendConfigs.amountConfig.currency.coinMinimalDenom.startsWith('ibc/')
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
      currency.coinMinimalDenom,
    );
  } catch (e) {
    console.log(e);
  }

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.get('flex-grow-1')}
      style={style.flatten(['padding-x-12'])}>
      <Stack gutter={16}>
        <Box>
          <Label
            content={intl.formatMessage({id: 'page.send.amount.asset-title'})}
          />
          <TokenItem
            viewToken={{
              token: balance?.balance ?? new CoinPretty(currency, '0'),
              chainInfo: chainStore.getChain(chainId),
              isFetching: balance?.isFetching ?? false,
              error: balance?.error,
            }}
            forChange={true}
            onClick={() => {
              navigation.dispatch({
                ...StackActions.push('Send.SelectAsset'),
              });
            }}
          />
        </Box>

        {!isErc20 && !uiConfigStore.swapDisabledConfig.disabled && (
          <Box>
            <LayeredHorizontalRadioGroup
              size="large"
              itemMinWidth={'50%'}
              items={[
                {
                  key: 'send',
                  text: intl.formatMessage({
                    id: 'page.send.type.send',
                  }),
                },
                {
                  key: 'ibc-transfer',
                  text: intl.formatMessage({
                    id: 'page.send.type.ibc-transfer',
                  }),
                },
              ]}
              selectedKey={isIBCTransfer ? 'ibc-transfer' : 'send'}
              onSelect={key => {
                if (key === 'ibc-transfer') {
                  if (sendConfigs.channelConfig.channels.length === 0) {
                    setIsIBCTransferDestinationModalOpen(true);
                  }
                } else {
                  sendConfigs.channelConfig.setChannels([]);
                  setIsIBCTransfer(false);
                }
              }}
            />
          </Box>
        )}

        <VerticalCollapseTransition collapsed={!isIBCTransfer}>
          <DestinationChainView
            ibcChannelConfig={sendConfigs.channelConfig}
            onPress={() => {
              setIsIBCTransferDestinationModalOpen(true);
            }}
          />
        </VerticalCollapseTransition>

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
              transitionAlign="top">
              <Gutter size={8} />

              <Text
                style={style.flatten(['text-caption2', 'color-platinum-200'])}>
                <FormattedMessage id="page.send.amount.ibc-send-recipient-auto-filled" />
              </Text>
            </VerticalCollapseTransition>
          }
        />

        <AmountInput amountConfig={sendConfigs.amountConfig} />

        {!isEvmTx && (
          <MemoInput
            memoConfig={sendConfigs.memoConfig}
            placeholder={
              isIBCTransfer
                ? undefined
                : intl.formatMessage({
                    id: 'page.send.amount.memo-placeholder',
                  })
            }
          />
        )}
      </Stack>

      <VerticalCollapseTransition collapsed={!isIBCTransfer}>
        <Gutter size={16} />

        <GuideBox
          color="warning"
          title={intl.formatMessage({
            id: 'page.send.amount.ibc-transfer-warning.title',
          })}
        />
      </VerticalCollapseTransition>

      <VerticalCollapseTransition collapsed={!isSendingIBCToken}>
        <Gutter size={16} />

        <GuideBox
          color="warning"
          title={intl.formatMessage({
            id: 'page.send.amount.avoid-cex-warning.title',
          })}
        />
      </VerticalCollapseTransition>

      <Box style={style.flatten(['flex-1'])} />

      <FeeControl
        senderConfig={sendConfigs.senderConfig}
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
        gasSimulator={gasSimulator}
      />

      <Gutter size={16} />

      <Button
        text={intl.formatMessage({id: 'button.next'})}
        size={'large'}
        disabled={txConfigsValidate.interactionBlocked}
        loading={
          isEvmTx
            ? ethereumAccount.isSendingTx
            : accountStore.getAccount(chainId).isSendingMsg ===
              (!isIBCTransfer ? 'send' : 'ibcTransfer')
        }
        onPress={async () => {
          if (!txConfigsValidate.interactionBlocked) {
            try {
              if (isEvmTx && sendConfigs.feeConfig.type !== 'manual') {
                ethereumAccount.setIsSendingTx(true);
                const {maxFeePerGas, maxPriorityFeePerGas} =
                  sendConfigs.feeConfig.getEIP1559TxFees(
                    sendConfigs.feeConfig.type,
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
                  onBroadcasted: txHash => {
                    ethereumAccount.setIsSendingTx(false);

                    navigation.navigate('TxPending', {
                      chainId,
                      txHash,
                      isEvmTx,
                    });
                  },
                  onFulfill: txReceipt => {
                    queryBalances
                      .getQueryEthereumHexAddress(sender)
                      .balances.forEach(balance => {
                        if (
                          balance.currency.coinMinimalDenom ===
                            coinMinimalDenom ||
                          sendConfigs.feeConfig.fees.some(
                            fee =>
                              fee.currency.coinMinimalDenom ===
                              balance.currency.coinMinimalDenom,
                          )
                        ) {
                          balance.fetch();
                        }
                      });
                    queryBalances
                      .getQueryBech32Address(account.bech32Address)
                      .balances.forEach(balance => {
                        if (
                          balance.currency.coinMinimalDenom ===
                            coinMinimalDenom ||
                          sendConfigs.feeConfig.fees.some(
                            fee =>
                              fee.currency.coinMinimalDenom ===
                              balance.currency.coinMinimalDenom,
                          )
                        ) {
                          balance.fetch();
                        }
                      });

                    if (txReceipt.status === EthTxStatus.Success) {
                      notification.show(
                        'success',
                        intl.formatMessage({
                          id: 'notification.transaction-success',
                        }),
                        '',
                      );
                    } else {
                      notification.show(
                        'failed',
                        intl.formatMessage({id: 'error.transaction-failed'}),
                        '',
                      );
                    }
                  },
                });
              } else {
                const tx = isIBCTransfer
                  ? accountStore
                      .getAccount(chainId)
                      .cosmos.makePacketForwardIBCTransferTx(
                        accountStore,
                        sendConfigs.channelConfig.channels,
                        sendConfigs.amountConfig.amount[0].toDec().toString(),
                        sendConfigs.amountConfig.amount[0].currency,
                        sendConfigs.recipientConfig.recipient,
                      )
                  : accountStore
                      .getAccount(chainId)
                      .makeSendTokenTx(
                        sendConfigs.amountConfig.amount[0].toDec().toString(),
                        sendConfigs.amountConfig.amount[0].currency,
                        sendConfigs.recipientConfig.recipient,
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
                        sendConfigs.amountConfig.amount.map(amount => {
                          return {
                            amount: DecUtils.getTenExponentN(
                              amount.currency.coinDecimals,
                            )
                              .mul(amount.toDec())
                              .toString(),
                            denom: amount.currency.coinMinimalDenom,
                          };
                        }),
                        sendConfigs.memoConfig.memo,
                      );
                      if (isIBCTransfer) {
                        if (msg instanceof SendTxAndRecordMsg) {
                          msg = msg.withIBCPacketForwarding(
                            sendConfigs.channelConfig.channels,
                            {
                              currencies:
                                chainStore.getChain(chainId).currencies,
                            },
                          );
                        } else {
                          throw new Error('Invalid message type');
                        }
                      }
                      return await new RNMessageRequesterInternal().sendMessage(
                        BACKGROUND_PORT,
                        msg,
                      );
                    },
                  },
                  {
                    onBroadcasted: async txHash => {
                      chainStore.enableVaultsWithCosmosAddress(
                        sendConfigs.recipientConfig.chainId,
                        sendConfigs.recipientConfig.recipient,
                      );

                      if (!isIBCTransfer) {
                        const inCurrencyPrice =
                          await priceStore.waitCalculatePrice(
                            sendConfigs.amountConfig.amount[0],
                            'usd',
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
                            if (
                              'paths' in currency &&
                              currency.originCurrency
                            ) {
                              return currency.originCurrency.coinDenom;
                            }
                            return currency.coinDenom;
                          })(),
                          chainId: sendConfigs.recipientConfig.chainId,
                          chainIdentifier: ChainIdHelper.parse(
                            sendConfigs.recipientConfig.chainId,
                          ).identifier,
                          inAvg: amountToAmbiguousAverage(
                            sendConfigs.amountConfig.amount[0],
                          ),
                        };
                        if (inCurrencyPrice) {
                          params['inFiatAvg'] =
                            amountToAmbiguousAverage(inCurrencyPrice);
                        }

                        new RNMessageRequesterInternal().sendMessage(
                          BACKGROUND_PORT,
                          new LogAnalyticsEventMsg('send', params),
                        );
                      } else if (ibcChannelFluent != null) {
                        const pathChainIds = [chainId].concat(
                          ...ibcChannelFluent.channels.map(
                            channel => channel.counterpartyChainId,
                          ),
                        );
                        const intermediateChainIds: string[] = [];
                        if (pathChainIds.length > 2) {
                          intermediateChainIds.push(
                            ...pathChainIds.slice(1, -1),
                          );
                        }

                        const inCurrencyPrice =
                          await priceStore.waitCalculatePrice(
                            sendConfigs.amountConfig.amount[0],
                            'usd',
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
                            if (
                              'paths' in currency &&
                              currency.originCurrency
                            ) {
                              return currency.originCurrency.coinDenom;
                            }
                            return currency.coinDenom;
                          })(),
                          originChainId: ibcChannelFluent.originChainId,
                          originChainIdentifier: ChainIdHelper.parse(
                            ibcChannelFluent.originChainId,
                          ).identifier,
                          sourceChainId: chainId,
                          sourceChainIdentifier:
                            ChainIdHelper.parse(chainId).identifier,
                          destinationChainId:
                            ibcChannelFluent.destinationChainId,
                          destinationChainIdentifier: ChainIdHelper.parse(
                            ibcChannelFluent.destinationChainId,
                          ).identifier,
                          pathChainIds,
                          pathChainIdentifiers: pathChainIds.map(
                            chainId => ChainIdHelper.parse(chainId).identifier,
                          ),
                          intermediateChainIds,
                          intermediateChainIdentifiers:
                            intermediateChainIds.map(
                              chainId =>
                                ChainIdHelper.parse(chainId).identifier,
                            ),
                          isToOrigin:
                            ibcChannelFluent.destinationChainId ===
                            ibcChannelFluent.originChainId,
                          inAvg: amountToAmbiguousAverage(
                            sendConfigs.amountConfig.amount[0],
                          ),
                        };
                        if (inCurrencyPrice) {
                          params['inFiatAvg'] =
                            amountToAmbiguousAverage(inCurrencyPrice);
                        }

                        new RNMessageRequesterInternal().sendMessage(
                          BACKGROUND_PORT,
                          new LogAnalyticsEventMsg('ibc_send', params),
                        );
                      }

                      navigation.navigate('TxPending', {
                        chainId,
                        txHash: Buffer.from(txHash).toString('hex'),
                      });
                    },
                    onFulfill: (tx: any) => {
                      if (tx.code != null && tx.code !== 0) {
                        console.log(tx);
                        notification.show(
                          'failed',
                          intl.formatMessage({id: 'error.transaction-failed'}),
                        );
                        return;
                      }

                      notification.show(
                        'success',
                        intl.formatMessage({
                          id: 'notification.transaction-success',
                        }),
                      );
                    },
                  },
                );
              }
            } catch (e) {
              if (e?.message === 'Request rejected') {
                return;
              }

              if (isEvmTx) {
                ethereumAccount.setIsSendingTx(false);
              }

              notification.show(
                'failed',
                intl.formatMessage({id: 'error.transaction-failed'}),
              );
            }
          }
        }}
      />

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
        isOpen={isIBCTransferDestinationModalOpen}
        setIsOpen={setIsIBCTransferDestinationModalOpen}
      />
    </PageWithScrollView>
  );
});
