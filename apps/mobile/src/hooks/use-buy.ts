import {AppCurrency, ChainInfo} from '@keplr-wallet/types';
import {useStore} from '../stores';
import {useEffect, useState} from 'react';
import {FiatOnRampServiceInfo} from '../config.ui.ts';
import {simpleFetch} from '@keplr-wallet/simple-fetch';

interface BuySupportServiceInfo extends FiatOnRampServiceInfo {
  buyUrl?: string;
}

export const useBuy = (selectedTokenInfo?: {
  chainId: string;
  currency: AppCurrency;
}) => {
  const {accountStore, chainStore} = useStore();
  const [buySupportServiceInfos, setBuySupportServiceInfos] = useState<
    BuySupportServiceInfo[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const fiatonoffRampResponse = await simpleFetch<{
          list: FiatOnRampServiceInfo[];
        }>(
          'https://raw.githubusercontent.com/chainapsis/keplr-fiat-on-off-ramp-registry/main/fiat-on-off-ramp-list.json',
        );

        const preBuySupportServiceInfos = fiatonoffRampResponse.data.list.map(
          serviceInfo => {
            const buySupportCoinDenoms = [
              ...new Set(
                selectedTokenInfo
                  ? Object.entries(serviceInfo.buySupportCoinDenomsByChainId)
                      .filter(
                        ([chainId, coinDenoms]) =>
                          chainId === selectedTokenInfo.chainId &&
                          coinDenoms?.some(coinDenom =>
                            coinDenom === 'USDC'
                              ? selectedTokenInfo.currency.coinDenom.includes(
                                  'USDC',
                                )
                              : coinDenom ===
                                selectedTokenInfo.currency.coinDenom,
                          ),
                      )
                      .map(([_, coinDenoms]) => coinDenoms)
                      .flat()
                  : Object.values(
                      serviceInfo.buySupportCoinDenomsByChainId,
                    ).flat(),
              ),
            ];
            const buySupportChainAccounts = (() => {
              const res: {
                chainInfo: ChainInfo;
                bech32Address: string;
              }[] = [];

              for (const chainId of Object.keys(
                serviceInfo.buySupportCoinDenomsByChainId,
              )) {
                if (chainStore.hasChain(chainId)) {
                  if (
                    !selectedTokenInfo ||
                    (selectedTokenInfo && selectedTokenInfo.chainId === chainId)
                  ) {
                    res.push({
                      chainInfo: chainStore.getChain(chainId),
                      bech32Address:
                        accountStore.getAccount(chainId).bech32Address,
                    });
                  }
                }
              }

              return res;
            })();

            const selectedCoinDenom = selectedTokenInfo
              ? buySupportCoinDenoms.find(coinDenom =>
                  coinDenom === 'USDC'
                    ? selectedTokenInfo.currency.coinDenom.includes('USDC')
                    : coinDenom === selectedTokenInfo.currency.coinDenom,
                )
              : undefined;
            const selectedChainName = selectedTokenInfo
              ? buySupportChainAccounts.find(
                  chainAccount =>
                    chainAccount.chainInfo.chainId ===
                    selectedTokenInfo.chainId,
                )?.chainInfo.chainName
              : undefined;

            const buyUrlParams = (() => {
              if (buySupportCoinDenoms.length === 0) {
                return undefined;
              }

              switch (serviceInfo.serviceId) {
                case 'moonpay':
                  return {
                    apiKey:
                      process.env['KEPLR_EXT_MOONPAY_API_KEY'] ??
                      serviceInfo.apiKey,
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
                    defaultCurrencyCode:
                      selectedCoinDenom ?? buySupportCoinDenoms[0],
                  };
                case 'transak':
                  return {
                    apiKey:
                      process.env['KEPLR_EXT_TRANSAK_API_KEY'] ??
                      serviceInfo.apiKey,
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
                    cryptoCurrencyList: buySupportCoinDenoms,
                    defaultCryptoCurrency:
                      selectedCoinDenom ?? buySupportCoinDenoms[0],
                  };
                case 'kado':
                  return {
                    apiKey:
                      process.env['KEPLR_EXT_KADO_API_KEY'] ??
                      serviceInfo.apiKey,
                    product: 'BUY',
                    networkList: buySupportChainAccounts.map(chainAccount =>
                      chainAccount.chainInfo.chainName.toUpperCase(),
                    ),
                    cryptoList: buySupportCoinDenoms,
                    onRevCurrency: selectedCoinDenom ?? buySupportCoinDenoms[0],
                    network:
                      selectedChainName ??
                      buySupportChainAccounts[0].chainInfo.chainName.toUpperCase(),
                  };
                default:
                  return;
              }
            })();
            const buyUrl = buyUrlParams
              ? `${'https://buy-sandbox.moonpay.com'}?${Object.entries(
                  buyUrlParams,
                )
                  .map(paramKeyValue => paramKeyValue.join('='))
                  .join('&')}`
              : undefined;

            return {
              ...serviceInfo,
              buyUrl,
            };
          },
        );

        // Moonpay buy url should be with signature from server side.
        let moonpayBuyUrlWithSignature: string = '';
        try {
          const moonpayServiceInfo = preBuySupportServiceInfos.find(
            serviceInfo => serviceInfo.serviceId === 'moonpay',
          );
          const moonpaySignResponse = await simpleFetch<string>(
            'https://wallet.keplr.app',
            `/api/moonpay-sign?url=${encodeURIComponent(
              moonpayServiceInfo?.buyUrl ?? '',
            )}`,
          );
          moonpayBuyUrlWithSignature = moonpaySignResponse.data;
        } catch (e) {
          // If something wrong on the request, just ignore it.
          console.log(e);
        }

        const newBuySupportServiceInfos = preBuySupportServiceInfos.map(
          serviceInfo => ({
            ...serviceInfo,
            ...(serviceInfo.serviceId === 'moonpay' &&
              moonpayBuyUrlWithSignature && {
                buyUrl: moonpayBuyUrlWithSignature,
              }),
          }),
        );

        setBuySupportServiceInfos(newBuySupportServiceInfos);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [accountStore, buySupportServiceInfos, chainStore, selectedTokenInfo]);

  return buySupportServiceInfos;
};
