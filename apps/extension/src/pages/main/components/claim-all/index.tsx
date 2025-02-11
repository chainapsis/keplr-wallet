import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { Body2, Subtitle2, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { ViewToken } from "../../index";
import styled, { css, useTheme } from "styled-components";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  WarningIcon,
} from "../../../../components/icon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import {
  AminoSignResponse,
  AppCurrency,
  BroadcastMode,
  Coin,
  FeeCurrency,
  StdSignDoc,
} from "@keplr-wallet/types";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  PrivilegeCosmosSignAminoWithdrawRewardsMsg,
  PrivilegeStarknetSignClaimRewardsMsg,
  SendTxMsg,
} from "@keplr-wallet/background";
import { action, makeObservable, observable } from "mobx";
import { Tooltip } from "../../../../components/tooltip";
import { isSimpleFetchError } from "@keplr-wallet/simple-fetch";
import { useNotification } from "../../../../hooks/notification";
import { useNavigate } from "react-router";
import { Skeleton } from "../../../../components/skeleton";
import { YAxis } from "../../../../components/axis";
import Color from "color";
import { SpecialButton } from "../../../../components/special-button";
import { Gutter } from "../../../../components/gutter";
import { FormattedMessage, useIntl } from "react-intl";
import { CurrencyImageFallback } from "../../../../components/image";
import { DefaultGasPriceStep } from "@keplr-wallet/hooks";
import { IChainInfoImpl, MakeTxResponse } from "@keplr-wallet/stores";
import { Call, CallData, num } from "starknet";

interface ClaimToken extends ViewToken {
  onClaimAll: (chainId: string, token: CoinPretty) => void | Promise<void>;
  onClaim?: (chainId: string, token: CoinPretty) => void | Promise<void>;
}

const Styles = {
  Container: styled.div<{ isNotReady?: boolean }>`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette.white
        : ColorPalette["gray-650"]};

    box-shadow: ${(props) =>
      props.theme.mode === "light" && !props.isNotReady
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none"};
    padding: 0.75rem 0 0 0;
    border-radius: 0.375rem;
  `,
  ExpandButton: styled(Box)<{ viewTokenCount: number }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 1.5rem;

    cursor: pointer;

    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;

    ${({ viewTokenCount }) => {
      if (viewTokenCount === 0) {
        return css`
          cursor: not-allowed;
        `;
      }

      return css`
        :hover {
          background-color: ${(props) =>
            props.theme.mode === "light"
              ? ColorPalette["gray-10"]
              : Color(ColorPalette["gray-600"]).alpha(0.5).toString()};
        }

        :active {
          background-color: ${(props) =>
            props.theme.mode === "light"
              ? ColorPalette["gray-50"]
              : ColorPalette["gray-500"]};
        }
      `;
    }};
  `,
};

// XXX: 좀 이상하긴 한데 상위/하위 컴포넌트가 state를 공유하기 쉽게하려고 이렇게 한다...
class ClaimAllEachState {
  @observable
  isLoading: boolean = false;

  @observable
  failedReason: Error | undefined = undefined;

  constructor() {
    makeObservable(this);
  }

  @action
  setIsLoading(value: boolean): void {
    this.isLoading = value;
  }

  @action
  setFailedReason(value: Error | undefined): void {
    this.isLoading = false;
    this.failedReason = value;
  }
}

const useClaimAllEachState = () => {
  const { chainStore } = useStore();
  const statesRef = useRef(new Map<string, ClaimAllEachState>());
  const getClaimAllEachState = (chainId: string): ClaimAllEachState => {
    // modular chain의 경우 chainIdentifier가 없다.
    // 따라서 chainId를 사용한다.

    const chainIdentifier = chainStore.hasChain(chainId)
      ? chainStore.getChain(chainId).chainIdentifier
      : chainId;

    if (chainId.startsWith("stark")) {
      console.log("chainIdentifier", chainIdentifier);
    }

    let state = statesRef.current.get(chainIdentifier);
    if (!state) {
      state = new ClaimAllEachState();
      statesRef.current.set(chainIdentifier, state);
    }

    return state;
  };

  return {
    states: statesRef.current.values(),
    getClaimAllEachState,
  };
};

const usePrepareCosmosInnerTx = () => {
  const { queriesStore, priceStore } = useStore();
  const intl = useIntl();

  const prepareFeeCurrency = async (
    chainInfo: IChainInfoImpl,
    bech32Address: string
  ) => {
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
                baseFee.mul(new Dec(remoteBaseFeeStep.data.average)).toString(8)
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
          const queryFeeMarketGasPrices = queriesStore.get(chainInfo.chainId)
            .cosmos.queryFeeMarketGasPrices;
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
          const queries = queriesStore.get(chainInfo.chainId);

          const balance = queries.queryBalances
            .getQueryBech32Address(bech32Address)
            .getBalance(currency);
          if (balance && balance.balance.toDec().gt(new Dec(0))) {
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

  const estimateFee = async (
    chainInfo: IChainInfoImpl,
    feeCurrency: FeeCurrency,
    tx: MakeTxResponse
  ) => {
    const simulated = await tx.simulate();

    // Gas adjustment is 1.5
    // Since there is currently no convenient way to adjust the gas adjustment on the UI,
    // Use high gas adjustment to prevent failure.
    const gasEstimated = new Dec(simulated.gasUsed * 1.5).truncate();
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
        `(${chainInfo.chainId}) Choose low gas price because average fee price is greater or equal than 0.2 USD`
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

    return { gasEstimated, fee, feeCurrencyFetched };
  };

  const checkBalance = async (
    chainInfo: IChainInfoImpl,
    targetToken: CoinPretty,
    fee: Coin,
    feeCurrencyFetched: AppCurrency,
    bech32Address: string
  ) => {
    const queries = queriesStore.get(chainInfo.chainId);
    const balance = queries.queryBalances
      .getQueryBech32Address(bech32Address)
      .getBalance(feeCurrencyFetched);

    if (!balance) {
      throw new Error(
        intl.formatMessage({
          id: "error.can-not-find-balance-for-fee-currency",
        })
      );
    }

    await balance.waitResponse();

    if (new Dec(balance.balance.toCoin().amount).lt(new Dec(fee.amount))) {
      throw new Error(
        intl.formatMessage({
          id: "error.not-enough-balance-to-pay-fee",
        })
      );
    }

    if (
      (targetToken.toCoin().denom === fee.denom &&
        new Dec(targetToken.toCoin().amount).lte(new Dec(fee.amount))) ||
      (await (async () => {
        if (targetToken.toCoin().denom !== fee.denom) {
          if (
            targetToken.currency.coinGeckoId &&
            feeCurrencyFetched.coinGeckoId
          ) {
            const rewardPrice = await priceStore.waitCalculatePrice(
              targetToken,
              "usd"
            );
            const feePrice = await priceStore.waitCalculatePrice(
              new CoinPretty(feeCurrencyFetched, fee.amount),
              "usd"
            );
            if (
              rewardPrice &&
              rewardPrice.toDec().gt(new Dec(0)) &&
              feePrice &&
              feePrice.toDec().gt(new Dec(0))
            ) {
              if (rewardPrice.toDec().mul(new Dec(1.2)).lte(feePrice.toDec())) {
                return true;
              }
            }
          }
        }

        return false;
      })())
    ) {
      console.log(
        `(${chainInfo.chainId}) Skip claim rewards. Fee: ${fee.amount}${
          fee.denom
        } is greater than stakable reward: ${targetToken.toCoin().amount}${
          targetToken.toCoin().denom
        }`
      );
      throw new Error(
        intl.formatMessage({
          id: "error.claimable-reward-is-smaller-than-the-required-fee",
        })
      );
    }
  };

  const execute = async (
    tx: MakeTxResponse,
    gasEstimated: Int,
    fee: Coin,
    onBroadcasted?: (txHash: Uint8Array) => void,
    onFulfill?: (tx: any) => void
  ) => {
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
        onBroadcasted,
        onFulfill,
      }
    );
  };

  return {
    prepareFeeCurrency,
    estimateFee,
    checkBalance,
    execute,
  };
};

const zeroDec = new Dec(0);

export const ClaimAll: FunctionComponent<{ isNotReady?: boolean }> = observer(
  ({ isNotReady }) => {
    const {
      analyticsStore,
      chainStore,
      accountStore,
      queriesStore,
      starknetAccountStore,
      starknetQueriesStore,
      priceStore,
      keyRingStore,
      uiConfigStore,
    } = useStore();
    const intl = useIntl();
    const theme = useTheme();

    const [isExpanded, setIsExpanded] = useState(false);
    const { states, getClaimAllEachState } = useClaimAllEachState();

    const { prepareFeeCurrency, estimateFee, checkBalance, execute } =
      usePrepareCosmosInnerTx();

    const handleCosmosInnerClaim = (chainId: string, token: CoinPretty) => {
      const cosmosChainInfo = chainStore.getChain(chainId);
      const account = accountStore.getAccount(chainId);
      if (!account.bech32Address) {
        return;
      }

      const queries = queriesStore.get(chainId);
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

      const state = getClaimAllEachState(chainId);

      state.setIsLoading(true);

      const tx =
        account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

      (async () => {
        // feemarket feature가 있는 경우 이후의 로직에서 사용할 수 있는 fee currency를 찾아야하기 때문에 undefined로 시작시킨다.
        const feeCurrency = await prepareFeeCurrency(
          cosmosChainInfo,
          account.bech32Address
        );

        if (feeCurrency) {
          try {
            const { gasEstimated, fee, feeCurrencyFetched } = await estimateFee(
              cosmosChainInfo,
              feeCurrency,
              tx
            );

            await checkBalance(
              cosmosChainInfo,
              token,
              fee,
              feeCurrencyFetched,
              account.bech32Address
            );

            const onBroadcasted = () => {
              analyticsStore.logEvent("complete_claim_all", {
                chainId: cosmosChainInfo.chainId,
                chainName: cosmosChainInfo.chainName,
              });
            };

            const onFulfill = (tx: any) => {
              // Tx가 성공한 이후에 rewards가 다시 쿼리되면서 여기서 빠지는게 의도인데...
              // 쿼리하는 동안 시간차가 있기 때문에 훼이크로 그냥 1초 더 기다린다.
              setTimeout(() => {
                state.setIsLoading(false);
              }, 1000);

              if (tx.code) {
                state.setFailedReason(new Error(tx["raw_log"]));
              }
            };

            await execute(tx, gasEstimated, fee, onBroadcasted, onFulfill);
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

    const handleStarknetInnerClaim = (chainId: string, token: CoinPretty) => {
      const starknetChainInfo = chainStore.getModularChain(chainId);
      const account = accountStore.getAccount(chainId);
      if (!account.starknetHexAddress) {
        return;
      }

      const starknetAccount = starknetAccountStore.getAccount(chainId);

      const starknetQueries = starknetQueriesStore.get(chainId);
      const queryValidators = starknetQueries.queryValidators;
      const validators = queryValidators.validators;
      const queryStakingInfo = queryValidators
        .getQueryPoolMemberInfoMap(account.starknetHexAddress)
        ?.getQueryStakingInfo(validators);

      const claimableRewards =
        queryStakingInfo?.getDescendingPendingClaimableRewards(
          account.isNanoLedger ? 5 : 8
        );

      if (!claimableRewards || claimableRewards.length === 0) {
        return;
      }

      const state = getClaimAllEachState(chainId);

      state.setIsLoading(true);

      // build tx
      const calls: Call[] = [];

      for (const claimableReward of claimableRewards) {
        if (claimableReward.poolAddress) {
          calls.push({
            contractAddress: claimableReward.poolAddress,
            calldata: CallData.compile([account.starknetHexAddress]),
            entrypoint: "claim_rewards",
          });
        }
      }

      const currencies = chainStore
        .getModularChainInfoImpl(chainId)
        .getCurrencies("starknet");

      const STRK = currencies.find((c) => c.coinDenom === "STRK");
      const ETH = currencies.find((c) => c.coinDenom === "ETH");

      // estimate fee
      (async () => {
        try {
          const {
            gas_consumed,
            data_gas_consumed,
            gas_price,
            overall_fee,
            resourceBounds,
            unit,
          } = await starknetAccount.estimateInvokeFee(
            account.starknetHexAddress,
            calls,
            "STRK"
          );

          const gasMargin = new Dec(1.2);
          const gasPriceMargin = new Dec(1.5);

          const gasConsumedDec = new Dec(gas_consumed);
          const dataGasConsumedDec = new Dec(data_gas_consumed);
          const sigVerificationGasConsumedDec = new Dec(583);
          const totalGasConsumed = gasConsumedDec
            .add(dataGasConsumedDec)
            .add(sigVerificationGasConsumedDec);

          const gasPriceDec = new Dec(gas_price);
          // overallFee는 (gas_consumed * gas_price + data_gas_consumed * data_gas_price)로 계산됨.
          const overallFeeDec = new Dec(overall_fee);

          const sigVerificationFee =
            sigVerificationGasConsumedDec.mul(gasPriceDec);

          const adjustedOverallFee = overallFeeDec.add(sigVerificationFee);

          const adjustedGasPrice = adjustedOverallFee.quo(totalGasConsumed);

          // Calculate fee values for STRK fee currency.
          let v3Fee:
            | {
                gasPrice: CoinPretty;
                maxGasPrice: CoinPretty;
                gas: Dec;
                maxGas: Dec;
              }
            | undefined;
          if (STRK && unit === "FRI") {
            const gasPrice = new CoinPretty(STRK, adjustedGasPrice);
            const l1Gas = resourceBounds.l1_gas;

            const maxGasForSTRK = adjustedOverallFee
              .quo(gasPriceDec)
              .mul(gasMargin);
            const maxGasPriceForSTRK = gasPrice.mul(gasPriceMargin);

            const maxPricePerUnitForSTRK = new CoinPretty(
              STRK,
              num.hexToDecimalString(l1Gas.max_price_per_unit)
            );

            const finalMaxGasPriceForSTRK = maxPricePerUnitForSTRK
              .sub(maxGasPriceForSTRK)
              .toDec()
              .gt(new Dec(0))
              ? maxPricePerUnitForSTRK
              : maxGasPriceForSTRK;

            v3Fee = {
              gasPrice: new CoinPretty(STRK, adjustedGasPrice),
              maxGasPrice: finalMaxGasPriceForSTRK,
              gas: totalGasConsumed,
              maxGas: maxGasForSTRK,
            };
          }

          // // Calculate fee values for ETH fee currency.
          // let v1Fee:
          //   | {
          //       gasPrice: CoinPretty;
          //       maxGasPrice: CoinPretty;
          //       gas: Dec;
          //       maxGas: Dec;
          //     }
          //   | undefined;
          // if (ETH) {
          //   const gasPriceForETH = new CoinPretty(ETH, adjustedGasPrice);
          //   const l1Gas = resourceBounds.l1_gas;

          //   // maxGasForETH는 (adjustedOverallFee / gasPriceDec) * gasMargin 로 계산.
          //   const maxGasForETH = adjustedOverallFee
          //     .quo(gasPriceDec)
          //     .mul(gasMargin);
          //   const computedMaxGasPriceForETH =
          //     gasPriceForETH.mul(gasPriceMargin);

          //   const maxPricePerUnitForETH = new CoinPretty(
          //     ETH,
          //     num.hexToDecimalString(l1Gas.max_price_per_unit)
          //   );

          //   const finalMaxGasPriceForETH = maxPricePerUnitForETH
          //     .sub(computedMaxGasPriceForETH)
          //     .toDec()
          //     .gt(new Dec(0))
          //     ? maxPricePerUnitForETH
          //     : computedMaxGasPriceForETH;

          //   v1Fee = {
          //     gasPrice: gasPriceForETH,
          //     maxGasPrice: finalMaxGasPriceForETH,
          //     gas: maxGasForETH,
          //     maxGas: maxGasForETH,
          //   };
          // }

          // check balance for fee (Priority: STRK > ETH)
          let fee:
            | {
                version: "v3" | "v1";
                currency: AppCurrency;
                gasPrice: CoinPretty;
                maxGasPrice: CoinPretty;
                gas: Dec;
                maxGas: Dec;
              }
            | undefined;

          if (STRK && v3Fee) {
            // check balance
            const querySTRK =
              starknetQueries.queryStarknetERC20Balance.getBalance(
                chainId,
                chainStore,
                account.starknetHexAddress,
                STRK?.coinMinimalDenom
              );

            const balance = querySTRK?.balance;
            if (balance) {
              const tolerance = v3Fee.maxGasPrice.mul(v3Fee.gas);
              if (balance.sub(tolerance).toDec().gt(zeroDec)) {
                fee = {
                  version: "v3",
                  currency: STRK,
                  ...v3Fee,
                };
              }
            }
          }

          // if (ETH && v1Fee && !fee) {
          //   // check balance
          //   const queryETH =
          //     starknetQueries.queryStarknetERC20Balance.getBalance(
          //       chainId,
          //       chainStore,
          //       account.starknetHexAddress,
          //       ETH?.coinMinimalDenom
          //     );

          //   const balance = queryETH?.balance;
          //   if (balance) {
          //     const tolerance = v1Fee.maxGasPrice.mul(v1Fee.gas);
          //     if (balance.sub(tolerance).toDec().gt(zeroDec)) {
          //       fee = {
          //         version: "v1",
          //         currency: ETH,
          //         ...v1Fee,
          //       };
          //     }
          //   }
          // }

          if (!fee) {
            throw new Error(
              intl.formatMessage({
                id: "error.can-not-find-fee-for-claim-all",
              })
            );
          }

          // check balance for claimable rewards
          // in case fee is ETH, compare the price of claimable rewards and fee.
          const totalClaimableRewards = claimableRewards.reduce((acc, curr) => {
            return acc.add(curr.amount);
          }, new CoinPretty(token.currency, new Dec(0)));

          const feeAmount = fee.maxGasPrice.mul(fee.gas);

          const rewardsPrice = priceStore.calculatePrice(totalClaimableRewards);
          const feePrice = priceStore.calculatePrice(feeAmount);

          if (!rewardsPrice || !feePrice) {
            throw new Error(
              intl.formatMessage({
                id: "error.can-not-find-price-for-claim-all",
              })
            );
          }

          // if the price of claimable rewards is less than the price of fee, throw an error
          if (rewardsPrice.sub(feePrice).toDec().lt(zeroDec)) {
            throw new Error(
              intl.formatMessage({
                id: "error.insufficient-balance",
              })
            );
          }

          // analyticsStore.logEvent("complete_claim_all", {
          //   chainId: starknetChainInfo.chainId,
          //   chainName: starknetChainInfo.chainName,
          // });

          // PrivilegeStarknetSignClaimRewardsMsg

          // const requester = new InExtensionMessageRequester();

          // const msg = new PrivilegeStarknetSignClaimRewardsMsg(
          //   starknetChainInfo.chainId,
          //   calls,
          //   {
          //     version: "0x3",
          //     walletAddress: account.starknetHexAddress,
          //     nonce: 0,
          //   }
          // );

          // execute (TODO: 서명 제거하도록)
          const { transaction_hash: txHash } = await starknetAccount.execute(
            account.starknetHexAddress,
            calls,
            fee.version === "v3"
              ? {
                  type: "STRK",
                  gas: fee.gas.roundUp().toString(),
                  maxGasPrice: fee.maxGasPrice
                    .mul(new Dec(10 ** fee.currency.coinDecimals))
                    .toDec()
                    .roundUp()
                    .toString(),
                }
              : {
                  type: "ETH",
                  maxFee: fee.maxGasPrice
                    .mul(fee.gas)
                    .mul(new Dec(10 ** fee.currency.coinDecimals))
                    .toDec()
                    .roundUp()
                    .toString(),
                },
            async (chainId, calls, details) => {
              const requester = new InExtensionMessageRequester();

              return await requester.sendMessage(
                BACKGROUND_PORT,
                new PrivilegeStarknetSignClaimRewardsMsg(
                  chainId,
                  calls,
                  details
                )
              );
            }
          );

          setTimeout(() => {
            state.setIsLoading(false);
          }, 1000);

          if (!txHash) {
            throw new Error("Failed to claim all");
          }
        } catch (e) {
          state.setFailedReason(e);
          console.log(e);
          return;
        }
      })();

      state.setIsLoading(false);
    };

    const claimTokens: ClaimToken[] = (() => {
      const res: ClaimToken[] = [];
      for (const modularChainInfo of chainStore.modularChainInfos) {
        const chainId = modularChainInfo.chainId;

        if ("cosmos" in modularChainInfo) {
          const chainInfo = chainStore.getChain(chainId);
          const accountAddress = accountStore.getAccount(chainId).bech32Address;
          const queries = queriesStore.get(chainId);
          const queryRewards =
            queries.cosmos.queryRewards.getQueryBech32Address(accountAddress);

          const targetDenom = (() => {
            if (chainInfo.chainIdentifier === "dydx-mainnet") {
              return "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5";
            }

            if (chainInfo.chainIdentifier === "elys") {
              return "ueden";
            }

            return chainInfo.stakeCurrency?.coinMinimalDenom;
          })();

          if (targetDenom) {
            const currency = chainInfo.findCurrency(targetDenom);
            if (currency) {
              const reward = queryRewards.rewards.find(
                (r) => r.currency.coinMinimalDenom === targetDenom
              );
              if (reward) {
                res.push({
                  token: reward,
                  chainInfo: modularChainInfo,
                  isFetching: queryRewards.isFetching,
                  error: queryRewards.error,
                  onClaimAll: handleCosmosInnerClaim,
                });
              }
            }
          }
        } else if ("starknet" in modularChainInfo) {
          if (chainId !== "starknet:SN_MAIN") {
            continue;
          }

          const starknetChainInfo = chainStore.getModularChain(chainId);
          const queryValidators = starknetQueriesStore.get(
            starknetChainInfo.chainId
          ).queryValidators;

          const validators = queryValidators.validators;
          const queryStakingInfo = queryValidators
            .getQueryPoolMemberInfoMap(
              accountStore.getAccount(starknetChainInfo.chainId)
                .starknetHexAddress
            )
            ?.getQueryStakingInfo(validators);

          const totalClaimableRewardAmount =
            queryStakingInfo?.totalClaimableRewardAmount;

          if (totalClaimableRewardAmount?.toDec().gt(zeroDec)) {
            res.push({
              token: totalClaimableRewardAmount,
              chainInfo: starknetChainInfo,
              isFetching: queryStakingInfo?.isFetching ?? false,
              error: queryValidators?.error, // ignore queryStakingInfo error
              onClaimAll: handleStarknetInnerClaim,
            });
          }
        }
      }

      return res
        .filter((viewToken) => viewToken.token.toDec().gt(zeroDec))
        .sort((a, b) => {
          const aPrice = priceStore.calculatePrice(a.token)?.toDec() ?? zeroDec;
          const bPrice = priceStore.calculatePrice(b.token)?.toDec() ?? zeroDec;

          if (aPrice.equals(bPrice)) {
            return 0;
          }
          return aPrice.gt(bPrice) ? -1 : 1;
        })
        .sort((a, b) => {
          const aHasError =
            getClaimAllEachState(a.chainInfo.chainId).failedReason != null;
          const bHasError =
            getClaimAllEachState(b.chainInfo.chainId).failedReason != null;

          if (aHasError || bHasError) {
            if (aHasError && bHasError) {
              return 0;
            } else if (aHasError) {
              return 1;
            } else {
              return -1;
            }
          }

          return 0;
        });
    })();

    const totalPrice = (() => {
      const fiatCurrency = priceStore.getFiatCurrency(
        priceStore.defaultVsCurrency
      );
      if (!fiatCurrency) {
        return undefined;
      }

      let res = new PricePretty(fiatCurrency, 0);

      for (const claimToken of claimTokens) {
        const price = priceStore.calculatePrice(claimToken.token);
        if (price) {
          res = res.add(price);
        }
      }

      return res;
    })();

    const isLedger =
      keyRingStore.selectedKeyInfo &&
      keyRingStore.selectedKeyInfo.type === "ledger";

    const isKeystone =
      keyRingStore.selectedKeyInfo &&
      keyRingStore.selectedKeyInfo.type === "keystone";

    const claimAll = () => {
      analyticsStore.logEvent("click_claimAll");

      if (claimTokens.length > 0) {
        setIsExpanded(true);
      }

      if (isLedger || isKeystone) {
        // Ledger에서 현실적으로 이 기능을 처리해주기 난감하다.
        // disable하기보다는 일단 눌렀을때 expand를 시켜주고 아무것도 하지 않는다.
        return;
      }

      for (const claimToken of claimTokens) {
        claimToken.onClaimAll(claimToken.chainInfo.chainId, claimToken.token);
      }
    };

    const claimAllDisabled = (() => {
      if (claimTokens.length === 0) {
        return true;
      }

      for (const claimToken of claimTokens) {
        if (claimToken.token.toDec().gt(new Dec(0))) {
          return false;
        }
      }

      return true;
    })();

    const claimAllIsLoading = (() => {
      for (const chainInfo of chainStore.chainInfosInUI) {
        const state = getClaimAllEachState(chainInfo.chainId);
        if (state.isLoading) {
          return true;
        }
      }
      return false;
    })();

    useEffect(() => {
      if (isExpanded) {
        if (!claimAllIsLoading) {
          // Clear errors when collapsed.
          for (const state of states) {
            state.setFailedReason(undefined);
          }
        }
      }
      // 펼쳐지면서 그 때 loading 중이 아닐 경우에 에러를 지워준다.
      // 펼쳐지는 순간에만 발생해야하기 때문에 claimAllIsLoading는 deps에서 없어야한다.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    return (
      <Styles.Container isNotReady={isNotReady}>
        <Box paddingX="1rem" paddingBottom="0.25rem">
          <Columns sum={1} alignY="center">
            <Stack gutter="0.5rem">
              <YAxis alignX="left">
                <Skeleton layer={1} isNotReady={isNotReady}>
                  <Body2 style={{ color: ColorPalette["gray-300"] }}>
                    <FormattedMessage id="page.main.components.claim-all.title" />
                  </Body2>
                </Skeleton>
              </YAxis>

              <YAxis alignX="left">
                <Skeleton
                  layer={1}
                  isNotReady={isNotReady}
                  dummyMinWidth="5.125rem"
                >
                  <Subtitle2
                    style={{
                      color:
                        theme.mode === "light"
                          ? ColorPalette["gray-700"]
                          : ColorPalette["gray-10"],
                    }}
                  >
                    {uiConfigStore.hideStringIfPrivacyMode(
                      totalPrice ? totalPrice.separator(" ").toString() : "?",
                      3
                    )}
                  </Subtitle2>
                </Skeleton>
              </YAxis>
            </Stack>

            <Column weight={1} />

            <Skeleton type="button" layer={1} isNotReady={isNotReady}>
              {/*
                 ledger일 경우 특수한 행동을 하진 못하고 그냥 collapse를 펼치기만 한다.
                 특수한 기능이 없다는 것을 암시하기 위해서 ledger일때는 일반 버튼으로 처리한다.
               */}
              {isLedger || isKeystone ? (
                <Button
                  text={intl.formatMessage({
                    id: "page.main.components.claim-all.button",
                  })}
                  size="small"
                  isLoading={claimAllIsLoading}
                  disabled={claimAllDisabled}
                  onClick={claimAll}
                />
              ) : (
                <SpecialButton
                  text={intl.formatMessage({
                    id: "page.main.components.claim-all.button",
                  })}
                  size="small"
                  isLoading={claimAllIsLoading}
                  disabled={claimAllDisabled}
                  onClick={claimAll}
                />
              )}
            </Skeleton>
          </Columns>
        </Box>

        <Styles.ExpandButton
          paddingX="0.125rem"
          alignX="center"
          viewTokenCount={claimTokens.length}
          onClick={() => {
            analyticsStore.logEvent("click_claimExpandButton");
            if (claimTokens.length > 0) {
              setIsExpanded(!isExpanded);
            }
          }}
        >
          <Box
            style={{
              opacity: isNotReady ? 0 : 1,
            }}
          >
            {!isExpanded ? (
              <ArrowDownIcon
                width="1.25rem"
                height="1.25rem"
                color={ColorPalette["gray-300"]}
              />
            ) : (
              <ArrowUpIcon
                width="1.25rem"
                height="1.25rem"
                color={ColorPalette["gray-300"]}
              />
            )}
          </Box>
        </Styles.ExpandButton>

        <VerticalCollapseTransition
          collapsed={!isExpanded}
          onTransitionEnd={() => {
            if (!isExpanded) {
              if (!claimAllIsLoading) {
                // Clear errors when collapsed.
                for (const state of states) {
                  state.setFailedReason(undefined);
                }
              }
            }
          }}
        >
          {claimTokens.map((claimToken) => {
            const state = getClaimAllEachState(claimToken.chainInfo.chainId);

            if (claimToken.chainInfo.chainId.startsWith("stark")) {
              console.log(
                claimToken.chainInfo.chainId,
                state.isLoading,
                state.failedReason
              );
            }
            return (
              <ClaimTokenItem
                key={`${claimToken.chainInfo.chainId}-${claimToken.token.currency.coinMinimalDenom}`}
                viewToken={claimToken}
                state={getClaimAllEachState(claimToken.chainInfo.chainId)}
                itemsLength={claimTokens.length}
              />
            );
          })}
        </VerticalCollapseTransition>
      </Styles.Container>
    );
  }
);

// TODO: 상위 컴포넌트에서 claim 함수를 전달해주는 방식으로 변경
const ClaimTokenItem: FunctionComponent<{
  viewToken: ViewToken;
  state: ClaimAllEachState;

  itemsLength: number;
}> = observer(({ viewToken, state, itemsLength }) => {
  const { analyticsStore, accountStore, queriesStore, uiConfigStore } =
    useStore();

  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();
  const notification = useNotification();

  const [isSimulating, setIsSimulating] = useState(false);

  // TODO: Add below property to config.ui.ts
  const defaultGasPerDelegation = 140000;

  const claim = async () => {
    analyticsStore.logEvent("click_claim", {
      chainId: viewToken.chainInfo.chainId,
      chainName: viewToken.chainInfo.chainName,
    });

    if (state.failedReason) {
      state.setFailedReason(undefined);
      return;
    }
    const chainId = viewToken.chainInfo.chainId;
    const account = accountStore.getAccount(chainId);

    const queries = queriesStore.get(chainId);
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

    const tx =
      account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

    let gas = new Int(validatorAddresses.length * defaultGasPerDelegation);

    try {
      setIsSimulating(true);

      const simulated = await tx.simulate();

      // Gas adjustment is 1.5
      // Since there is currently no convenient way to adjust the gas adjustment on the UI,
      // Use high gas adjustment to prevent failure.
      gas = new Dec(simulated.gasUsed * 1.5).truncate();
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
              chainId: viewToken.chainInfo.chainId,
              chainName: viewToken.chainInfo.chainName,
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
      setIsSimulating(false);
    }
  };

  const isLoading =
    accountStore.getAccount(viewToken.chainInfo.chainId).isSendingMsg ===
      "withdrawRewards" ||
    state.isLoading ||
    isSimulating;

  return (
    <Box padding="1rem">
      <Columns sum={1} alignY="center">
        {viewToken.token.currency.coinImageUrl && (
          <CurrencyImageFallback
            chainInfo={viewToken.chainInfo}
            currency={viewToken.token.currency}
            size="2rem"
          />
        )}

        <Gutter size="0.75rem" />

        <Column weight={1}>
          <Stack gutter="0.375rem">
            <Subtitle3
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["gray-300"],
              }}
            >
              {(() => {
                if ("paths" in viewToken.token.currency) {
                  const originDenom =
                    viewToken.token.currency.originCurrency?.coinDenom;
                  if (originDenom) {
                    return `${originDenom} (${viewToken.chainInfo.chainName})`;
                  }
                }

                return viewToken.token.currency.coinDenom;
              })()}
            </Subtitle3>
            <Subtitle2
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-10"],
              }}
            >
              {uiConfigStore.hideStringIfPrivacyMode(
                viewToken.token
                  .maxDecimals(6)
                  .shrink(true)
                  .inequalitySymbol(true)
                  .hideDenom(true)
                  .toString(),
                2
              )}
            </Subtitle2>
          </Stack>
        </Column>

        <Tooltip
          enabled={!!state.failedReason}
          content={
            state.failedReason?.message || state.failedReason?.toString()
          }
          // 아이템이 한개만 있으면 tooltip이 VerticalCollapseTransition가 overflow: hidden이라
          // 위/아래로 나타나면 가려져서 유저가 오류 메세지를 볼 방법이 없다.
          // VerticalCollapseTransition가 overflow: hidden이여야 하는건 필수적이므로 이 부분을 수정할 순 없기 때문에
          // 대충 아이템이 한개면 tooltip이 왼족에 나타나도록 한다.
          allowedPlacements={itemsLength === 1 ? ["left"] : undefined}
        >
          <Button
            text={intl.formatMessage({
              id: "page.main.components.claim-all.claim-button",
            })}
            size="small"
            color="secondary"
            isLoading={isLoading}
            disabled={viewToken.token.toDec().lte(new Dec(0))}
            textOverrideIcon={
              state.failedReason ? (
                <WarningIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette["gray-200"]}
                />
              ) : undefined
            }
            onClick={claim}
          />
        </Tooltip>
      </Columns>
    </Box>
  );
});
