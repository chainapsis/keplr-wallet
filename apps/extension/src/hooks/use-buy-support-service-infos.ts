import { AppCurrency } from "@keplr-wallet/types";
import { FiatOnRampServiceInfo } from "../config.ui";
import { useStore } from "../stores";
import { createHmac } from "crypto";

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
        case "swapped":
          const walletAddress = (() => {
            const seenCoinDenoms = new Set<string>();

            return Object.entries(serviceInfo.buySupportCoinDenomsByChainId)
              .reduce<string[]>((pairs, [chainId, coinDenoms]) => {
                if (!coinDenoms) return pairs;

                const modularChainInfo = chainStore.modularChainInfos.find(
                  (modularChainInfo) => modularChainInfo.chainId === chainId
                );

                if (chainStore.hasChain(chainId)) {
                  const address = chainStore.isEvmChain(chainId)
                    ? accountStore.getAccount(chainId).ethereumHexAddress
                    : accountStore.getAccount(chainId).bech32Address;

                  coinDenoms.forEach((coinDenom) => {
                    if (!seenCoinDenoms.has(coinDenom)) {
                      pairs.push(`${coinDenom}:${address}`);
                      seenCoinDenoms.add(coinDenom);
                    }
                  });
                } else if (modularChainInfo && "bitcoin" in modularChainInfo) {
                  const account = accountStore.getAccount(
                    modularChainInfo.chainId
                  );
                  const coinDenom = coinDenoms[0];
                  if (account.bitcoinAddress) {
                    if (!seenCoinDenoms.has(coinDenom)) {
                      pairs.push(
                        `${coinDenom}:${account.bitcoinAddress.bech32Address}`
                      );
                      seenCoinDenoms.add(coinDenom);
                    }
                  }
                }

                return pairs;
              }, [])
              .join(",");
          })();

          return {
            apiKey:
              process.env["KEPLR_EXT_SWAPPED_API_KEY"] ?? serviceInfo.apiKey,
            currencyCode: "USDC_NOBLE",
            walletAddress,
          };
        default:
          return;
      }
    })();
    const buyUrl = (() => {
      if (!buyUrlParams) {
        return undefined;
      }

      const originalUrl = `${serviceInfo.buyOrigin}?${Object.entries(
        buyUrlParams
      )
        .map((paramKeyValue) => paramKeyValue.join("="))
        .join("&")}`;

      if (serviceInfo.serviceId === "swapped") {
        try {
          const signature = createHmac(
            "sha256",
            process.env["KEPLR_EXT_SWAPPED_API_SECRET"] as string
          )
            .update(new URL(originalUrl).search)
            .digest("base64");

          return `${originalUrl}&signature=${encodeURIComponent(signature)}`;
        } catch (e) {
          console.error(e);
          return originalUrl;
        }
      }

      return originalUrl;
    })();

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
