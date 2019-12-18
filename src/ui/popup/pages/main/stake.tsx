import React, { FunctionComponent, useCallback, useState } from "react";

import { Button } from "../../../components/button";

import { useStore } from "../../stores";
import { useReward } from "../../../hooks/use-reward";

import { observer } from "mobx-react";

import styleStake from "./stake.module.scss";
import classnames from "classnames";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import {
  getCurrency,
  getCurrencyFromMinimalDenom
} from "../../../../common/currency";
import { Currency } from "../../../../chain-info";
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { MsgWithdrawDelegatorReward } from "@everett-protocol/cosmosjs/x/distribution";
import {
  AccAddress,
  useBech32Config,
  ValAddress
} from "@everett-protocol/cosmosjs/common/address";
import { useCosmosJS } from "../../../hooks";
import { PopupWalletProvider } from "../../wallet-provider";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import bigInteger from "big-integer";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { CoinUtils } from "../../../../common/coin-utils";
import { sendMessage } from "../../../../common/message";
import {
  ApproveSignMsg,
  ApproveTxBuilderConfigMsg,
  GetRequestedTxBuilderConfigMsg
} from "../../../../background/keyring";
import { BACKGROUND_PORT } from "../../../../common/message/constant";
import { useNotification } from "../../../components/notification";

export const StakeView: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();

  const [walletProvider] = useState(
    // Skip the approving for withdrawing rewards.
    new PopupWalletProvider(
      {
        onRequestTxBuilderConfig: async (chainId: string) => {
          const msg = GetRequestedTxBuilderConfigMsg.create(chainId);
          const result = await sendMessage(BACKGROUND_PORT, msg);
          await sendMessage(
            BACKGROUND_PORT,
            ApproveTxBuilderConfigMsg.create({
              chainId,
              ...result.config
            })
          );
        }
      },
      {
        onRequestSignature: async (index: string) => {
          await sendMessage(BACKGROUND_PORT, ApproveSignMsg.create(index));
        }
      }
    )
  );
  const cosmosJS = useCosmosJS(chainStore.chainInfo, walletProvider);

  const notification = useNotification();

  const reward = useReward(
    chainStore.chainInfo.rest,
    accountStore.bech32Address
  );

  const withdrawAllRewards = useCallback(() => {
    if (reward.rewards.length > 0 && accountStore.bech32Address) {
      const msgs: Msg[] = [];

      for (const r of reward.rewards) {
        // This is not react hooks.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useBech32Config(chainStore.chainInfo.bech32Config, () => {
          const msg = new MsgWithdrawDelegatorReward(
            AccAddress.fromBech32(accountStore.bech32Address),
            ValAddress.fromBech32(r.validator_address)
          );

          msgs.push(msg);
        });
      }

      if (msgs.length > 0) {
        if (cosmosJS.sendMsgs) {
          const config: TxBuilderConfig = {
            gas: bigInteger(140000 * msgs.length),
            memo: "",
            fee: new Coin(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              getCurrency(
                chainStore.chainInfo.nativeCurrency
              )!.coinMinimalDenom,
              new Int("1000")
            )
          };

          cosmosJS.sendMsgs(
            msgs,
            config,
            () => {
              notification.push({
                placement: "top-center",
                type: "success",
                duration: 2,
                content: "Reward withdrawn!",
                canDelete: true,
                transition: {
                  duration: 0.25
                }
              });
            },
            e => {
              notification.push({
                placement: "top-center",
                type: "warning",
                duration: 2,
                content: `Fail to withdraw rewards: ${e.message}`,
                canDelete: true,
                transition: {
                  duration: 0.25
                }
              });
            },
            "commit"
          );
        }
      }
    }
  }, [
    reward.rewards,
    accountStore.bech32Address,
    chainStore.chainInfo.bech32Config,
    chainStore.chainInfo.nativeCurrency,
    cosmosJS,
    notification
  ]);

  let isRewardExist = false;
  let rewardCurrency: Currency | undefined;
  if (reward.totalReward && reward.totalReward.length > 0) {
    rewardCurrency = getCurrencyFromMinimalDenom(reward.totalReward[0].denom);
    isRewardExist = rewardCurrency != null;
  }

  return (
    <div>
      {isRewardExist ? (
        <>
          <div
            className={classnames(styleStake.containerInner, styleStake.reward)}
          >
            <div className={styleStake.vertical}>
              <div className={styleStake.title}>Pending Staking Reward</div>
              <div className={styleStake.content}>
                {`${CoinUtils.shrinkDecimals(
                  new Dec(reward.totalReward[0].amount).truncate(),
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  rewardCurrency!.coinDecimals,
                  0,
                  6
                )} ${
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  rewardCurrency!.coinDenom
                }`}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <Button
              color="primary"
              disabled={cosmosJS == null || cosmosJS.sendMsgs == null}
              loading={cosmosJS.loading}
              onClick={() => {
                withdrawAllRewards();
              }}
            >
              Claim
            </Button>
          </div>
          <hr className={styleStake.hr} />
        </>
      ) : null}

      <div className={classnames(styleStake.containerInner, styleStake.stake)}>
        <div className={styleStake.vertical}>
          <div className={styleStake.title}>Stake</div>
          <div className={styleStake.content}>Earn up to 7-11% per year</div>
        </div>
        <div style={{ flex: 1 }} />
        <Button
          color="primary"
          outline={isRewardExist}
          href={chainStore.chainInfo.walletUrlForStaking}
          target="_blank"
        >
          Stake
        </Button>
      </div>
    </div>
  );
});
