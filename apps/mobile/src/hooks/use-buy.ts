import {AppCurrency, ChainInfo} from '@keplr-wallet/types';
import {useStore} from '../stores';
import {useEffect, useState} from 'react';
import {FiatOnRampServiceInfo} from '../config.ui.ts';
import {simpleFetch} from '@keplr-wallet/simple-fetch';

export const useBuy = (selectedTokenInfo?: {
  chainId: string;
  currency: AppCurrency;
}) => {
  const {accountStore, chainStore} = useStore();
  const [fiatOnRampServiceInfos, setFiatOnRampServiceInfos] = useState<
    FiatOnRampServiceInfo[]
  >([]);

  useEffect(() => {
    (async () => {
      const response = await simpleFetch<{list: FiatOnRampServiceInfo[]}>(
        'https://raw.githubusercontent.com/chainapsis/keplr-fiat-on-off-ramp-registry/main/fiat-on-off-ramp-list.json',
      );

      setFiatOnRampServiceInfos(response.data.list);
    })();
  }, []);

  const buySupportServiceInfos = fiatOnRampServiceInfos.map(serviceInfo => {
    const buySupportCoinDenoms = [
      ...new Set(
        selectedTokenInfo
          ? Object.entries(serviceInfo.buySupportCoinDenomsByChainId)
              .filter(
                ([chainId, coinDenoms]) =>
                  chainId === selectedTokenInfo.chainId &&
                  coinDenoms?.some(coinDenom =>
                    coinDenom === 'USDC'
                      ? selectedTokenInfo.currency.coinDenom.includes('USDC')
                      : coinDenom === selectedTokenInfo.currency.coinDenom,
                  ),
              )
              .map(([_, coinDenoms]) => coinDenoms)
              .flat()
          : Object.values(serviceInfo.buySupportCoinDenomsByChainId).flat(),
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
              bech32Address: accountStore.getAccount(chainId).bech32Address,
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
            chainAccount.chainInfo.chainId === selectedTokenInfo.chainId,
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
              process.env['KEPLR_EXT_MOONPAY_API_KEY'] ?? serviceInfo.apiKey,
            showWalletAddressForm: 'true',
            walletAddresses: encodeURIComponent(
              JSON.stringify(
                buySupportChainAccounts.reduce(
                  (acc, cur) => ({
                    ...acc,
                    [(
                      cur.chainInfo.stakeCurrency || cur.chainInfo.currencies[0]
                    ).coinDenom.toLowerCase()]: cur.bech32Address,
                  }),
                  {},
                ),
              ),
            ),
            defaultCurrencyCode: selectedCoinDenom ?? buySupportCoinDenoms[0],
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
                      cur.chainInfo.stakeCurrency || cur.chainInfo.currencies[0]
                    ).coinDenom]: {
                      address: cur.bech32Address,
                    },
                  }),
                  {},
                ),
              }),
            ),
            cryptoCurrencyList: buySupportCoinDenoms,
            defaultCryptoCurrency: selectedCoinDenom ?? buySupportCoinDenoms[0],
          };
        case 'kado':
          return {
            apiKey: process.env['KEPLR_EXT_KADO_API_KEY'] ?? serviceInfo.apiKey,
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
      ? `${serviceInfo.buyOrigin}?${Object.entries(buyUrlParams)
          .map(paramKeyValue => paramKeyValue.join('='))
          .join('&')}`
      : undefined;

    return {
      ...serviceInfo,
      buyUrl,
    };
  });

  return buySupportServiceInfos;
};
