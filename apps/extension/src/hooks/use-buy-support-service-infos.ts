import { AppCurrency } from "@keplr-wallet/types";
import { FiatOnRampServiceInfo } from "../config.ui";
import { useStore } from "../stores";
import { createHmac } from "crypto";

export interface BuySupportServiceInfo extends FiatOnRampServiceInfo {
  getBuyUrl: (() => Promise<string>) | undefined;
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
                    coinDenom === "USDC" || coinDenom === "USDC_NOBLE"
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
          coinDenom === "USDC" || coinDenom === "USDC_NOBLE"
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
                  if (chainStore.hasModularChain(chainId)) {
                    const currencyCodeMap = coinDenoms?.reduce(
                      (acc, coinDenom) => {
                        const chainInfo =
                          chainStore.getModularChainInfoImpl(chainId);
                        const matchedCurrency = chainInfo
                          .getCurrencies()
                          .find((currency) => currency.coinDenom === coinDenom);
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
            walletAddressesData: encodeURIComponent(
              JSON.stringify(
                Object.entries(
                  serviceInfo.buySupportCoinDenomsByChainId
                ).reduce(
                  (finalAcc, [chainId, coinDenoms]) => {
                    if (chainStore.hasModularChain(chainId)) {
                      const chainInfo =
                        chainStore.getModularChainInfoImpl(chainId);
                      const coins = coinDenoms?.reduce(
                        (coinsAcc, coinDenom) => {
                          const matchedCurrency = chainInfo
                            .getCurrencies()
                            .find(
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

                if (chainStore.hasModularChain(chainId)) {
                  const address =
                    modularChainInfo && "evm" in modularChainInfo
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
    buySupportServiceInfos
      ?.filter((serviceInfo) => {
        if (serviceInfo.serviceId === "moonpay") {
          if (
            moonpaySignResult &&
            !moonpaySignResult.error &&
            moonpaySignedUrl
          ) {
            return true;
          }
          return false;
        }

        return true;
      })
      .map((serviceInfo) => ({
        ...serviceInfo,
        ...(serviceInfo.serviceId === "moonpay" &&
          moonpaySignResult &&
          !moonpaySignResult.error &&
          moonpaySignedUrl && {
            buyUrl: moonpaySignedUrl,
          }),
      }))
      .map((serviceInfo) => {
        return {
          ...serviceInfo,
          getBuyUrl: serviceInfo.buyUrl
            ? async () => {
                if (serviceInfo.serviceId === "transak") {
                  const buyUrl = serviceInfo.buyUrl;
                  if (!buyUrl) {
                    throw new Error("buyUrl is null");
                  }

                  const transakSignResult = queriesStore.simpleQuery.queryGet<{
                    widgetUrl: string;
                  }>(
                    process.env["KEPLR_EXT_CONFIG_SERVER"] || "",
                    `api/transak${buyUrl.replace(serviceInfo.buyOrigin, "")}`
                  );
                  await transakSignResult.waitFreshResponse();
                  const transakSignedUrl =
                    transakSignResult?.response?.data.widgetUrl;
                  if (!transakSignedUrl) {
                    throw new Error("transakSignedUrl is null");
                  }

                  return transakSignedUrl;
                }
                return serviceInfo.buyUrl!;
              }
            : undefined,
        };
      }) ?? []
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
