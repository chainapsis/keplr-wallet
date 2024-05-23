import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect} from 'react';
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
import {Text} from 'react-native';
import {StackNavProp, StakeNavigation} from '../../../navigation';
import {ValidatorCard} from '../components/validator-card';
import {GuideBox} from '../../../components/guide-box';
import {XAxis} from '../../../components/axis';
import {useNotification} from '../../../hooks/notification';
import {FormattedMessage, useIntl} from 'react-intl';

export const SignUndelegateScreen: FunctionComponent = observer(() => {
  const {chainStore, accountStore, queriesStore} = useStore();
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.Undelegate'>>();
  const navigation = useNavigation<StackNavProp>();
  const style = useStyle();
  const initialChainId = route.params['chainId'];
  const {validatorAddress} = route.params;
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
    if (chainInfo.bech32Config) {
      sendConfigs.recipientConfig.setBech32Prefix(
        chainInfo.bech32Config.bech32PrefixValAddr,
      );
    }
    sendConfigs.recipientConfig.setValue(validatorAddress);
  }, [
    chainInfo.bech32Config,
    chainInfo.bech32Config?.bech32PrefixValAddr,
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
        title={intl.formatMessage({
          id: 'page.stake.undelegate.guide-box.title',
        })}
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
                <FormattedMessage id="page.stake.undelegate.guide-box.paragraph-1" />
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
                <FormattedMessage
                  id="page.stake.undelegate.guide-box.paragraph-2"
                  values={{unbondingPeriodDay}}
                />
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
                <FormattedMessage id="page.stake.undelegate.guide-box.paragraph-3" />
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
        text={intl.formatMessage({id: 'button.next'})}
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
