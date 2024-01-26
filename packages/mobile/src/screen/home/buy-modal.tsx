import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useEffect, useState} from 'react';
import {Platform, StyleSheet, Text} from 'react-native';
import {FiatOnRampServiceInfo, FiatOnRampServiceInfos} from '../../config.ui';
import {simpleFetch} from '@keplr-wallet/simple-fetch';
import {useStore} from '../../stores';
import {ChainInfo} from '@keplr-wallet/types';
import {useStyle} from '../../styles';
import {RectButton} from 'react-native-gesture-handler';
import {Box} from '../../components/box';
import {TransakSvg} from '../../components/icon/fiat/transak';
import {KadoSvg} from '../../components/icon/fiat/kado';
import {MoonpaySvg} from '../../components/icon/fiat/moonpay';
import {Gutter} from '../../components/gutter';
import {Button} from '../../components/button';
import {registerCardModal} from '../../components/modal/card';
import {StackNavProp} from '../../navigation';
import {FormattedMessage, useIntl} from 'react-intl';

export const BuyModal = registerCardModal(
  observer<{
    navigation: StackNavProp;

    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }>(({setIsOpen, navigation}) => {
    const {accountStore, chainStore} = useStore();
    const style = useStyle();
    const intl = useIntl();

    const [fiatOnRampServiceInfos, setFiatOnRampServiceInfos] = useState(
      FiatOnRampServiceInfos,
    );
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
                      [(
                        cur.chainInfo.stakeCurrency ||
                        cur.chainInfo.currencies[0]
                      ).coinDenom.toLowerCase()]: cur.bech32Address,
                    }),
                    {},
                  ),
                ),
              ),
              ...(buySupportDefaultChainInfo && {
                defaultCurrencyCode: (
                  buySupportDefaultChainInfo.stakeCurrency ||
                  buySupportDefaultChainInfo.currencies[0]
                ).coinDenom.toLowerCase(),
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
                      [(
                        cur.chainInfo.stakeCurrency ||
                        cur.chainInfo.currencies[0]
                      ).coinDenom]: {
                        address: cur.bech32Address,
                      },
                    }),
                    {},
                  ),
                }),
              ),
              cryptoCurrencyList: buySupportChainAccounts
                .map(
                  chainAccount =>
                    (
                      chainAccount.chainInfo.stakeCurrency ||
                      chainAccount.chainInfo.currencies[0]
                    ).coinDenom,
                )
                .join(','),
              ...(buySupportDefaultChainInfo && {
                defaultCryptoCurrency: (
                  buySupportDefaultChainInfo.stakeCurrency ||
                  buySupportDefaultChainInfo.currencies[0]
                ).coinDenom,
              }),
            };
          case 'kado':
            return {
              apiKey:
                process.env['KEPLR_EXT_KADO_API_KEY'] ?? serviceInfo.apiKey,
              product: 'BUY',
              networkList: buySupportChainAccounts.map(chainAccount =>
                chainAccount.chainInfo.chainName.toUpperCase(),
              ),
              cryptoList: [
                ...new Set(
                  Object.values(
                    serviceInfo.buySupportCoinDenomsByChainId,
                  ).flat(),
                ),
              ],
              ...(buySupportDefaultChainInfo && {
                onRevCurrency:
                  serviceInfo.buySupportCoinDenomsByChainId[
                    buySupportDefaultChainInfo.chainId
                  ]?.[0] ?? 'USDC',
                network: buySupportDefaultChainInfo.chainName.toUpperCase(),
              }),
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
      <Box paddingX={12} paddingBottom={12}>
        <Box paddingY={8}>
          <Text
            style={StyleSheet.flatten([
              style.flatten(['color-white', 'text-center', 'h4']),
            ])}>
            <FormattedMessage id="page.main.components.buy-crypto-modal.title" />
          </Text>
        </Box>
        <Gutter size={12} />
        {buySupportServiceInfos
          .filter(serviceInfo => {
            if (Platform.OS === 'ios') {
              // appstore에서의 리뷰 이슈로 인해서 일단 kado를 ios에서 disable함.
              if (serviceInfo.serviceId === 'kado') {
                return false;
              }
            }

            return true;
          })
          .map(serviceInfo => {
            return (
              <React.Fragment key={serviceInfo.serviceId}>
                <ServiceItem
                  navigation={navigation}
                  serviceInfo={serviceInfo}
                  close={() => setIsOpen(false)}
                />
                <Gutter size={12} />
              </React.Fragment>
            );
          })}
        <Gutter size={8} />
        <Button
          size="large"
          color="secondary"
          text={intl.formatMessage({
            id: 'page.main.components.buy-crypto-modal.cancel-button',
          })}
          onPress={() => setIsOpen(false)}
        />
      </Box>
    );
  }),
);

const ServiceItem: FunctionComponent<{
  navigation: StackNavProp;

  serviceInfo: FiatOnRampServiceInfo & {buyUrl?: string};
  close: () => void;
}> = ({navigation, serviceInfo, close}) => {
  const style = useStyle();

  return (
    <Box
      height={66}
      borderRadius={6}
      style={style.flatten(['overflow-hidden'])}
      alignX="center"
      alignY="center">
      <RectButton
        style={style.flatten([
          'flex-row',
          'items-center',
          'justify-center',
          'width-full',
          'height-full',
          'background-color-gray-500',
          'gap-4',
        ])}
        rippleColor={style.get('color-gray-550').color}
        underlayColor={style.get('color-gray-550').color}
        activeOpacity={0.3}
        onPress={async () => {
          if (serviceInfo.buyUrl) {
            navigation.navigate('Web', {
              url: serviceInfo.buyUrl,
              isExternal: true,
            });
          }

          close();
        }}>
        <Box>
          {(() => {
            if (serviceInfo.serviceId === 'moonpay') {
              return <MoonpaySvg />;
            }
            if (serviceInfo.serviceId === 'kado') {
              return <KadoSvg />;
            }
            if (serviceInfo.serviceId === 'transak') {
              return <TransakSvg />;
            }
          })()}
        </Box>
        <Text style={style.flatten(['color-text-high', 'subtitle1'])}>
          {serviceInfo.serviceName}
        </Text>
      </RectButton>
    </Box>
  );
};
