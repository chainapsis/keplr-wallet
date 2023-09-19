import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {
  FiatOnRampServiceInfo,
  FiatOnRampServiceInfos,
} from '../../utils/config.ui';
import {simpleFetch} from '@keplr-wallet/simple-fetch';
import {useStore} from '../../stores';
import {ChainInfo} from '@keplr-wallet/types';
import {BaseModal, BaseModalHeader} from '../../components/modal';
import {useStyle} from '../../styles';
import {useBottomSheet} from '@gorhom/bottom-sheet';
import {Box} from '../../components/box';

export const BuyModal = () => {
  return (
    <BaseModal
      screenOptions={{
        title: '',
        headerBackTitle: '',
      }}
      initialRouteName="List"
      screenList={[
        {
          routeName: 'Buy',
          scene: BuyCryptoScene,
        },
      ]}
    />
  );
};

const BuyCryptoScene = observer(() => {
  const {accountStore, chainStore} = useStore();
  const style = useStyle();
  const [fiatOnRampServiceInfos, setFiatOnRampServiceInfos] = useState(
    FiatOnRampServiceInfos,
  );
  const bottom = useBottomSheet();

  useEffect(() => {
    (async () => {
      const response = await simpleFetch<{list: FiatOnRampServiceInfo[]}>(
        'https://raw.githubusercontent.com/chainapsis/keplr-fiat-on-off-ramp-registry/main/fiat-on-off-ramp-list.json',
      );

      setFiatOnRampServiceInfos(response.data.list);
    })();
  }, []);

  const buySupportServiceInfos = fiatOnRampServiceInfos.map(serviceInfo => {
    const buySupportChainIds = Object.keys(
      serviceInfo.buySupportCoinDenomsByChainId,
    );

    const buySupportDefaultChainInfo = (() => {
      if (
        buySupportChainIds.length > 0 &&
        chainStore.hasChain(buySupportChainIds[0])
      ) {
        return chainStore.getChain(buySupportChainIds[0]);
      }
    })();

    const buySupportChainAccounts = (() => {
      const res: {
        chainInfo: ChainInfo;
        bech32Address: string;
      }[] = [];

      for (const chainId of buySupportChainIds) {
        if (chainStore.hasChain(chainId)) {
          res.push({
            chainInfo: chainStore.getChain(chainId),
            bech32Address: accountStore.getAccount(chainId).bech32Address,
          });
        }
      }

      return res;
    })();

    const buyUrlParams = (() => {
      switch (serviceInfo.serviceId) {
        case 'moonpay':
          return {
            apiKey:
              process.env['KEPLR_EXT_MOONPAY_API_KEY'] ?? serviceInfo.apiKey,
            showWalletAddressForm: 'true',
            walletAddresses: encodeURIComponent(
              JSON.stringify(
                buySupportChainAccounts.reduce(
                  (acc, cur) => ({
                    ...acc,
                    [cur.chainInfo.stakeCurrency.coinDenom.toLowerCase()]:
                      cur.bech32Address,
                  }),
                  {},
                ),
              ),
            ),
            ...(buySupportDefaultChainInfo && {
              defaultCurrencyCode:
                buySupportDefaultChainInfo.stakeCurrency.coinDenom.toLowerCase(),
            }),
          };
        case 'transak':
          return {
            apiKey:
              process.env['KEPLR_EXT_TRANSAK_API_KEY'] ?? serviceInfo.apiKey,
            hideMenu: 'true',
            walletAddressesData: encodeURIComponent(
              JSON.stringify({
                coins: buySupportChainAccounts.reduce(
                  (acc, cur) => ({
                    ...acc,
                    [cur.chainInfo.stakeCurrency.coinDenom]: {
                      address: cur.bech32Address,
                    },
                  }),
                  {},
                ),
              }),
            ),
            cryptoCurrencyList: buySupportChainAccounts
              .map(
                chainAccount => chainAccount.chainInfo.stakeCurrency.coinDenom,
              )
              .join(','),
            ...(buySupportDefaultChainInfo && {
              defaultCryptoCurrency:
                buySupportDefaultChainInfo.stakeCurrency.coinDenom,
            }),
          };
        case 'kado':
          return {
            apiKey: process.env['KEPLR_EXT_KADO_API_KEY'] ?? serviceInfo.apiKey,
            product: 'BUY',
            networkList: buySupportChainAccounts.map(chainAccount =>
              chainAccount.chainInfo.chainName.toUpperCase(),
            ),
            cryptoList: [
              ...new Set(
                Object.values(serviceInfo.buySupportCoinDenomsByChainId).flat(),
              ),
            ],
          };
        default:
          return;
      }
    })();
    const buyUrl = buyUrlParams
      ? `${serviceInfo.buyOrigin}?${Object.entries(buyUrlParams)
          .map(paramKeyValue => paramKeyValue.join('='))
          .join('&')}`
      : undefined;

    return {
      ...serviceInfo,
      buyUrl,
    };
  });

  return (
    <View style={style.flatten(['background-color-gray-600', 'height-full'])}>
      <BaseModalHeader title="Buy" />
      {buySupportServiceInfos.map(serviceInfo => {
        return (
          <ServiceItem
            key={serviceInfo.serviceId}
            serviceInfo={serviceInfo}
            close={() => bottom.close()}
          />
        );
      })}
    </View>
  );
});

const ServiceItem: FunctionComponent<{
  serviceInfo: FiatOnRampServiceInfo & {buyUrl?: string};
  close: () => void;
}> = ({serviceInfo, close}) => {
  return (
    <Pressable
      onPress={async () => {
        await browser.tabs.create({
          url: serviceInfo.buyUrl,
        });

        close();
      }}>
      <Box></Box>

      <Text>{serviceInfo.serviceName}</Text>
    </Pressable>
  );
};
