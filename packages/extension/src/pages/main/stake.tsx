import React, { FunctionComponent, useMemo, useRef, useState } from "react";

import { Button, Tooltip } from "reactstrap";

import { useStore } from "../../stores";

import { observer } from "mobx-react-lite";

import styleStake from "./stake.module.scss";
import classnames from "classnames";
import { Dec } from "@keplr-wallet/unit";

import { useNotification } from "../../components/notification";

import { useHistory } from "react-router";

import { FormattedMessage } from "react-intl";

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
  const stakable = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  ).stakable;

  const isRewardExist = rewards.rewards.length > 0;

  const isStakableExist = useMemo(() => {
    return stakable.balance.toDec().gt(new Dec(0));
  }, [stakable.balance]);

  const withdrawAllRewards = async () => {
    if (accountInfo.isReadyToSendMsgs) {
      try {
        analyticsStore.logEvent("Claim reward started", {
          chainId: chainStore.current.chainId,
          chainName: chainStore.current.chainName,
        });
        // When the user delegated too many validators,
        // it can't be sent to withdraw rewards from all validators due to the block gas limit.
        // So, to prevent this problem, just send the msgs up to 8.
        await accountInfo.cosmos.sendWithdrawDelegationRewardMsgs(
          rewards.getDescendingPendingRewardValidatorAddresses(8),
          "",
          undefined,
          undefined,
          (tx: any) => {
            const isSuccess = tx.code == null || tx.code === 0;
            analyticsStore.logEvent("Claim reward finished", {
              chainId: chainStore.current.chainId,
              chainName: chainStore.current.chainName,
              isSuccess,
            });
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
      }
    }
  };

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toogleTooltip = () => setTooltipOpen((value) => !value);

  const stakeBtnRef = useRef<HTMLButtonElement>(null);

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
                data-loading={accountInfo.isSendingMsg === "withdrawRewards"}
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
        </div>
        <div style={{ flex: 1 }} />
        <a
          href={chainStore.current.walletUrlForStaking}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!isStakableExist) {
              e.preventDefault();
            } else {
              analyticsStore.logEvent("Stake button clicked", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
              });
            }
          }}
        >
          {/*
            "Disabled" property in button tag will block the mouse enter/leave events.
            So, tooltip will not work as expected.
            To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
          */}
          <Button
            innerRef={stakeBtnRef}
            className={classnames(styleStake.button, {
              disabled: !isStakableExist,
            })}
            color="primary"
            size="sm"
            outline={isRewardExist}
          >
            <FormattedMessage id="main.stake.button.stake" />
          </Button>
          {!isStakableExist ? (
            <Tooltip
              placement="bottom"
              isOpen={tooltipOpen}
              target={stakeBtnRef}
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
