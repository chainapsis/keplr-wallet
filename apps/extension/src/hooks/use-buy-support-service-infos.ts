import { AppCurrency } from "@keplr-wallet/types";
import { useStore } from "../stores";
import { useEffect, useState } from "react";
import { FiatOnRampServiceInfo } from "../config.ui";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

interface BuySupportServiceInfo extends FiatOnRampServiceInfo {
  buyUrl?: string;
}

export const useBuySupportServiceInfos = (selectedTokenInfo?: {
  chainId: string;
  currency: AppCurrency;
}): BuySupportServiceInfo[] => {
  const { accountStore, chainStore } = useStore();
  const [buySupportServiceInfos, setBuySupportServiceInfos] = useState<
    BuySupportServiceInfo[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const fiatonoffRampResponse = await simpleFetch<{
          list: FiatOnRampServiceInfo[];
        }>(
          "https://raw.githubusercontent.com/chainapsis/keplr-fiat-on-off-ramp-registry/main/fiat-on-off-ramp-list.json"
        );

        const preBuySupportServiceInfos = fiatonoffRampResponse.data.list.map(
          (serviceInfo) => {
            const buySupportCoinDenoms = [
              ...new Set(
                selectedTokenInfo
                  ? Object.entries(serviceInfo.buySupportCoinDenomsByChainId)
                      .filter(
                        ([chainId, coinDenoms]) =>
                          chainId === selectedTokenInfo.chainId &&
                          coinDenoms?.some((coinDenom) =>
                            coinDenom === "USDC"
                              ? selectedTokenInfo.currency.coinDenom.includes(
                                  "USDC"
                                )
                              : coinDenom ===
                                selectedTokenInfo.currency.coinDenom
                          )
                      )
                      .map(([_, coinDenoms]) => coinDenoms)
                      .flat()
                  : Object.values(
                      serviceInfo.buySupportCoinDenomsByChainId
                    ).flat()
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
                      process.env["KEPLR_EXT_MOONPAY_API_KEY"] ??
                      serviceInfo.apiKey,
                    walletAddresses: encodeURIComponent(
                      JSON.stringify(
                        Object.entries(
                          serviceInfo.buySupportCoinDenomsByChainId
                        ).reduce((finalAcc, [chainId, coinDenoms]) => {
                          if (chainStore.hasModularChain(chainId)) {
                            const currencyCodeMap = coinDenoms?.reduce(
                              (acc, coinDenom) => {
                                const modularChainInfo =
                                  chainStore.getModularChain(chainId);
                                const matchedCurrency = (() => {
                                  if ("cosmos" in modularChainInfo) {
                                    return modularChainInfo.cosmos.currencies.find(
                                      (currency) =>
                                        currency.coinDenom === coinDenom
                                    );
                                  }
                                })();

                                if (matchedCurrency) {
                                  const currencyCode = (() => {
                                    switch (matchedCurrency.coinDenom) {
                                      case "DYDX":
                                        return "dydx_dydx";
                                      case "INJ":
                                        return "inj_inj";
                                      default:
                                        return matchedCurrency.coinDenom.toLowerCase();
                                    }
                                  })();

                                  acc[currencyCode] = accountStore.getAccount(
                                    modularChainInfo.chainId
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
                    defaultCurrencyCode:
                      selectedCoinDenom ?? buySupportCoinDenoms[0],
                  };
                case "transak":
                  return {
                    apiKey:
                      process.env["KEPLR_EXT_TRANSAK_API_KEY"] ??
                      serviceInfo.apiKey,
                    hideMenu: "true",
                    walletAddressesData: encodeURIComponent(
                      JSON.stringify(
                        Object.entries(
                          serviceInfo.buySupportCoinDenomsByChainId
                        ).reduce(
                          (finalAcc, [chainId, coinDenoms]) => {
                            if (chainStore.hasModularChain(chainId)) {
                              const modularChainInfo =
                                chainStore.getModularChain(chainId);
                              const coins = coinDenoms?.reduce(
                                (coinsAcc, coinDenom) => {
                                  const matchedCurrency = (() => {
                                    if ("cosmos" in modularChainInfo) {
                                      return modularChainInfo.cosmos.currencies.find(
                                        (currency) =>
                                          currency.coinDenom === coinDenom
                                      );
                                    }
                                  })();

                                  if (matchedCurrency) {
                                    const currencyCode =
                                      matchedCurrency.coinDenom;
                                    coinsAcc[currencyCode] = {
                                      address: chainStore.isEvmOnlyChain(
                                        modularChainInfo.chainId
                                      )
                                        ? accountStore.getAccount(
                                            modularChainInfo.chainId
                                          ).ethereumHexAddress
                                        : accountStore.getAccount(
                                            modularChainInfo.chainId
                                          ).bech32Address,
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
                    defaultCryptoCurrency:
                      selectedCoinDenom ?? buySupportCoinDenoms[0],
                  };
                case "kado":
                  const kadoBuySupportModularChainInfos = Object.keys(
                    serviceInfo.buySupportCoinDenomsByChainId
                  )
                    .filter((chainId) => chainStore.hasModularChain(chainId))
                    .map((chainId) => chainStore.getModularChain(chainId));
                  const selectedChainName = selectedTokenInfo
                    ? kadoBuySupportModularChainInfos.find(
                        (chainInfo) =>
                          chainInfo.chainId === selectedTokenInfo.chainId
                      )?.chainName
                    : undefined;

                  return {
                    apiKey:
                      process.env["KEPLR_EXT_KADO_API_KEY"] ??
                      serviceInfo.apiKey,
                    product: "BUY",
                    networkList: kadoBuySupportModularChainInfos.map(
                      (chainInfo) => chainInfo.chainName.toUpperCase()
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
          }
        );

        // Moonpay buy url should be with signature from server side.
        let moonpayBuyUrlWithSignature: string = "";
        try {
          const moonpayServiceInfo = preBuySupportServiceInfos.find(
            (serviceInfo) => serviceInfo.serviceId === "moonpay"
          );
          const moonpaySignResponse = await simpleFetch<string>(
            process.env["KEPLR_EXT_MOONPAY_SIGN_API_BASE_URL"] ?? "",
            `/api/moonpay-sign?url=${encodeURIComponent(
              moonpayServiceInfo?.buyUrl ?? ""
            )}`
          );
          moonpayBuyUrlWithSignature = moonpaySignResponse.data;
        } catch (e) {
          // If something wrong on the request, just ignore it.
          console.log(e);
        }

        const newBuySupportServiceInfos = preBuySupportServiceInfos.map(
          (serviceInfo) => ({
            ...serviceInfo,
            ...(serviceInfo.serviceId === "moonpay" &&
              moonpayBuyUrlWithSignature && {
                buyUrl: moonpayBuyUrlWithSignature,
              }),
          })
        );

        setBuySupportServiceInfos(newBuySupportServiceInfos);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [accountStore, chainStore, selectedTokenInfo]);

  return buySupportServiceInfos;
};
