import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect} from 'react';
import {PageWithScrollView} from '../../../components/page';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '../../../stores';
import {
  useGasSimulator,
  useDelegateTxConfig,
  useTxConfigsValidate,
} from '@keplr-wallet/hooks';
import {AsyncKVStore} from '../../../common';
import {AmountInput} from '../../../components/input/amount-input';
import {MemoInput} from '../../../components/input/memo-input';
import {Stack} from '../../../components/stack';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {Button} from '../../../components/button';
import {FeeControl} from '../../../components/input/fee-control';
import {Gutter} from '../../../components/gutter';
import {StackNavProp, StakeNavigation} from '../../../navigation';
import {ValidatorCard} from '../components/validator-card';
import {GuideBox} from '../../../components/guide-box';
import {useNotification} from '../../../hooks/notification';
import {useIntl} from 'react-intl';
import {simpleFetch} from '@keplr-wallet/simple-fetch';
import {APR_API_URL} from '../../../config.ts';

export const SignDelegateScreen: FunctionComponent = observer(() => {
  const {chainStore, accountStore, queriesStore} = useStore();
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.Delegate'>>();
  const navigation = useNavigation<StackNavProp>();
  const style = useStyle();
  const initialChainId = route.params['chainId'];
  const {validatorAddress, fromDeepLink} = route.params;
  const notification = useNotification();
  const intl = useIntl();

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;

  const queries = queriesStore.get(chainId);

  useEffect(() => {
    if (!initialChainId) {
      navigation.goBack();
    }
  }, [navigation, initialChainId]);

  const account = accountStore.getAccount(chainId);
  const sender = account.bech32Address;
  const unbondingPeriodDay = queries.cosmos.queryStakingParams.response
    ? queries.cosmos.queryStakingParams.unbondingTimeSec / (3600 * 24)
    : 21;

  const sendConfigs = useDelegateTxConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    validatorAddress,
    300000,
  );

  const gasSimulator = useGasSimulator(
    new AsyncKVStore('gas-simulator.screen.stake.delegate/delegate'),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    'native',
    () => {
      return account.cosmos.makeDelegateTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
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

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.flatten([
        'flex-grow-1',
        'padding-top-12',
        'padding-x-12',
      ])}>
      <Stack gutter={16}>
        <ValidatorCard validatorAddress={validatorAddress} chainId={chainId} />
        <AmountInput amountConfig={sendConfigs.amountConfig} />
        <MemoInput memoConfig={sendConfigs.memoConfig} />
      </Stack>
      <Gutter size={16} />
      <GuideBox
        color="warning"
        title={intl.formatMessage(
          {id: 'page.stake.delegate.guide-box.title'},
          {unbondingPeriodDay},
        )}
        paragraph={intl.formatMessage(
          {id: 'page.stake.delegate.guide-box.paragraph'},
          {unbondingPeriodDay},
        )}
      />

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
        loading={accountStore.getAccount(chainId).isSendingMsg === 'send'}
        onPress={async () => {
          if (!txConfigsValidate.interactionBlocked) {
            const tx = account.cosmos.makeDelegateTx(
              sendConfigs.amountConfig.amount[0].toDec().toString(),
              sendConfigs.recipientConfig.recipient,
            );

            try {
              await tx.send(
                sendConfigs.feeConfig.toStdFee(),
                sendConfigs.memoConfig.memo,
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                },
                {
                  onFulfill: (tx: any) => {
                    if (tx.code != null && tx.code !== 0) {
                      console.log(tx);
                      notification.show(
                        'failed',
                        intl.formatMessage({id: 'error.transaction-failed'}),
                      );
                      return;
                    }

                    if (fromDeepLink) {
                      try {
                        simpleFetch(
                          APR_API_URL,
                          '/coinbase/user-activity-report',
                          {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                              userIdentifier: fromDeepLink.userIdentifier,
                              activityName: fromDeepLink.activityName,
                            }),
                          },
                        );
                      } catch (e) {
                        console.log(e);
                      }
                    }

                    notification.show(
                      'success',
                      intl.formatMessage({
                        id: 'notification.transaction-success',
                      }),
                    );
                  },
                  onBroadcasted: txHash => {
                    navigation.navigate('TxPending', {
                      chainId,
                      txHash: Buffer.from(txHash).toString('hex'),
                    });
                  },
                },
              );
            } catch (e) {
              if (e?.message === 'Request rejected') {
                return;
              }
              notification.show(
                'failed',
                intl.formatMessage({id: 'error.transaction-failed'}),
              );
            }
          }
        }}
      />
    </PageWithScrollView>
  );
});
