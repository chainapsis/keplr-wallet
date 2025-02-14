import { useIntl } from "react-intl";
import { useStore } from "../../stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Call, CallData, num } from "starknet";
import { AppCurrency, ERC20Currency } from "@keplr-wallet/types";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { PrivilegeStarknetSignClaimRewardsMsg } from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { ClaimAllEachState } from "./use-claim-all-each-state";
import { useNavigate } from "react-router";
import { useNotification } from "../notification";

const zeroDec = new Dec(0);

export const useStarknetClaimRewards = () => {
  const {
    analyticsStore,
    chainStore,
    accountStore,
    starknetAccountStore,
    starknetQueriesStore,
    priceStore,
  } = useStore();

  const intl = useIntl();
  const navigate = useNavigate();
  const notification = useNotification();

  const handleStarknetClaimAllEach = (
    chainId: string,
    rewardToken: CoinPretty,
    state: ClaimAllEachState
  ) => {
    const modularChainInfo = chainStore.getModularChain(chainId);
    const account = accountStore.getAccount(chainId);
    if (!account.starknetHexAddress) {
      return;
    }

    const starknetAccount = starknetAccountStore.getAccount(chainId);

    const starknetQueries = starknetQueriesStore.get(chainId);
    const queryStakingInfo = starknetQueries.stakingInfoManager.getStakingInfo(
      account.starknetHexAddress
    );

    const claimableRewards =
      queryStakingInfo?.getDescendingPendingClaimableRewards(
        account.isNanoLedger ? 5 : 8
      );

    if (!claimableRewards || claimableRewards.length === 0) {
      return;
    }

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

    let STRK: ERC20Currency | undefined;
    let ETH: ERC20Currency | undefined;

    if ("starknet" in modularChainInfo) {
      STRK = modularChainInfo.starknet.currencies.find(
        (c) =>
          c.coinMinimalDenom ===
          `erc20:${modularChainInfo.starknet.strkContractAddress}`
      );
      ETH = modularChainInfo.starknet.currencies.find(
        (c) =>
          c.coinMinimalDenom ===
          `erc20:${modularChainInfo.starknet.ethContractAddress}`
      );
    }

    (async () => {
      try {
        // select fee currency
        let feeCurrency = STRK || ETH;
        if (STRK && ETH) {
          // compare the price of balances of STRK and ETH
          const querySTRK =
            starknetQueries.queryStarknetERC20Balance.getBalance(
              chainId,
              chainStore,
              account.starknetHexAddress,
              STRK?.coinMinimalDenom
            );
          const queryETH = starknetQueries.queryStarknetERC20Balance.getBalance(
            chainId,
            chainStore,
            account.starknetHexAddress,
            ETH?.coinMinimalDenom
          );

          const strkBalance = querySTRK?.balance;
          const ethBalance = queryETH?.balance;

          if (strkBalance && ethBalance) {
            const strkPrice = await priceStore.waitCalculatePrice(
              strkBalance,
              "usd"
            );
            const ethPrice = await priceStore.waitCalculatePrice(
              ethBalance,
              "usd"
            );

            if (strkPrice && ethPrice) {
              if (strkPrice.sub(ethPrice).toDec().lt(zeroDec)) {
                feeCurrency = STRK;
              } else {
                feeCurrency = ETH;
              }
            }
          }
        }

        if (!feeCurrency) {
          throw new Error(
            intl.formatMessage({
              id: "error.can-not-find-fee-for-claim-all",
            })
          );
        }

        // estimate fee
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
          feeCurrency.coinDenom === "STRK" ? "STRK" : "ETH"
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

        const gasPrice = new CoinPretty(feeCurrency, adjustedGasPrice);

        let fee:
          | {
              version: "v1" | "v3";
              currency: AppCurrency;
              gasPrice: CoinPretty;
              maxGasPrice: CoinPretty;
              gas: Dec;
              maxGas: Dec;
            }
          | undefined;

        if (feeCurrency.coinDenom === "ETH" && unit === "WEI") {
          const maxGasPriceForETH = gasPrice.mul(gasPriceMargin);
          const maxGasForETH = totalGasConsumed.mul(gasMargin);

          fee = {
            version: "v1",
            currency: feeCurrency,
            gasPrice,
            maxGasPrice: maxGasPriceForETH,
            gas: totalGasConsumed,
            maxGas: maxGasForETH,
          };
        } else if (feeCurrency.coinDenom === "STRK" && unit === "FRI") {
          const l1Gas = resourceBounds.l1_gas;

          const maxGasForSTRK = adjustedOverallFee
            .quo(gasPriceDec)
            .mul(gasMargin);
          const maxGasPriceForSTRK = gasPrice.mul(gasPriceMargin);

          const maxPricePerUnitForSTRK = new CoinPretty(
            feeCurrency,
            num.hexToDecimalString(l1Gas.max_price_per_unit)
          );

          const finalMaxGasPriceForSTRK = maxPricePerUnitForSTRK
            .sub(maxGasPriceForSTRK)
            .toDec()
            .gt(new Dec(0))
            ? maxPricePerUnitForSTRK
            : maxGasPriceForSTRK;

          fee = {
            version: "v3",
            currency: feeCurrency,
            gasPrice,
            maxGasPrice: finalMaxGasPriceForSTRK,
            gas: totalGasConsumed,
            maxGas: maxGasForSTRK,
          };
        }

        if (!fee) {
          throw new Error(
            intl.formatMessage({
              id: "error.can-not-find-fee-for-claim-all",
            })
          );
        }

        // compare the account balance and fee
        const feeCurrencyBalance =
          starknetQueries.queryStarknetERC20Balance.getBalance(
            chainId,
            chainStore,
            account.starknetHexAddress,
            feeCurrency.coinMinimalDenom
          );

        if (
          !feeCurrencyBalance ||
          feeCurrencyBalance.balance
            .toDec()
            .lt(fee.maxGasPrice.mul(fee.gas).toDec())
        ) {
          throw new Error(
            intl.formatMessage({
              id: "error.claimable-reward-is-smaller-than-the-required-fee",
            })
          );
        }

        // compare the price of claimable rewards and fee (just consider maxGasPrice)
        const maxFee = fee.maxGasPrice.mul(fee.gas);

        const rewardsPrice = await priceStore.waitCalculatePrice(
          rewardToken,
          "usd"
        );
        const maxFeePrice = await priceStore.waitCalculatePrice(maxFee, "usd");

        if (!rewardsPrice || !maxFeePrice) {
          throw new Error(
            intl.formatMessage({
              id: "error.can-not-find-price-for-claim-all",
            })
          );
        }

        // if the price of claimable rewards is less than the price of fee, throw an error
        if (rewardsPrice.sub(maxFeePrice).toDec().lt(zeroDec)) {
          throw new Error(
            intl.formatMessage({
              id: "error.claimable-reward-is-smaller-than-the-required-fee",
            })
          );
        }

        // execute
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
                  .mul(fee.maxGas)
                  .mul(new Dec(10 ** fee.currency.coinDecimals))
                  .toDec()
                  .roundUp()
                  .toString(),
              },
          async (chainId, calls, details) => {
            const requester = new InExtensionMessageRequester();

            return await requester.sendMessage(
              BACKGROUND_PORT,
              new PrivilegeStarknetSignClaimRewardsMsg(chainId, calls, details)
            );
          }
        );

        if (!txHash) {
          throw new Error("Failed to claim all");
        }

        analyticsStore.logEvent("complete_claim_all", {
          chainId: modularChainInfo.chainId,
          chainName: modularChainInfo.chainName,
        });

        setTimeout(() => {
          state.setIsLoading(false);
        }, 1000);
      } catch (e) {
        state.setFailedReason(e as Error);
        console.log(e);
        return;
      }
    })();
  };

  const handleStarknetClaimSingle = async (
    chainId: string,
    state: ClaimAllEachState
  ) => {
    const modularChainInfo = chainStore.getModularChain(chainId);
    const account = accountStore.getAccount(chainId);

    if (!account.starknetHexAddress) {
      return;
    }

    analyticsStore.logEvent("click_claim", {
      chainId: modularChainInfo.chainId,
      chainName: modularChainInfo.chainName,
    });

    if (state.failedReason) {
      state.setFailedReason(undefined);
      return;
    }

    const starknetAccount = starknetAccountStore.getAccount(chainId);

    const starknetQueries = starknetQueriesStore.get(chainId);
    const queryStakingInfo = starknetQueries.stakingInfoManager.getStakingInfo(
      account.starknetHexAddress
    );

    const claimableRewards =
      queryStakingInfo?.getDescendingPendingClaimableRewards(
        account.isNanoLedger ? 5 : 8
      );

    if (!claimableRewards || claimableRewards.length === 0) {
      return;
    }

    let STRK: ERC20Currency | undefined;
    let ETH: ERC20Currency | undefined;

    if ("starknet" in modularChainInfo) {
      STRK = modularChainInfo.starknet.currencies.find(
        (c) =>
          c.coinMinimalDenom ===
          `erc20:${modularChainInfo.starknet.strkContractAddress}`
      );
      ETH = modularChainInfo.starknet.currencies.find(
        (c) =>
          c.coinMinimalDenom ===
          `erc20:${modularChainInfo.starknet.ethContractAddress}`
      );
    }

    const feeCurrency = STRK || ETH;
    if (!feeCurrency) {
      return;
    }

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

    try {
      state.setIsSimulating(true);

      const {
        gas_consumed,
        data_gas_consumed,
        gas_price,
        overall_fee,
        unit,
        resourceBounds,
      } = await starknetAccount.estimateInvokeFee(
        account.starknetHexAddress,
        calls,
        feeCurrency.coinDenom === "STRK" ? "STRK" : "ETH"
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
      const overallFeeDec = new Dec(overall_fee);

      const sigVerificationFee = sigVerificationGasConsumedDec.mul(gasPriceDec);

      const adjustedOverallFee = overallFeeDec.add(sigVerificationFee);

      const adjustedGasPrice = adjustedOverallFee.quo(totalGasConsumed);

      const gasPrice = new CoinPretty(feeCurrency, adjustedGasPrice);

      let fee:
        | {
            version: "v1" | "v3";
            currency: AppCurrency;
            gasPrice: CoinPretty;
            maxGasPrice: CoinPretty;
            gas: Dec;
            maxGas: Dec;
          }
        | undefined;

      if (feeCurrency.coinDenom === "ETH" && unit === "WEI") {
        const maxGasPriceForETH = gasPrice.mul(gasPriceMargin);
        const maxGasForETH = totalGasConsumed.mul(gasMargin);

        fee = {
          version: "v1",
          currency: feeCurrency,
          gasPrice,
          maxGasPrice: maxGasPriceForETH,
          gas: totalGasConsumed,
          maxGas: maxGasForETH,
        };
      } else if (feeCurrency.coinDenom === "STRK" && unit === "FRI") {
        const l1Gas = resourceBounds.l1_gas;

        const maxGasForSTRK = adjustedOverallFee
          .quo(gasPriceDec)
          .mul(gasMargin);
        const maxGasPriceForSTRK = gasPrice.mul(gasPriceMargin);

        const maxPricePerUnitForSTRK = new CoinPretty(
          feeCurrency,
          num.hexToDecimalString(l1Gas.max_price_per_unit)
        );

        const finalMaxGasPriceForSTRK = maxPricePerUnitForSTRK
          .sub(maxGasPriceForSTRK)
          .toDec()
          .gt(new Dec(0))
          ? maxPricePerUnitForSTRK
          : maxGasPriceForSTRK;

        fee = {
          version: "v3",
          currency: feeCurrency,
          gasPrice,
          maxGasPrice: finalMaxGasPriceForSTRK,
          gas: totalGasConsumed,
          maxGas: maxGasForSTRK,
        };
      }

      if (!fee) {
        throw new Error(
          intl.formatMessage({
            id: "error.can-not-find-fee-for-claim-all",
          })
        );
      }

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
                .mul(fee.maxGas)
                .mul(new Dec(10 ** fee.currency.coinDecimals))
                .toDec()
                .roundUp()
                .toString(),
            }
      );
      if (!txHash) {
        throw new Error("Failed to claim rewards");
      }

      analyticsStore.logEvent("complete_claim", {
        chainId: modularChainInfo.chainId,
        chainName: modularChainInfo.chainName,
      });

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
    handleStarknetClaimAllEach,
    handleStarknetClaimSingle,
  };
};
