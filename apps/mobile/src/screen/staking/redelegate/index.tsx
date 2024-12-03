import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect, useState} from 'react';
import {PageWithScrollView} from '../../../components/page';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '../../../stores';
import {
  useGasSimulator,
  useRedelegateTxConfig,
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
import {LogBox, Text} from 'react-native';
import {StackNavProp, StakeNavigation} from '../../../navigation';
import {Staking} from '@keplr-wallet/stores';
import {Column, Columns} from '../../../components/column';
import {ValidatorImage} from '../components/validator-image';
import {ArrowRightIcon} from '../../../components/icon/arrow-right';
import {RectButton} from '../../../components/rect-button';
import {ValidatorCard} from '../components/validator-card';
import {useNotification} from '../../../hooks/notification';
import {FormattedMessage, useIntl} from 'react-intl';

//NOTE https://reactnavigation.org/docs/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
//해당 경고가 있으나 state persistence, deep linking를 해당 페이지에서 사용하지 않기 때문에 해당 경고를 무시함
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export const SignRedelegateScreen: FunctionComponent = observer(() => {
  const {chainStore, accountStore, queriesStore} = useStore();
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.Redelegate'>>();
  const navigation = useNavigation<StackNavProp>();
  const style = useStyle();
  const initialChainId = route.params['chainId'];
  const {validatorAddress} = route.params;
  const notification = useNotification();
  const intl = useIntl();

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;

  useEffect(() => {
    if (!initialChainId) {
      navigation.goBack();
    }
  }, [navigation, initialChainId]);

  const account = accountStore.getAccount(chainId);
  const sender = account.bech32Address;

  const chainInfo = chainStore.getChain(chainId);
  const [dstValidatorInfo, setDstValidatorInfo] = useState({
    address: '',
    name: '',
  });

  const sendConfigs = useRedelegateTxConfig(
    chainStore,
    queriesStore,
    chainId,
    sender,
    validatorAddress,
    300000,
  );
  sendConfigs.amountConfig.setCurrency(chainInfo.stakeCurrency);

  useEffect(() => {
    sendConfigs.recipientConfig.setValue(dstValidatorInfo.address);
  }, [dstValidatorInfo.address, sendConfigs.recipientConfig]);

  const gasSimulator = useGasSimulator(
    new AsyncKVStore('gas-simulator.screen.stake.redelegate/redelegate'),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    'native',
    () => {
      return account.cosmos.makeBeginRedelegateTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        validatorAddress,
        dstValidatorInfo.address,
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
        <Box>
          <Text
            style={style.flatten([
              'subtitle3',
              'color-label-default',
              'padding-left-8',
              'margin-bottom-6',
            ])}>
            <FormattedMessage id="page.stake.redelegate.select-validator-card.label" />
          </Text>
          <ValidatorItem
            validatorAddress={dstValidatorInfo.address}
            validatorName={dstValidatorInfo.name}
            chainId={chainId}
            afterSelect={() => {
              navigation.push('Stake', {
                screen: 'Stake.ValidateList',
                params: {
                  chainId,
                  validatorSelector: (validatorAddress, validatorName) => {
                    setDstValidatorInfo({
                      address: validatorAddress,
                      name: validatorName,
                    });
                  },
                },
              });
            }}
          />
        </Box>
        <AmountInput amountConfig={sendConfigs.amountConfig} />
        <MemoInput memoConfig={sendConfigs.memoConfig} />
      </Stack>
      <Gutter size={16} />

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
            const tx = account.cosmos.makeBeginRedelegateTx(
              sendConfigs.amountConfig.amount[0].toDec().toString(),
              validatorAddress,
              dstValidatorInfo.address,
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

export const ValidatorItem: FunctionComponent<{
  validatorAddress?: string;
  validatorName: string;
  isNotReady?: boolean;
  chainId: string;
  afterSelect: () => void;
}> = observer(({chainId, validatorAddress, validatorName, afterSelect}) => {
  const {queriesStore} = useStore();
  const queries = queriesStore.get(chainId);
  const style = useStyle();
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );

  return (
    <RectButton
      underlayColor={style.get('color-card-pressing-default').color}
      rippleColor={style.get('color-card-pressing-default').color}
      style={style.flatten([
        'border-radius-6',
        'background-color-card-default',
      ])}
      activeOpacity={0.5}
      onPress={async () => {
        afterSelect();
      }}>
      <Box
        paddingLeft={16}
        paddingRight={8}
        paddingY={16}
        borderRadius={6}
        height={74}
        alignY="center">
        <Columns sum={1} alignY="center" gutter={8}>
          <Box>
            {validatorAddress ? (
              <ValidatorImage
                imageUrl={bondedValidators.getValidatorThumbnail(
                  validatorAddress,
                )}
                name={validatorName}
              />
            ) : null}
          </Box>
          <Gutter size={12} />
          <Column weight={6}>
            {validatorName ? (
              <Text
                numberOfLines={1}
                style={style.flatten(['subtitle2', 'color-text-high'])}>
                {validatorName}
              </Text>
            ) : (
              <Text
                numberOfLines={1}
                style={style.flatten(['subtitle2', 'color-text-middle'])}>
                <FormattedMessage id="page.stake.redelegate.select-validator-card.placeholder" />
              </Text>
            )}
            <Gutter size={4} />
          </Column>
          <Column weight={1} />
          <Gutter size={4} />
          <ArrowRightIcon size={24} color={style.get('color-gray-400').color} />
        </Columns>
      </Box>
    </RectButton>
  );
});
