import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect, useRef} from 'react';
import {PageWithScrollView} from '../../../components/page';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '../../../stores';
import {
  useGasSimulator,
  useTxConfigsValidate,
  useUndelegateTxConfig,
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
import {Text, TextInput} from 'react-native';
import {StackNavProp, StakeNavigation} from '../../../navigation';
import {ValidatorCard} from '../components/validator-card';
import {GuideBox} from '../../../components/guide-box';
import {XAxis} from '../../../components/axis';
import {useNotification} from '../../../hooks/notification';
import {useIntl} from 'react-intl';

export const SignUndelegateScreen: FunctionComponent = observer(() => {
  const {chainStore, accountStore, queriesStore} = useStore();
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.Undelegate'>>();
  const navigation = useNavigation<StackNavProp>();
  const style = useStyle();
  const addressRef = useRef<TextInput>(null);
  const initialChainId = route.params['chainId'];
  const {validatorAddress} = route.params;
  const notification = useNotification();
  const intl = useIntl();

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;

  const queries = queriesStore.get(chainId);
  useEffect(() => {
    addressRef.current?.focus();
  }, []);

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
  const chainInfo = chainStore.getChain(chainId);

  const sendConfigs = useUndelegateTxConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    validatorAddress,
    300000,
  );
  sendConfigs.amountConfig.setCurrency(chainInfo.stakeCurrency);

  useEffect(() => {
    sendConfigs.recipientConfig.setBech32Prefix(
      chainInfo.bech32Config.bech32PrefixValAddr,
    );
    sendConfigs.recipientConfig.setValue(validatorAddress);
  }, [
    chainInfo.bech32Config.bech32PrefixValAddr,
    sendConfigs.recipientConfig,
    validatorAddress,
  ]);

  const gasSimulator = useGasSimulator(
    new AsyncKVStore('gas-simulator.screen.stake.undelegate/undelegate'),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    'native',
    () => {
      return account.cosmos.makeUndelegateTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        sendConfigs.recipientConfig.recipient,
      );
    },
  );

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.get('flex-grow-1')}
      style={style.flatten(['padding-x-12', 'padding-top-12'])}>
      <Stack gutter={16}>
        <ValidatorCard validatorAddress={validatorAddress} chainId={chainId} />
        <AmountInput amountConfig={sendConfigs.amountConfig} />
        <MemoInput memoConfig={sendConfigs.memoConfig} />
      </Stack>
      <Gutter size={16} />
      <GuideBox
        color="warning"
        title="Once the unstaking period begins you will:"
        paragraph={
          <Box paddingX={6}>
            <XAxis>
              <Text
                style={style.flatten([
                  'body2',
                  'margin-right-4',
                  'color-yellow-500',
                ])}>
                •
              </Text>
              <Text style={style.flatten(['body2', 'color-yellow-500'])}>
                NOT recieve staking rewards
              </Text>
            </XAxis>
            <XAxis>
              <Text
                style={style.flatten([
                  'body2',
                  'margin-right-4',
                  'color-yellow-500',
                ])}>
                •
              </Text>
              <Text style={style.flatten(['body2', 'color-yellow-500'])}>
                {`need to wait ${unbondingPeriodDay} days for the amount to be liquid`}
              </Text>
            </XAxis>
            <XAxis>
              <Text
                style={style.flatten([
                  'body2',
                  'margin-right-4',
                  'color-yellow-500',
                ])}>
                •
              </Text>
              <Text style={style.flatten(['body2', 'color-yellow-500'])}>
                But you will be able to cancel the unstaking process anytime, as
                this chain currently supports the function
              </Text>
            </XAxis>
          </Box>
        }
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
        text={'Next'}
        size={'large'}
        disabled={txConfigsValidate.interactionBlocked}
        loading={accountStore.getAccount(chainId).isSendingMsg === 'send'}
        onPress={async () => {
          if (!txConfigsValidate.interactionBlocked) {
            const tx = account.cosmos.makeUndelegateTx(
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
                        '',
                      );
                      return;
                    }

                    notification.show(
                      'success',
                      intl.formatMessage({
                        id: 'notification.transaction-success',
                      }),
                      '',
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
                notification.show(
                  'failed',
                  intl.formatMessage({id: 'error.transaction-failed'}),
                  '',
                );
                return;
              }
            }
          }
        }}
      />
    </PageWithScrollView>
  );
});
