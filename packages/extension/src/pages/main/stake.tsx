import React, { FunctionComponent, useState } from "react";

import { Button } from "reactstrap";

import { useStore } from "../../stores";

import { observer } from "mobx-react-lite";

import styleStake from "./stake.module.scss";
import classnames from "classnames";
import { Dec } from "@keplr-wallet/unit";

import { useNotification } from "../../components/notification";

import { useHistory } from "react-router";

import { FormattedMessage } from "react-intl";
import { DefaultGasMsgWithdrawRewards } from "../../config.ui";

export const StakeView: FunctionComponent = observer(() => {
  const history = useHistory();
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const notification = useNotification();

  const inflation = queries.cosmos.queryInflation;
  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const stakableReward = rewards.stakableReward;

  const isRewardExist = rewards.rewards.length > 0;

  const [isWithdrawingRewards, setIsWithdrawingRewards] = useState(false);

  const withdrawAllRewards = async () => {
    if (accountInfo.isReadyToSendMsgs) {
      try {
        setIsWithdrawingRewards(true);

        // When the user delegated too many validators,
        // it can't be sent to withdraw rewards from all validators due to the block gas limit.
        // So, to prevent this problem, just send the msgs up to 8.
        const validatorAddresses = rewards.getDescendingPendingRewardValidatorAddresses(
          8
        );
        const tx = accountInfo.cosmos.makeWithdrawDelegationRewardTx(
          validatorAddresses
        );

        let gas: number;
        try {
          // Gas adjustment is 1.5
          // Since there is currently no convenient way to adjust the gas adjustment on the UI,
          // Use high gas adjustment to prevent failure.
          gas = (await tx.simulate()).gasUsed * 1.5;
        } catch (e) {
          console.log(e);

          gas = DefaultGasMsgWithdrawRewards * validatorAddresses.length;
        }

        await tx.send(
          {
            amount: [],
            gas: gas.toString(),
          },
          "",
          undefined,
          {
            onBroadcasted: () => {
              analyticsStore.logEvent("Claim reward tx broadcasted", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
              });
            },
          }
        );

        history.replace("/");
      } catch (e) {
        history.replace("/");
        notification.push({
          type: "warning",
          placement: "top-center",
          duration: 5,
          content: `Fail to withdraw rewards: ${e.message}`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      } finally {
        setIsWithdrawingRewards(false);
      }
    }
  };

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
                {stakableReward.shrink(true).maxDecimals(6).toString()}
                {rewards.isFetching ? (
                  <span>
                    <i className="fas fa-spinner fa-spin" />
                  </span>
                ) : null}
              </p>
            </div>
            <div style={{ flex: 1 }} />
            {
              <Button
                className={styleStake.button}
                color="primary"
                size="sm"
                disabled={!accountInfo.isReadyToSendMsgs}
                onClick={withdrawAllRewards}
                data-loading={
                  accountInfo.isSendingMsg === "withdrawRewards" ||
                  isWithdrawingRewards
                }
              >
                <FormattedMessage id="main.stake.button.claim-rewards" />
              </Button>
            }
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
          {inflation.inflation.toDec().equals(new Dec(0)) ? null : (
            <p
              className={classnames(
                "h4",
                "my-0",
                "font-weight-normal",
                styleStake.paragraphSub
              )}
            >
              <FormattedMessage
                id="main.stake.message.earning"
                values={{
                  apr: (
                    <React.Fragment>
                      {inflation.inflation.trim(true).maxDecimals(2).toString()}
                      {inflation.isFetching ? (
                        <span>
                          <i className="fas fa-spinner fa-spin" />
                        </span>
                      ) : null}
                    </React.Fragment>
                  ),
                }}
              />
            </p>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <a
          href={chainStore.current.walletUrlForStaking}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            analyticsStore.logEvent("Stake button clicked", {
              chainId: chainStore.current.chainId,
              chainName: chainStore.current.chainName,
            });
          }}
        >
          <Button
            className={styleStake.button}
            color="primary"
            size="sm"
            outline={isRewardExist}
          >
            <FormattedMessage id="main.stake.button.stake" />
          </Button>
        </a>
      </div>
    </div>
  );
});
