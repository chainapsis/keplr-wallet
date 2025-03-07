import { useIntl } from "react-intl";
import { useStore } from "../../stores";
import { DefaultGasPriceStep } from "@keplr-wallet/hooks";
import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import {
  AminoSignResponse,
  BroadcastMode,
  FeeCurrency,
  StdSignDoc,
} from "@keplr-wallet/types";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import {
  PrivilegeCosmosSignAminoWithdrawRewardsMsg,
  SendTxMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { isSimpleFetchError } from "@keplr-wallet/simple-fetch";
import { ClaimAllEachState } from "./use-claim-all-each-state";
import { useNotification } from "../notification";
import { useNavigate } from "react-router";
import { NOBLE_CHAIN_ID } from "../../config.ui";
import { MakeTxResponse } from "@keplr-wallet/stores";

const zeroDec = new Dec(0);
// TODO: Add below property to config.ui.ts
const defaultGasPerDelegation = 140000;

export const useCosmosClaimRewards = () => {
  const { accountStore, chainStore, queriesStore, priceStore, analyticsStore } =
    useStore();
  const intl = useIntl();
  const navigate = useNavigate();
  const notification = useNotification();

  const handleCosmosClaimAllEach = (
    chainId: string,
    rewardToken: CoinPretty,
    state: ClaimAllEachState
  ) => {
    const chainInfo = chainStore.getChain(chainId);
    const account = accountStore.getAccount(chainId);
    if (!account.bech32Address) {
      return;
    }

    const queries = queriesStore.get(chainId);

    const txOrNull = (() => {
      if (
        chainId === NOBLE_CHAIN_ID &&
        rewardToken.currency.coinMinimalDenom === "uusdn"
      ) {
        return account.noble.makeClaimYieldTx("withdrawRewards");
      } else {
        const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
          account.bech32Address
        );

        const validatorAddresses =
          queryRewards.getDescendingPendingRewardValidatorAddresses(
            account.isNanoLedger ? 5 : 8
          );

        if (validatorAddresses.length === 0) {
          return;
        }

        return account.cosmos.makeWithdrawDelegationRewardTx(
          validatorAddresses
        );
      }
    })();

    if (!txOrNull) {
      return;
    }

    const tx = txOrNull;

    state.setIsLoading(true);

    (async () => {
      // feemarket feature가 있는 경우 이후의 로직에서 사용할 수 있는 fee currency를 찾아야하기 때문에 undefined로 시작시킨다.
      let feeCurrency = chainInfo.hasFeature("feemarket")
        ? undefined
        : chainInfo.feeCurrencies.find(
            (cur) =>
              cur.coinMinimalDenom === chainInfo.stakeCurrency?.coinMinimalDenom
          );

      if (chainInfo.hasFeature("osmosis-base-fee-beta") && feeCurrency) {
        const queryBaseFee = queriesStore.get(chainInfo.chainId).osmosis
          .queryBaseFee;
        const queryRemoteBaseFeeStep = queriesStore.simpleQuery.queryGet<{
          low?: number;
          average?: number;
          high?: number;
        }>(
          "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws/osmosis/osmosis-base-fee-beta.json"
        );

        await queryBaseFee.waitFreshResponse();
        await queryRemoteBaseFeeStep.waitFreshResponse();

        const baseFee = queryBaseFee.baseFee;
        const remoteBaseFeeStep = queryRemoteBaseFeeStep.response;
        if (baseFee) {
          const low = remoteBaseFeeStep?.data.low
            ? parseFloat(
                baseFee.mul(new Dec(remoteBaseFeeStep.data.low)).toString(8)
              )
            : feeCurrency.gasPriceStep?.low ?? DefaultGasPriceStep.low;
          const average = Math.max(
            low,
            remoteBaseFeeStep?.data.average
              ? parseFloat(
                  baseFee
                    .mul(new Dec(remoteBaseFeeStep.data.average))
                    .toString(8)
                )
              : feeCurrency.gasPriceStep?.average ?? DefaultGasPriceStep.average
          );
          const high = Math.max(
            average,
            remoteBaseFeeStep?.data.high
              ? parseFloat(
                  baseFee.mul(new Dec(remoteBaseFeeStep.data.high)).toString(8)
                )
              : feeCurrency.gasPriceStep?.high ?? DefaultGasPriceStep.high
          );

          feeCurrency = {
            ...feeCurrency,
            gasPriceStep: {
              low,
              average,
              high,
            },
          };
        }
      }

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
              const currency = await chainInfo.findCurrencyAsync(
                gasPrice.denom
              );
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
                  const _default =
                    multificationConfig.response.data["__default__"];
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
                    multificationConfig.response.data[
                      chainInfo.chainIdentifier
                    ];
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
                      new Dec(multiplication.low)
                        .mul(gasPrice.amount)
                        .toString()
                    ),
                    average: parseFloat(
                      new Dec(multiplication.average)
                        .mul(gasPrice.amount)
                        .toString()
                    ),
                    high: parseFloat(
                      new Dec(multiplication.high)
                        .mul(gasPrice.amount)
                        .toString()
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

      if (feeCurrency) {
        try {
          const simulated = await tx.simulate();

          // Gas adjustment is 1.5
          // Since there is currently no convenient way to adjust the gas adjustment on the UI,
          // Use high gas adjustment to prevent failure.
          const adjustment = chainId === NOBLE_CHAIN_ID ? 1.8 : 1.5;
          const gasEstimated = new Dec(
            simulated.gasUsed * adjustment
          ).truncate();
          let fee = {
            denom: feeCurrency.coinMinimalDenom,
            amount: new Dec(feeCurrency.gasPriceStep?.average ?? 0.025)
              .mul(new Dec(gasEstimated))
              .roundUp()
              .toString(),
          };

          // USD 기준으로 average fee가 0.2달러를 넘으면 low로 설정해서 보낸다.
          const averageFeePrice = await priceStore.waitCalculatePrice(
            new CoinPretty(feeCurrency, fee.amount),
            "usd"
          );
          if (averageFeePrice && averageFeePrice.toDec().gte(new Dec(0.2))) {
            fee = {
              denom: feeCurrency.coinMinimalDenom,
              amount: new Dec(feeCurrency.gasPriceStep?.low ?? 0.025)
                .mul(new Dec(gasEstimated))
                .roundUp()
                .toString(),
            };
            console.log(
              `(${chainId}) Choose low gas price because average fee price is greater or equal than 0.2 USD`
            );
          }

          // Ensure fee currency fetched before querying balance
          const feeCurrencyFetched = await chainInfo.findCurrencyAsync(
            feeCurrency.coinMinimalDenom
          );
          if (!feeCurrencyFetched) {
            throw new Error(
              intl.formatMessage({
                id: "error.can-not-find-balance-for-fee-currency",
              })
            );
          }
          const balance = queries.queryBalances
            .getQueryBech32Address(account.bech32Address)
            .getBalance(feeCurrencyFetched);

          if (!balance) {
            state.setFailedReason(
              new Error(
                intl.formatMessage({
                  id: "error.can-not-find-balance-for-fee-currency",
                })
              )
            );
            return;
          }

          await balance.waitResponse();

          if (
            new Dec(balance.balance.toCoin().amount).lt(new Dec(fee.amount))
          ) {
            state.setFailedReason(
              new Error(
                intl.formatMessage({
                  id: "error.not-enough-balance-to-pay-fee",
                })
              )
            );
            return;
          }

          if (
            (rewardToken.toCoin().denom === fee.denom &&
              new Dec(rewardToken.toCoin().amount).lte(new Dec(fee.amount))) ||
            (await (async () => {
              if (rewardToken.toCoin().denom !== fee.denom) {
                if (
                  rewardToken.currency.coinGeckoId &&
                  feeCurrencyFetched.coinGeckoId
                ) {
                  const rewardPrice = await priceStore.waitCalculatePrice(
                    rewardToken,
                    "usd"
                  );
                  const feePrice = await priceStore.waitCalculatePrice(
                    new CoinPretty(feeCurrencyFetched, fee.amount),
                    "usd"
                  );
                  if (
                    rewardPrice &&
                    rewardPrice.toDec().gt(zeroDec) &&
                    feePrice &&
                    feePrice.toDec().gt(zeroDec)
                  ) {
                    if (
                      rewardPrice
                        .toDec()
                        .mul(new Dec(1.2))
                        .lte(feePrice.toDec())
                    ) {
                      return true;
                    }
                  }
                }
              }

              return false;
            })())
          ) {
            console.log(
              `(${chainId}) Skip claim rewards. Fee: ${fee.amount}${
                fee.denom
              } is greater than stakable reward: ${
                rewardToken.toCoin().amount
              }${rewardToken.toCoin().denom}`
            );
            throw new Error(
              intl.formatMessage({
                id: "error.claimable-reward-is-smaller-than-the-required-fee",
              })
            );
          }

          await tx.send(
            {
              gas: gasEstimated.toString(),
              amount: [fee],
            },
            "",
            {
              signAmino: async (
                chainId: string,
                signer: string,
                signDoc: StdSignDoc
              ): Promise<AminoSignResponse> => {
                const requester = new InExtensionMessageRequester();

                return await requester.sendMessage(
                  BACKGROUND_PORT,
                  new PrivilegeCosmosSignAminoWithdrawRewardsMsg(
                    chainId,
                    signer,
                    signDoc
                  )
                );
              },
              sendTx: async (
                chainId: string,
                tx: Uint8Array,
                mode: BroadcastMode
              ): Promise<Uint8Array> => {
                const requester = new InExtensionMessageRequester();

                return await requester.sendMessage(
                  BACKGROUND_PORT,
                  new SendTxMsg(chainId, tx, mode, true)
                );
              },
            },
            {
              onBroadcasted: () => {
                analyticsStore.logEvent("complete_claim_all", {
                  chainId: chainInfo.chainId,
                  chainName: chainInfo.chainName,
                });
              },
              onFulfill: (tx: any) => {
                // Tx가 성공한 이후에 rewards가 다시 쿼리되면서 여기서 빠지는게 의도인데...
                // 쿼리하는 동안 시간차가 있기 때문에 훼이크로 그냥 1초 더 기다린다.
                setTimeout(() => {
                  state.setIsLoading(false);
                }, 1000);

                if (tx.code) {
                  state.setFailedReason(new Error(tx["raw_log"]));
                }
              },
            }
          );
        } catch (e) {
          if (isSimpleFetchError(e) && e.response) {
            const response = e.response;
            if (
              response.status === 400 &&
              response.data?.message &&
              typeof response.data.message === "string" &&
              response.data.message.includes("invalid empty tx")
            ) {
              state.setFailedReason(
                new Error(
                  intl.formatMessage({
                    id: "error.outdated-cosmos-sdk",
                  })
                )
              );
              return;
            }
          }

          state.setFailedReason(e);
          console.log(e);
          return;
        }
      } else {
        state.setFailedReason(
          new Error(
            intl.formatMessage({
              id: "error.can-not-find-fee-for-claim-all",
            })
          )
        );
        return;
      }
    })();
  };

  const handleCosmosClaimSingle = async (
    chainId: string,
    state: ClaimAllEachState
  ) => {
    const cosmosChainInfo = chainStore.getChain(chainId);
    const account = accountStore.getAccount(chainId);
    if (!account.bech32Address) {
      return;
    }

    analyticsStore.logEvent("click_claim", {
      chainId: cosmosChainInfo.chainId,
      chainName: cosmosChainInfo.chainName,
    });

    if (state.failedReason) {
      state.setFailedReason(undefined);
      return;
    }

    const queries = queriesStore.get(chainId);
    const txAndGasOrNull: { tx: MakeTxResponse; gas: Int } | undefined =
      (() => {
        if (
          chainId === NOBLE_CHAIN_ID
          // XXX: 흠 뭐 noble은 어차피 staking이 안되기 때문에
          //      밑의 처리를 하려면 interface를 바꿔야하는데 굳이 그럴 필요는 없을 것 같아서 그냥 주석 처리...
          // && viewToken.token.currency.coinMinimalDenom === "uusdn"
        ) {
          const tx = account.noble.makeClaimYieldTx("withdrawRewards");
          return {
            tx,
            gas: new Int(100000),
          };
        } else {
          const queryRewards =
            queries.cosmos.queryRewards.getQueryBech32Address(
              account.bech32Address
            );

          const validatorAddresses =
            queryRewards.getDescendingPendingRewardValidatorAddresses(
              account.isNanoLedger ? 5 : 8
            );

          if (validatorAddresses.length === 0) {
            return;
          }
          const tx =
            account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

          const gas = new Int(
            validatorAddresses.length * defaultGasPerDelegation
          );
          return {
            tx,
            gas,
          };
        }
      })();

    if (!txAndGasOrNull) {
      return;
    }

    const tx = txAndGasOrNull.tx;
    let gas = txAndGasOrNull.gas;

    try {
      state.setIsSimulating(true);

      const simulated = await tx.simulate();

      // Gas adjustment is 1.5
      // Since there is currently no convenient way to adjust the gas adjustment on the UI,
      // Use high gas adjustment to prevent failure.
      const adjustment = chainId === NOBLE_CHAIN_ID ? 1.8 : 1.5;
      gas = new Dec(simulated.gasUsed * adjustment).truncate();
    } catch (e) {
      console.log(e);
    }

    // TODO: gas price step이 고정되어있지 않은 경우에 대해서 처리 해야함 ex) osmosis-base-fee-beta

    try {
      await tx.send(
        {
          gas: gas.toString(),
          amount: [],
        },
        "",
        {},
        {
          onBroadcasted: () => {
            analyticsStore.logEvent("complete_claim", {
              chainId: cosmosChainInfo.chainId,
              chainName: cosmosChainInfo.chainName,
            });
          },
          onFulfill: (tx: any) => {
            if (tx.code != null && tx.code !== 0) {
              console.log(tx.log ?? tx.raw_log);
              notification.show(
                "failed",
                intl.formatMessage({ id: "error.transaction-failed" }),
                ""
              );
              return;
            }
            notification.show(
              "success",
              intl.formatMessage({
                id: "notification.transaction-success",
              }),
              ""
            );
          },
        }
      );

      navigate("/", {
        replace: true,
      });
    } catch (e) {
      if (e?.message === "Request rejected") {
        return;
      }

      console.log(e);
      notification.show(
        "failed",
        intl.formatMessage({ id: "error.transaction-failed" }),
        ""
      );
      navigate("/", {
        replace: true,
      });
    } finally {
      state.setIsSimulating(false);
    }
  };

  return {
    handleCosmosClaimAllEach,
    handleCosmosClaimSingle,
  };
};
