import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';
import {PageWithScrollView} from '../../../components/page';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '../../../stores';
import {
  useGasSimulator,
  useRedelegateTxConfig,
  useTxConfigsValidate,
} from '@keplr-wallet/hooks';
import {DenomHelper} from '@keplr-wallet/common';
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
import {ValidatorItem} from '../components/validator-item';

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

  console.log(dstValidatorInfo.address, validatorAddress);
  const gasSimulator = useGasSimulator(
    new AsyncKVStore('gas-simulator.screen.stake.delegate/delegate'),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    gasSimulatorKey,
    () => {
      return account.cosmos.makeBeginRedelegateTx(
        sendConfigs.amountConfig.amount[0].toDec().toString(),
        validatorAddress,
        dstValidatorInfo.address,
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
        <Box>
          <Text>Switch to</Text>
          <ValidatorItem
            viewValidator={{
              validatorAddress: dstValidatorInfo.address,
              name: dstValidatorInfo.name,
            }}
            chainId={chainId}
            afterSelect={() => {
              navigation.navigate('Stake', {
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
                    }
                  },
                  onBroadcasted: () => {
                    navigation.reset({routes: [{name: 'Home'}]});
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
