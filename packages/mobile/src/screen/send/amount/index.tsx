import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect, useMemo} from 'react';
import {PageWithScrollView} from '../../../components/page';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '../../../stores';
import {useGasSimulator, useSendTxConfig} from '@keplr-wallet/hooks';
import {ICNSInfo} from '../../../utils/config.ui';
import {DenomHelper} from '@keplr-wallet/common';
import {AsyncKVStore} from '../../../common';
import {TokenItem} from '../../../components/token-view';
import {CoinPretty} from '@keplr-wallet/unit';
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

  const initialChainId = route.params['chainId'];
  const initialCoinMinimalDenom = route.params['coinMinimalDenom'];

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const coinMinimalDenom =
    initialCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;

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
          />
        </Box>

        <RecipientInput
          historyType="basic-send"
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

      <Button text={'Next'} size={'large'} />
    </PageWithScrollView>
  );
});
