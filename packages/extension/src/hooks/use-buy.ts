import Axios from "axios";
import { useEffect, useState } from "react";

import {
  FiatOnRampServiceInfo,
  FiatOnRampServiceInfos,
  KeplrExtKadoAPIKey,
  KeplrExtMoonPayAPIKey,
  KeplrExtTransakAPIKey,
} from "../config.ui";
import { useStore } from "../stores";

export interface BuySupportServiceInfo extends FiatOnRampServiceInfo {
  // If the service doesn't support the current chain, it will be undefined.
  buyUrl?: string;
}

export const useBuy = () => {
  const { chainStore, accountStore } = useStore();

  const [fiatOnRampServiceInfos, setFiatOnRampServiceInfos] = useState(
    FiatOnRampServiceInfos
  );

  const currentChainId = chainStore.current.chainId;
  const currentChainAccount = accountStore.getAccount(currentChainId);
  const currentChainInfo = chainStore.current;

  useEffect(() => {
    (async () => {
      const { data } = await Axios.get<{
        list: FiatOnRampServiceInfo[];
      }>(
        "https://raw.githubusercontent.com/chainapsis/keplr-fiat-on-off-ramp-registry/main/fiat-on-off-ramp-list.json"
      );
      const fetchedFiatOnRampServiceInfos = data.list;
      setFiatOnRampServiceInfos(fetchedFiatOnRampServiceInfos);
    })();
  }, []);

  const buySupportServiceInfos: BuySupportServiceInfo[] = fiatOnRampServiceInfos.map(
    (serviceInfo) => {
      if (
        !Object.keys(serviceInfo.buySupportCoinDenomsByChainId).includes(
          currentChainId
        )
      ) {
        return serviceInfo;
      }

      const buyUrlParams = (() => {
        switch (serviceInfo.serviceId) {
          case "moonpay":
            return {
              apiKey: KeplrExtMoonPayAPIKey ?? serviceInfo.apiKey,
              showWalletAddressForm: "true",
              walletAddress: encodeURIComponent(
                JSON.stringify({
                  [currentChainInfo.stakeCurrency.coinDenom.toLowerCase()]: currentChainAccount?.bech32Address,
                })
              ),
              currencyCode: currentChainInfo.stakeCurrency.coinDenom.toLowerCase(),
            };
          case "transak":
            return {
              apiKey: KeplrExtTransakAPIKey ?? serviceInfo.apiKey,
              hideMenu: "true",
              walletAddress: currentChainAccount.bech32Address ?? "",
              cryptoCurrencyCode: currentChainInfo.stakeCurrency.coinDenom,
            };
          case "kado":
            return {
              apiKey: KeplrExtKadoAPIKey ?? serviceInfo.apiKey,
              product: "BUY",
              networkList: chainStore.chainInfos
                .filter((chainInfo) =>
                  Object.keys(
                    serviceInfo.buySupportCoinDenomsByChainId
                  ).includes(chainInfo.chainId)
                )
                .map(({ chainName }) => chainName.toUpperCase()),
              cryptoList: [
                ...new Set(
                  Object.values(
                    serviceInfo.buySupportCoinDenomsByChainId
                  ).flat()
                ),
              ],
              onToAddress: currentChainAccount.bech32Address,
              onRevCurrency:
                serviceInfo.buySupportCoinDenomsByChainId[currentChainId],
              network: currentChainInfo.chainName.toUpperCase(),
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
          `https://wallet.keplr.app/api/moonpay-sign?url=${encodeURIComponent(
            moonpayServiceInfo.buyUrl ?? ""
          )}`
        );
        setMoonpayBuyUrlWithSign(data);
        setIsMoonpayBuyUrlSignLoading(false);
      })();
    } else {
      setMoonpayBuyUrlWithSign("");
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

  const isBuySupportChain =
    buySupportServiceInfos.filter((info) =>
      Object.keys(info.buySupportCoinDenomsByChainId).includes(currentChainId)
    ).length > 0;

  return {
    buySupportServiceInfos: newBuySupportServiceInfos,
    isBuySupportChain,
  };
};
