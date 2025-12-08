import { useIntl } from "react-intl";
import { useStore } from "../../stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Call, CallData, num } from "starknet";
import { ERC20Currency } from "@keplr-wallet/types";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import {
  PrivilegeStarknetSignClaimRewardsMsg,
  SubmitStarknetTxHashMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { ClaimAllEachState } from "../../stores/claim-rewards-state";
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
        const feeCurrency = STRK;
        if (!feeCurrency) {
          throw new Error(
            intl.formatMessage({
              id: "error.can-not-find-fee-for-claim-all",
            })
          );
        }

        const { resourceBounds } = await starknetAccount.estimateInvokeFee(
          account.starknetHexAddress,
          calls
        );

        const { l1_gas, l2_gas, l1_data_gas } = resourceBounds;

        const extraL2GasForOnchainVerification = account.isNanoLedger
          ? BigInt(90240)
          : BigInt(22039040);

        const adjustedL2GasConsumed =
          l2_gas.max_amount + extraL2GasForOnchainVerification;

        const l1Fee = l1_gas.max_amount * l1_gas.max_price_per_unit;
        const l2Fee = adjustedL2GasConsumed * l2_gas.max_price_per_unit;
        const l1DataFee =
          l1_data_gas.max_amount * l1_data_gas.max_price_per_unit;

        const calculatedOverallFee = l1Fee + l2Fee + l1DataFee;

        const totalGasConsumed =
          l1_gas.max_amount + adjustedL2GasConsumed + l1_data_gas.max_amount;

        // margin 1.5x = 3/2
        const adjustedGasPrice = calculatedOverallFee / totalGasConsumed;
        const maxGasPrice = new CoinPretty(
          feeCurrency,
          new Dec(((adjustedGasPrice * BigInt(3)) / BigInt(2)).toString())
        );
        const maxGas = new Dec(
          ((totalGasConsumed * BigInt(3)) / BigInt(2)).toString()
        );

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

        // margin 1.5x = 3/2
        const maxL1Gas = (l1_gas.max_amount * BigInt(3)) / BigInt(2);
        const maxL1GasPrice =
          (l1_gas.max_price_per_unit * BigInt(3)) / BigInt(2);
        const maxL2Gas = (adjustedL2GasConsumed * BigInt(3)) / BigInt(2);
        const maxL2GasPrice =
          (l2_gas.max_price_per_unit * BigInt(3)) / BigInt(2);
        const maxL1DataGas = (l1_data_gas.max_amount * BigInt(3)) / BigInt(2);
        const maxL1DataGasPrice =
          (l1_data_gas.max_price_per_unit * BigInt(3)) / BigInt(2);

        const { transaction_hash: txHash } = await starknetAccount.execute(
          account.starknetHexAddress,
          calls,
          {
            l1MaxGas: num.toHex(maxL1Gas),
            l1MaxGasPrice: num.toHex(maxL1GasPrice),
            l1MaxDataGas: num.toHex(maxL1DataGas),
            l1MaxDataGasPrice: num.toHex(maxL1DataGasPrice),
            l2MaxGas: num.toHex(maxL2Gas),
            l2MaxGasPrice: num.toHex(maxL2GasPrice),
          },
          async (chainId, calls, details) => {
            return await new InExtensionMessageRequester().sendMessage(
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

    if ("starknet" in modularChainInfo) {
      STRK = modularChainInfo.starknet.currencies.find(
        (c) =>
          c.coinMinimalDenom ===
          `erc20:${modularChainInfo.starknet.strkContractAddress}`
      );
    }

    const feeCurrency = STRK;
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

      const { resourceBounds } = await starknetAccount.estimateInvokeFee(
        account.starknetHexAddress,
        calls
      );

      const { l1_gas, l2_gas, l1_data_gas } = resourceBounds;

      const extraL2GasForOnchainVerification = account.isNanoLedger
        ? BigInt(90240)
        : BigInt(22039040);

      const adjustedL2GasConsumed =
        l2_gas.max_amount + extraL2GasForOnchainVerification;

      // margin 1.5x = 3/2
      const maxL1Gas = (l1_gas.max_amount * BigInt(3)) / BigInt(2);
      const maxL1GasPrice = (l1_gas.max_price_per_unit * BigInt(3)) / BigInt(2);
      const maxL2Gas = (adjustedL2GasConsumed * BigInt(3)) / BigInt(2);
      const maxL2GasPrice = (l2_gas.max_price_per_unit * BigInt(3)) / BigInt(2);
      const maxL1DataGas = (l1_data_gas.max_amount * BigInt(3)) / BigInt(2);
      const maxL1DataGasPrice =
        (l1_data_gas.max_price_per_unit * BigInt(3)) / BigInt(2);

      const { transaction_hash: txHash } = await starknetAccount.execute(
        account.starknetHexAddress,
        calls,
        {
          l1MaxGas: num.toHex(maxL1Gas),
          l1MaxGasPrice: num.toHex(maxL1GasPrice),
          l1MaxDataGas: num.toHex(maxL1DataGas),
          l1MaxDataGasPrice: num.toHex(maxL1DataGasPrice),
          l2MaxGas: num.toHex(maxL2Gas),
          l2MaxGasPrice: num.toHex(maxL2GasPrice),
        }
      );
      if (!txHash) {
        throw new Error("Failed to claim rewards");
      }

      new InExtensionMessageRequester()
        .sendMessage(
          BACKGROUND_PORT,
          new SubmitStarknetTxHashMsg(chainId, txHash)
        )
        .then(() => {
          starknetQueries.queryStarknetERC20Balance
            .getBalance(
              chainId,
              chainStore,
              account.starknetHexAddress,
              feeCurrency.coinMinimalDenom
            )
            ?.fetch();

          notification.show(
            "success",
            intl.formatMessage({
              id: "notification.transaction-success",
            }),
            ""
          );

          analyticsStore.logEvent("complete_claim", {
            chainId: modularChainInfo.chainId,
            chainName: modularChainInfo.chainName,
          });
        })
        .catch((e) => {
          // 이 경우에는 tx가 커밋된 이후의 오류이기 때문에 이미 페이지는 sign 페이지에서부터 전환된 상태다.
          // 따로 멀 처리해줄 필요가 없다
          console.log(e);
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
