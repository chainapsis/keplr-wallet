import { AppCurrency } from "@keplr-wallet/types";
import { FiatOnRampServiceInfo } from "../config.ui";
import { useStore } from "../stores";

interface BuySupportServiceInfo extends FiatOnRampServiceInfo {
  buyUrl?: string;
}

export const useBuySupportServiceInfos = (selectedTokenInfo?: {
  chainId: string;
  currency: AppCurrency;
}): BuySupportServiceInfo[] => {
  const { accountStore, chainStore, queriesStore } = useStore();

  const response = queriesStore.simpleQuery.queryGet<{
    list: FiatOnRampServiceInfo[];
  }>(
    "https://raw.githubusercontent.com/chainapsis/keplr-fiat-on-off-ramp-registry/main/fiat-on-off-ramp-list.json"
  ).response;
  const fiatOnRampServiceInfos = response?.data.list;

  const buySupportServiceInfos = fiatOnRampServiceInfos?.map((serviceInfo) => {
    const buySupportCoinDenoms = [
      ...new Set(
        selectedTokenInfo
          ? Object.entries(serviceInfo.buySupportCoinDenomsByChainId)
              .filter(
                ([chainId, coinDenoms]) =>
                  chainId === selectedTokenInfo.chainId &&
                  coinDenoms?.some((coinDenom) =>
                    coinDenom === "USDC"
                      ? selectedTokenInfo.currency.coinDenom.includes("USDC")
                      : coinDenom === selectedTokenInfo.currency.coinDenom
                  )
              )
              .map(([_, coinDenoms]) => coinDenoms)
              .flat()
          : Object.values(serviceInfo.buySupportCoinDenomsByChainId).flat()
      ),
    ];

    const selectedCoinDenom = selectedTokenInfo
      ? buySupportCoinDenoms.find((coinDenom) =>
          coinDenom === "USDC"
            ? selectedTokenInfo.currency.coinDenom.includes("USDC")
            : coinDenom === selectedTokenInfo.currency.coinDenom
        )
      : undefined;

    const buyUrlParams = (() => {
      if (buySupportCoinDenoms.length === 0) {
        return undefined;
      }

      switch (serviceInfo.serviceId) {
        case "moonpay":
          return {
            apiKey:
              process.env["KEPLR_EXT_MOONPAY_API_KEY"] ?? serviceInfo.apiKey,
            walletAddresses: encodeURIComponent(
              JSON.stringify(
                Object.entries(
                  serviceInfo.buySupportCoinDenomsByChainId
                ).reduce((finalAcc, [chainId, coinDenoms]) => {
                  if (chainStore.hasChain(chainId)) {
                    const currencyCodeMap = coinDenoms?.reduce(
                      (acc, coinDenom) => {
                        const chainInfo = chainStore.getChain(chainId);
                        const matchedCurrency = chainInfo.currencies.find(
                          (currency) => currency.coinDenom === coinDenom
                        );
                        const currencyCode = getCurrencyCodeForMoonpay(
                          matchedCurrency?.coinDenom
                        );

                        if (currencyCode) {
                          acc[currencyCode] = accountStore.getAccount(
                            chainInfo.chainId
                          ).bech32Address;
                        }
                        return acc;
                      },
                      finalAcc as Record<string, string>
                    );

                    return {
                      ...finalAcc,
                      ...currencyCodeMap,
                    };
                  }

                  return finalAcc;
                }, {})
              )
            ),
            defaultCurrencyCode: getCurrencyCodeForMoonpay(
              selectedCoinDenom ?? buySupportCoinDenoms[0]
            ),
          };
        case "transak":
          return {
            apiKey:
              process.env["KEPLR_EXT_TRANSAK_API_KEY"] ?? serviceInfo.apiKey,
            hideMenu: "true",
            walletAddressesData: encodeURIComponent(
              JSON.stringify(
                Object.entries(
                  serviceInfo.buySupportCoinDenomsByChainId
                ).reduce(
                  (finalAcc, [chainId, coinDenoms]) => {
                    if (chainStore.hasChain(chainId)) {
                      const chainInfo = chainStore.getChain(chainId);
                      const coins = coinDenoms?.reduce(
                        (coinsAcc, coinDenom) => {
                          const matchedCurrency = chainInfo.currencies.find(
                            (currency) => currency.coinDenom === coinDenom
                          );

                          if (matchedCurrency) {
                            const currencyCode = matchedCurrency.coinDenom;
                            coinsAcc[currencyCode] = {
                              address: chainStore.isEvmChain(chainId)
                                ? accountStore.getAccount(chainId)
                                    .ethereumHexAddress
                                : accountStore.getAccount(chainId)
                                    .bech32Address,
                            };
                          }

                          return coinsAcc;
                        },
                        {} as Record<string, { address: string }>
                      );

                      return {
                        coins: {
                          ...finalAcc.coins,
                          ...coins,
                        },
                      };
                    }

                    return finalAcc;
                  },
                  {
                    coins: {},
                  }
                )
              )
            ),
            cryptoCurrencyList: buySupportCoinDenoms,
            defaultCryptoCurrency: selectedCoinDenom ?? buySupportCoinDenoms[0],
          };
        case "kado":
          const kadoBuySupportModularChainInfos = Object.keys(
            serviceInfo.buySupportCoinDenomsByChainId
          )
            .filter((chainId) => chainStore.hasChain(chainId))
            .map((chainId) => chainStore.getChain(chainId));
          const selectedChainName = selectedTokenInfo
            ? kadoBuySupportModularChainInfos.find(
                (chainInfo) => chainInfo.chainId === selectedTokenInfo.chainId
              )?.chainName
            : undefined;

          return {
            apiKey: process.env["KEPLR_EXT_KADO_API_KEY"] ?? serviceInfo.apiKey,
            product: "BUY",
            networkList: kadoBuySupportModularChainInfos.map((chainInfo) =>
              chainInfo.chainName.toUpperCase()
            ),
            cryptoList: buySupportCoinDenoms,
            onRevCurrency: selectedCoinDenom ?? buySupportCoinDenoms[0],
            network:
              selectedChainName ??
              kadoBuySupportModularChainInfos[0].chainName.toUpperCase(),
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
  });

  const moonpayServiceInfo = buySupportServiceInfos?.find(
    (serviceInfo) => serviceInfo.serviceId === "moonpay"
  );
  const moonpaySignResult = moonpayServiceInfo?.buyUrl
    ? queriesStore.simpleQuery.queryGet<string>(
        process.env["KEPLR_EXT_CONFIG_SERVER"] || "",
        `/api/moonpay-sign?url=${encodeURIComponent(moonpayServiceInfo.buyUrl)}`
      )
    : undefined;
  const moonpaySignedUrl = moonpaySignResult?.response?.data;

  return (
    buySupportServiceInfos?.map((serviceInfo) => ({
      ...serviceInfo,
      ...(serviceInfo.serviceId === "moonpay" &&
        moonpaySignResult &&
        !moonpaySignResult.error &&
        moonpaySignedUrl && {
          buyUrl: moonpaySignedUrl,
        }),
    })) ?? []
  );
};

const getCurrencyCodeForMoonpay = (coinDenom: string | undefined) => {
  if (!coinDenom) {
    return undefined;
  }

  switch (coinDenom) {
    case "DYDX":
      return "dydx_dydx";
    case "INJ":
      return "inj_inj";
    default:
      return coinDenom.toLowerCase();
  }
};
