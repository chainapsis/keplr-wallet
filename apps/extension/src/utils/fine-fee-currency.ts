import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import {
  AccountSetBase,
  AgoricQueries,
  CoinGeckoPriceStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  IChainInfoImpl,
  ICNSQueries,
  NobleAccount,
  NobleQueries,
  OsmosisQueries,
  QueriesStore,
  SecretAccount,
  SecretQueries,
} from "@keplr-wallet/stores";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";
import { FeeCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { TokenContractsQueries } from "../stores/token-contracts";
import { EthereumQueries } from "@keplr-wallet/stores-eth";
const zeroDec = new Dec(0);

// feemarket feature가 있는 경우 이후의 로직에서 사용할 수 있는 fee currency를 찾아야하기 때문에 undefined로 시작시킨다.
export const findFeeCurrency = async ({
  chainInfo,
  queriesStore,
  account,
  priceStore,
}: {
  chainInfo: IChainInfoImpl<ChainInfoWithCoreTypes>;
  queriesStore: QueriesStore<
    [
      AgoricQueries,
      CosmosQueries,
      CosmwasmQueries,
      SecretQueries,
      OsmosisQueries,
      KeplrETCQueries,
      ICNSQueries,
      TokenContractsQueries,
      EthereumQueries,
      NobleQueries
    ]
  >;
  account: AccountSetBase &
    CosmosAccount &
    CosmwasmAccount &
    SecretAccount &
    NobleAccount;
  priceStore: CoinGeckoPriceStore;
}) => {
  let feeCurrency = chainInfo.hasFeature("feemarket")
    ? undefined
    : chainInfo.feeCurrencies.find(
        (cur) =>
          cur.coinMinimalDenom === chainInfo.stakeCurrency?.coinMinimalDenom
      );
  const chainId = chainInfo.chainId;
  const queries = queriesStore.get(chainId);
  if (!feeCurrency) {
    let prev:
      | {
          balance: CoinPretty;
          price: PricePretty | undefined;
        }
      | undefined;

    const feeCurrencies = await (async () => {
      if (chainInfo.hasFeature("feemarket")) {
        const queryFeeMarketGasPrices =
          queriesStore.get(chainId).cosmos.queryFeeMarketGasPrices;
        await queryFeeMarketGasPrices.waitFreshResponse();

        const result: FeeCurrency[] = [];

        for (const gasPrice of queryFeeMarketGasPrices.gasPrices) {
          const currency = await chainInfo.findCurrencyAsync(gasPrice.denom);
          if (currency) {
            let multiplication = {
              low: 1.1,
              average: 1.2,
              high: 1.3,
            };

            const multificationConfig = queriesStore.simpleQuery.queryGet<{
              [str: string]:
                | {
                    low: number;
                    average: number;
                    high: number;
                  }
                | undefined;
            }>(
              "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws",
              "/feemarket/info.json"
            );

            if (multificationConfig.response) {
              const _default = multificationConfig.response.data["__default__"];
              if (
                _default &&
                _default.low != null &&
                typeof _default.low === "number" &&
                _default.average != null &&
                typeof _default.average === "number" &&
                _default.high != null &&
                typeof _default.high === "number"
              ) {
                multiplication = {
                  low: _default.low,
                  average: _default.average,
                  high: _default.high,
                };
              }
              const specific =
                multificationConfig.response.data[chainInfo.chainIdentifier];
              if (
                specific &&
                specific.low != null &&
                typeof specific.low === "number" &&
                specific.average != null &&
                typeof specific.average === "number" &&
                specific.high != null &&
                typeof specific.high === "number"
              ) {
                multiplication = {
                  low: specific.low,
                  average: specific.average,
                  high: specific.high,
                };
              }
            }

            result.push({
              ...currency,
              gasPriceStep: {
                low: parseFloat(
                  new Dec(multiplication.low).mul(gasPrice.amount).toString()
                ),
                average: parseFloat(
                  new Dec(multiplication.average)
                    .mul(gasPrice.amount)
                    .toString()
                ),
                high: parseFloat(
                  new Dec(multiplication.high).mul(gasPrice.amount).toString()
                ),
              },
            });
          }
        }

        return result;
      } else {
        return chainInfo.feeCurrencies;
      }
    })();
    for (const chainFeeCurrency of feeCurrencies) {
      const currency = await chainInfo.findCurrencyAsync(
        chainFeeCurrency.coinMinimalDenom
      );
      if (currency) {
        const balance = queries.queryBalances
          .getQueryBech32Address(account.bech32Address)
          .getBalance(currency);
        if (balance && balance.balance.toDec().gt(zeroDec)) {
          const price = await priceStore.waitCalculatePrice(
            balance.balance,
            "usd"
          );

          if (!prev) {
            feeCurrency = {
              ...chainFeeCurrency,
              ...currency,
            };
            prev = {
              balance: balance.balance,
              price,
            };
          } else {
            if (!prev.price) {
              if (prev.balance.toDec().lt(balance.balance.toDec())) {
                feeCurrency = {
                  ...chainFeeCurrency,
                  ...currency,
                };
                prev = {
                  balance: balance.balance,
                  price,
                };
              }
            } else if (price) {
              if (prev.price.toDec().lt(price.toDec())) {
                feeCurrency = {
                  ...chainFeeCurrency,
                  ...currency,
                };
                prev = {
                  balance: balance.balance,
                  price,
                };
              }
            }
          }
        }
      }
    }
  }

  return feeCurrency;
};
