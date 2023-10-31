import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect, useMemo, useRef} from 'react';
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
  useSendTxConfig,
  useTxConfigsValidate,
} from '@keplr-wallet/hooks';
import {ICNSInfo} from '../../../utils/config.ui';
import {DenomHelper} from '@keplr-wallet/common';
import {AsyncKVStore} from '../../../common';
import {TokenItem} from '../../../components/token-view';
import {CoinPretty, DecUtils} from '@keplr-wallet/unit';
import {Label} from '../../../components/input/label';
import {RecipientInput} from '../../../components/input/reciepient-input';
import {AmountInput} from '../../../components/input/amount-input';
import {useIntl} from 'react-intl';
import {MemoInput} from '../../../components/input/memo-input';
import {Stack} from '../../../components/stack';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {Button} from '../../../components/button';
import {FeeControl} from '../../../components/input/fee-control';
import {Gutter} from '../../../components/gutter';
import {BACKGROUND_PORT, Message} from '@keplr-wallet/router';
import {SendTxAndRecordMsg} from '@keplr-wallet/background';
import {TextInput} from 'react-native';
import {RNMessageRequesterInternal} from '../../../router';

export const SendAmountScreen: FunctionComponent = observer(() => {
  const {chainStore, accountStore, queriesStore} = useStore();
  const route: RouteProp<{
    params: {
      chainId?: string;
      coinMinimalDenom?: string;
    };
  }> = useRoute();
  const navigation = useNavigation();
  const intl = useIntl();
  const style = useStyle();
  const addressRef = useRef<TextInput>(null);

  const initialChainId = route.params['chainId'];
  const initialCoinMinimalDenom = route.params['coinMinimalDenom'];

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const coinMinimalDenom =
    initialCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;

  useEffect(() => {
    addressRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigation.goBack();
    }
  }, [navigation, initialChainId, initialCoinMinimalDenom]);

  const account = accountStore.getAccount(chainId);
  const sender = account.bech32Address;

  const currency = chainStore
    .getChain(chainId)
    .forceFindCurrency(coinMinimalDenom);

  const balance = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(sender)
    .getBalance(currency);

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    // TODO: 이 값을 config 밑으로 빼자
    300000,
    {
      allowHexAddressOnEthermint: !chainStore
        .getChain(chainId)
        .chainId.startsWith('injective'),
      icns: ICNSInfo,
      computeTerraClassicTax: true,
    },
  );

  sendConfigs.amountConfig.setCurrency(currency);

  const gasSimulatorKey = useMemo(() => {
    if (sendConfigs.amountConfig.currency) {
      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom,
      );

      if (denomHelper.type !== 'native') {
        if (denomHelper.type === 'cw20') {
          // Probably, the gas can be different per cw20 according to how the contract implemented.
          return `${denomHelper.type}/${denomHelper.contractAddress}`;
        }

        return denomHelper.type;
      }
    }

    return 'native';
  }, [sendConfigs.amountConfig.currency]);

  const gasSimulator = useGasSimulator(
    new AsyncKVStore('gas-simulator.screen.send/send'),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error('Send currency not set');
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
        throw new Error('Not ready to simulate tx');
      }

      const denomHelper = new DenomHelper(
        sendConfigs.amountConfig.currency.coinMinimalDenom,
      );
      // I don't know why, but simulation does not work for secret20
      if (denomHelper.type === 'secret20') {
        throw new Error('Simulating secret wasm not supported');
      }

      return account.makeSendTokenTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        sendConfigs.amountConfig.amount[0].currency,
        sendConfigs.recipientConfig.recipient,
      );
    },
  );

  useEffect(() => {
    // To simulate secretwasm, we need to include the signature in the tx.
    // With the current structure, this approach is not possible.
    if (
      sendConfigs.amountConfig.currency &&
      new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
        .type === 'secret20'
    ) {
      gasSimulator.forceDisable(
        new Error('Simulating secret20 is not supported'),
      );
      sendConfigs.gasConfig.setValue(
        // TODO: 이 값을 config 밑으로 빼자
        250000,
      );
    } else {
      gasSimulator.forceDisable(false);
      gasSimulator.setEnabled(true);
    }
  }, [gasSimulator, sendConfigs.amountConfig.currency, sendConfigs.gasConfig]);

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  const historyType = 'basic-send';

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.get('flex-grow-1')}
      style={style.flatten(['padding-x-12'])}>
      <Stack gutter={16}>
        <Box>
          <Label content="Asset" />
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
                ...StackActions.replace('Send.SelectAsset'),
              });
            }}
          />
        </Box>

        <RecipientInput
          ref={addressRef}
          historyType={historyType}
          recipientConfig={sendConfigs.recipientConfig}
          memoConfig={sendConfigs.memoConfig}
        />

        <AmountInput amountConfig={sendConfigs.amountConfig} />

        <MemoInput
          memoConfig={sendConfigs.memoConfig}
          placeholder={intl.formatMessage({
            id: 'page.send.amount.memo-placeholder',
          })}
        />
      </Stack>

      <Box style={style.flatten(['flex-1'])} />

      <FeeControl
        senderConfig={sendConfigs.senderConfig}
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
        gasSimulator={gasSimulator}
      />

      <Gutter size={16} />

      <Button
        text={'Next'}
        size={'large'}
        loading={accountStore.getAccount(chainId).isSendingMsg === 'send'}
        onPress={async () => {
          if (!txConfigsValidate.interactionBlocked) {
            const tx = accountStore
              .getAccount(chainId)
              .makeSendTokenTx(
                sendConfigs.amountConfig.amount[0].toDec().toString(),
                sendConfigs.amountConfig.amount[0].currency,
                sendConfigs.recipientConfig.recipient,
              );

            try {
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
                    return await new RNMessageRequesterInternal().sendMessage(
                      BACKGROUND_PORT,
                      msg,
                    );
                  },
                },
                {
                  onBroadcasted: () => {
                    chainStore.enableVaultsWithCosmosAddress(
                      sendConfigs.recipientConfig.chainId,
                      sendConfigs.recipientConfig.recipient,
                    );
                  },
                  onFulfill: (tx: any) => {
                    if (tx.code != null && tx.code !== 0) {
                      console.log(tx);
                    }
                  },
                },
              );
            } catch (e) {
              if (e?.message === 'Request rejected') {
                return;
              }
            }
          }
        }}
      />
    </PageWithScrollView>
  );
});
