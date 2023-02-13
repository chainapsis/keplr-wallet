import { ChainInfoWithCoreTypes } from "@keplr-wallet/background/src/chains";
import {
  AccountSetBase,
  ChainInfoInner,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
} from "@keplr-wallet/stores";
import Axios from "axios";
import { useEffect, useState } from "react";

import {
  FiatOnOffRampServiceInfo,
  FiatOnOffRampServiceInfos,
} from "../config.ui";
import { useStore } from "../stores";

export interface BuySupportServiceInfo extends FiatOnOffRampServiceInfo {
  buySupportChainAccounts?: (AccountSetBase &
    CosmosAccount &
    CosmwasmAccount &
    SecretAccount)[];
  buySupportChainInfos?: ChainInfoInner<ChainInfoWithCoreTypes>[];
  buyUrl?: string;
}

export const useBuy = () => {
  const { chainStore, accountStore } = useStore();

  const currentChainId = chainStore.current.chainId;
  const currentChainAccount = accountStore.getAccount(currentChainId);
  const currentChainInfo = chainStore.current;

  const buySupportServiceInfos: BuySupportServiceInfo[] = FiatOnOffRampServiceInfos.map(
    (serviceInfo) => {
      if (!serviceInfo.buySupportChainIds.includes(currentChainId)) {
        return serviceInfo;
      }

      const buySupportChainAccounts = serviceInfo.buySupportChainIds.map(
        (buySupportChainId) => accountStore.getAccount(buySupportChainId)
      );
      const buySupportChainInfos = serviceInfo.buySupportChainIds.map(
        (buySupportChainId) => chainStore.getChain(buySupportChainId)
      );

      const buySupportDefaultChainInfo = chainStore.getChain(
        serviceInfo.buySupportDefaultChainId
      );

      const buyUrlParams = (() => {
        switch (serviceInfo.serviceId) {
          case "moonpay":
            return {
              apiKey: serviceInfo.apiKey,
              showWalletAddressForm: "true",
              ...(currentChainInfo && currentChainAccount
                ? {
                    walletAddress: encodeURIComponent(
                      JSON.stringify({
                        [currentChainInfo.stakeCurrency.coinDenom.toLowerCase()]: currentChainAccount?.bech32Address,
                      })
                    ),
                    currencyCode: currentChainInfo.stakeCurrency.coinDenom.toLowerCase(),
                  }
                : {
                    walletAddresses: encodeURIComponent(
                      JSON.stringify(
                        buySupportChainInfos.reduce((acc, cur) => {
                          const chainAccount = accountStore.getAccount(
                            cur.chainId
                          );
                          return {
                            ...acc,
                            [cur.stakeCurrency.coinDenom.toLowerCase()]: chainAccount.bech32Address,
                          };
                        }, {})
                      )
                    ),
                    ...(buySupportDefaultChainInfo && {
                      defaultCurrencyCode: buySupportDefaultChainInfo.stakeCurrency.coinDenom.toLowerCase(),
                    }),
                  }),
            };
          case "transak":
            return {
              apiKey: serviceInfo.apiKey,
              hideMenu: "true",
              ...(currentChainInfo && currentChainAccount
                ? {
                    walletAddress: currentChainAccount.bech32Address ?? "",
                    cryptoCurrencyCode:
                      currentChainInfo.stakeCurrency.coinDenom,
                  }
                : {
                    walletAddressesData: encodeURIComponent(
                      JSON.stringify({
                        coins: buySupportChainInfos.reduce((acc, cur) => {
                          const chainAccount = accountStore.getAccount(
                            cur.chainId
                          );
                          return {
                            ...acc,
                            [cur.stakeCurrency.coinDenom.toLowerCase()]: chainAccount.bech32Address,
                          };
                        }, {}),
                      })
                    ),
                    cryptoCurrencyList: buySupportChainInfos
                      .map((chainInfo) => chainInfo.stakeCurrency.coinDenom)
                      .join(","),
                  }),
              ...(buySupportDefaultChainInfo && {
                defaultCryptoCurrency:
                  buySupportDefaultChainInfo.stakeCurrency.coinDenom,
              }),
            };
          case "kado":
            return {
              apiKey: serviceInfo.apiKey,
              product: "BUY",
              networkList: buySupportChainInfos.map((chainInfo) =>
                chainInfo.chainName.toUpperCase()
              ),
              cryptoList: serviceInfo.buySupportCurrencies?.map(
                (currency) => currency.coinDenom
              ),
              ...(currentChainInfo &&
                currentChainAccount && {
                  onToAddress: currentChainAccount.bech32Address,
                  network: currentChainInfo.chainName.toUpperCase(),
                }),
            };
          default:
            return;
        }
      })();
      const buyUrl = buyUrlParams
        ? `${serviceInfo.buyOrigin}?${Object.entries(buyUrlParams)
            .map((paramKeyValue) => paramKeyValue.join("="))
            .join("&")}`
        : undefined;

      return {
        ...serviceInfo,
        buySupportChainAccounts,
        buySupportChainInfos,
        buyUrl,
      };
    }
  );

  const moonpayServiceInfo = buySupportServiceInfos.find(
    (serviceInfo) => serviceInfo.serviceId === "moonpay"
  );
  const [moonpayBuyUrlWithSign, setMoonpayBuyUrlWithSign] = useState<string>(
    ""
  );
  const [
    isMoonpayBuyUrlSignLoading,
    setIsMoonpayBuyUrlSignLoading,
  ] = useState<boolean>(false);
  useEffect(() => {
    if (moonpayServiceInfo?.buyUrl) {
      (async () => {
        setIsMoonpayBuyUrlSignLoading(true);
        const { data } = await Axios.get<string>(
          `https://wallet.keplr.app/api/moonpay-sign?url=${moonpayServiceInfo.buyUrl}`
        );
        setMoonpayBuyUrlWithSign(data);
        setIsMoonpayBuyUrlSignLoading(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moonpayServiceInfo?.buyUrl]);

  const newBuySupportServiceInfos = buySupportServiceInfos.map(
    (serviceInfo) => ({
      ...serviceInfo,
      ...(serviceInfo?.serviceId === "moonpay" && {
        buyUrl: moonpayBuyUrlWithSign,
        isLoading: isMoonpayBuyUrlSignLoading,
      }),
    })
  );

  return newBuySupportServiceInfos;
};
