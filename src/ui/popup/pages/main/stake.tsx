import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState
} from "react";

import { Button, Tooltip } from "reactstrap";

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
import { Currency } from "../../../../common/currency";
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { MsgWithdrawDelegatorReward } from "@everett-protocol/cosmosjs/x/distribution";
import {
  AccAddress,
  ValAddress
} from "@everett-protocol/cosmosjs/common/address";
import { useCosmosJS } from "../../../hooks";
import { PopupWalletProvider } from "../../wallet-provider";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import bigInteger from "big-integer";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { CoinUtils } from "../../../../common/coin-utils";

import { useNotification } from "../../../components/notification";

import { useHistory } from "react-router";

import { FormattedMessage } from "react-intl";

export const StakeView: FunctionComponent = observer(() => {
  const history = useHistory();
  const { chainStore, accountStore } = useStore();

  const [walletProvider] = useState(
    // Skip the approving for withdrawing rewards.
    new PopupWalletProvider({
      onRequestTxBuilderConfig: (chainId: string) => {
        history.push(`/fee/${chainId}`);
      }
    })
  );
  const cosmosJS = useCosmosJS(chainStore.chainInfo, walletProvider, {
    useBackgroundTx: true
  });

  const notification = useNotification();

  const reward = useReward(
    chainStore.chainInfo.rest,
    accountStore.bech32Address
  );

  const rewardExist = useMemo(() => {
    const rewards = reward.rewards;
    if (rewards.length > 0 && cosmosJS.addresses.length > 0) {
      for (const r of rewards) {
        if (r.reward) {
          for (const reward of r.reward) {
            const dec = new Dec(reward.amount);
            if (dec.truncate().gt(new Int(0))) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }, [cosmosJS.addresses.length, reward.rewards]);

  const withdrawAllRewards = useCallback(() => {
    if (reward.rewards.length > 0 && accountStore.bech32Address) {
      const msgs: Msg[] = [];

      for (const r of reward.rewards) {
        let rewardExist = false;
        if (r.reward) {
          for (const reward of r.reward) {
            const dec = new Dec(reward.amount);
            if (dec.truncate().gt(new Int(0))) {
              rewardExist = true;
              break;
            }
          }
        }

        if (rewardExist) {
          const msg = new MsgWithdrawDelegatorReward(
            AccAddress.fromBech32(
              accountStore.bech32Address,
              chainStore.chainInfo.bech32Config.bech32PrefixAccAddr
            ),
            ValAddress.fromBech32(
              r.validator_address,
              chainStore.chainInfo.bech32Config.bech32PrefixValAddr
            )
          );

          msgs.push(msg);
        }
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
              history.replace("/");
            },
            e => {
              history.replace("/");
              notification.push({
                placement: "top-center",
                type: "warning",
                duration: 5,
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
    history,
    notification
  ]);

  let isRewardExist = false;
  let rewardCurrency: Currency | undefined;
  if (reward.totalReward && reward.totalReward.length > 0) {
    rewardCurrency = getCurrencyFromMinimalDenom(reward.totalReward[0].denom);
    isRewardExist = rewardCurrency != null;
  }

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toogleTooltip = useCallback(() => {
    setTooltipOpen(!tooltipOpen);
  }, [tooltipOpen]);

  return (
    <div>
      {isRewardExist ? (
        <>
          <div
            className={classnames(styleStake.containerInner, styleStake.reward)}
          >
            <div className={styleStake.vertical}>
              <p
                className={classnames(
                  "h4",
                  "my-0",
                  "font-weight-normal",
                  styleStake.paragraphSub
                )}
              >
                <FormattedMessage id="main.stake.message.pending-staking-reward" />
              </p>
              <p
                className={classnames(
                  "h2",
                  "my-0",
                  "font-weight-normal",
                  styleStake.paragraphMain
                )}
              >
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
              </p>
            </div>
            <div style={{ flex: 1 }} />
            <Button
              className={styleStake.button}
              color="primary"
              size="sm"
              disabled={
                cosmosJS == null || cosmosJS.sendMsgs == null || !rewardExist
              }
              onClick={withdrawAllRewards}
              data-loading={cosmosJS.loading}
            >
              <FormattedMessage id="main.stake.button.claim-rewards" />
            </Button>
          </div>
          <hr className={styleStake.hr} />
        </>
      ) : null}

      <div className={classnames(styleStake.containerInner, styleStake.stake)}>
        <div className={styleStake.vertical}>
          <p
            className={classnames(
              "h2",
              "my-0",
              "font-weight-normal",
              styleStake.paragraphMain
            )}
          >
            <FormattedMessage id="main.stake.message.stake" />
          </p>
          <p
            className={classnames(
              "h4",
              "my-0",
              "font-weight-normal",
              styleStake.paragraphSub
            )}
          >
            <FormattedMessage id="main.stake.message.earning" />
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <a
          href={chainStore.chainInfo.walletUrlForStaking}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => {
            if (accountStore.assets.length === 0) {
              e.preventDefault();
            }
          }}
        >
          {/*
            "Disabled" property in button tag will block the mouse enter/leave events.
            So, tooltip will not work as expected.
            To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
          */}
          <Button
            id="btn-stake"
            className={classnames(styleStake.button, {
              disabled: accountStore.assets.length === 0
            })}
            color="primary"
            size="sm"
            outline={isRewardExist}
          >
            <FormattedMessage id="main.stake.button.stake" />
          </Button>
          {accountStore.assets.length === 0 ? (
            <Tooltip
              placement="bottom"
              isOpen={tooltipOpen}
              target="btn-stake"
              toggle={toogleTooltip}
              fade
            >
              <FormattedMessage id="main.stake.tooltip.no-asset" />
            </Tooltip>
          ) : null}
        </a>
      </div>
    </div>
  );
});
