import { useIntl } from "react-intl";
import { useStore } from "../../stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Call, CallData, num } from "starknet";
import { ERC20Currency } from "@keplr-wallet/types";
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

    // TODO: support ETH
    let STRK: ERC20Currency | undefined;

    if ("starknet" in modularChainInfo) {
      STRK = modularChainInfo.starknet.currencies.find(
        (c) =>
          c.coinMinimalDenom ===
          `erc20:${modularChainInfo.starknet.strkContractAddress}`
      );
    }

    (async () => {
      try {
        // select fee currency
        const feeCurrency = STRK;
        if (!feeCurrency) {
          throw new Error(
            intl.formatMessage({
              id: "error.can-not-find-fee-for-claim-all",
            })
          );
        }

        const {
          l1_gas_consumed,
          l1_gas_price,
          l2_gas_consumed,
          l2_gas_price,
          l1_data_gas_consumed,
          l1_data_gas_price,
        } = await starknetAccount.estimateInvokeFee(
          account.starknetHexAddress,
          calls
        );

        const extraL2GasForOnchainVerification = new Dec(22039040);
        const adjustedL2GasConsumed = new Dec(l2_gas_consumed ?? 0).add(
          account.isNanoLedger ? new Dec(0) : extraL2GasForOnchainVerification
        );

        const l1Fee = new Dec(l1_gas_consumed).mul(new Dec(l1_gas_price));
        const l2Fee = adjustedL2GasConsumed.mul(new Dec(l2_gas_price ?? 0));
        const l1DataFee = new Dec(l1_data_gas_consumed).mul(
          new Dec(l1_data_gas_price)
        );

        const calculatedOverallFee = l1Fee.add(l2Fee).add(l1DataFee);

        const margin = new Dec(1.5);

        const totalGasConsumed = new Dec(l1_gas_consumed)
          .add(new Dec(l2_gas_consumed ?? 0))
          .add(new Dec(l1_data_gas_consumed));

        const adjustedGasPrice = calculatedOverallFee.quo(totalGasConsumed);

        const gasPrice = new CoinPretty(feeCurrency, adjustedGasPrice);
        const maxGasPrice = gasPrice.mul(margin);
        const maxGas = totalGasConsumed.mul(margin);

        // compare the account balance and fee
        const feeCurrencyBalance =
          starknetQueries.queryStarknetERC20Balance.getBalance(
            chainId,
            chainStore,
            account.starknetHexAddress,
            feeCurrency.coinMinimalDenom
          );

        // compare the price of claimable rewards and fee (just consider maxGasPrice)
        const maxFee = maxGasPrice.mul(maxGas);

        if (
          !feeCurrencyBalance ||
          feeCurrencyBalance.balance.toDec().lt(maxFee.toDec())
        ) {
          throw new Error(
            intl.formatMessage({
              id: "error.claimable-reward-is-smaller-than-the-required-fee",
            })
          );
        }

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

        const maxL1DataGas = new Dec(l1_data_gas_consumed).mul(margin);
        const maxL1Gas = new Dec(l1_gas_consumed).mul(margin);
        const maxL2Gas = adjustedL2GasConsumed.mul(margin);

        const maxL1DataGasPrice = new Dec(l1_data_gas_price).mul(margin);
        const maxL1GasPrice = new Dec(l1_gas_price).mul(margin);
        const maxL2GasPrice = new Dec(l2_gas_price ?? 0).mul(margin);

        // execute
        const { transaction_hash: txHash } = await starknetAccount.execute(
          account.starknetHexAddress,
          calls,
          {
            l1MaxGas: maxL1Gas.truncate().toString(),
            l1MaxGasPrice: maxL1GasPrice.truncate().toString(),
            l1MaxDataGas: maxL1DataGas.truncate().toString(),
            l1MaxDataGasPrice: maxL1DataGasPrice.truncate().toString(),
            l2MaxGas: maxL2Gas.truncate().toString(),
            l2MaxGasPrice: maxL2GasPrice.truncate().toString(),
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

    // TODO: support ETH
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
        l1_gas_consumed,
        l1_gas_price,
        l2_gas_consumed,
        l2_gas_price,
        l1_data_gas_consumed,
        l1_data_gas_price,
      } = await starknetAccount.estimateInvokeFee(
        account.starknetHexAddress,
        calls
      );

      // CHECK: 언제 l2 gas로 빠지고 언제 l1 gas로 빠지는지 확인 필요.
      // const extraL1GasForOnChainVerification = new Dec(583);
      const extraL2GasForOnchainVerification = new Dec(22000000);

      const adjustedL2GasConsumed = new Dec(l2_gas_consumed ?? 0).add(
        account.isNanoLedger ? new Dec(0) : extraL2GasForOnchainVerification
      );

      const margin = new Dec(1.5);

      const maxL1DataGas = new Dec(l1_data_gas_consumed).mul(margin);
      const maxL1Gas = new Dec(l1_gas_consumed).mul(margin);
      const maxL2Gas = adjustedL2GasConsumed.mul(margin);

      const maxL1DataGasPrice = new Dec(l1_data_gas_price).mul(margin);
      const maxL1GasPrice = new Dec(l1_gas_price).mul(margin);
      const maxL2GasPrice = new Dec(l2_gas_price ?? 0).mul(margin);

      const { transaction_hash: txHash } = await starknetAccount.execute(
        account.starknetHexAddress,
        calls,
        {
          l1MaxGas: num.toHex(maxL1Gas.truncate().toString()),
          l1MaxGasPrice: num.toHex(maxL1GasPrice.truncate().toString()),
          l1MaxDataGas: num.toHex(maxL1DataGas.truncate().toString()),
          l1MaxDataGasPrice: num.toHex(maxL1DataGasPrice.truncate().toString()),
          l2MaxGas: num.toHex(maxL2Gas.truncate().toString()),
          l2MaxGasPrice: num.toHex(maxL2GasPrice.truncate().toString()),
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
