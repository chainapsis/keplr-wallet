import React, { FunctionComponent, useMemo, useState } from "react";

import { Button } from "reactstrap";

import styleTxButton from "./tx-button.module.scss";

import { observer } from "mobx-react-lite";

import { useStore } from "../../stores";

import { useNotification } from "../../components/notification";

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import { Dec } from "@keplr-wallet/unit";

import reward from "../../public/assets/icon/reward.png";
import send from "../../public/assets/icon/send.png";
import stake from "../../public/assets/icon/stake.png";

import activeReward from "../../public/assets/icon/activeReward.png";
import activeSend from "../../public/assets/icon/activeSend.png";
import activeStake from "../../public/assets/icon/activeStake.png";

export const TxButtonView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore, analyticsStore } = useStore();

  const notification = useNotification();

  const [isActiveSend, setIsActiveSend] = useState(false);
  const [isActiveStake, setIsActiveStake] = useState(false);
  const [isActiveReward, setIsActiveReward] = useState(false);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryBalances = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const history = useHistory();

  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const stakable = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  ).stakable;

  const isRewardExist = rewards.stakableReward.toDec().gt(new Dec(0));

  const isStakableExist = useMemo(() => {
    return stakable.balance.toDec().gt(new Dec(0));
  }, [stakable.balance]);

  const withdrawAllRewards = async () => {
    if (
      accountInfo.isReadyToSendMsgs &&
      chainStore.current.walletUrlForStaking
    ) {
      try {
        // When the user delegated too many validators,
        // it can't be sent to withdraw rewards from all validators due to the block gas limit.
        // So, to prevent this problem, just send the msgs up to 8.
        await accountInfo.cosmos.sendWithdrawDelegationRewardMsgs(
          rewards.getDescendingPendingRewardValidatorAddresses(8),
          "",
          undefined,
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
      } catch (e: any) {
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

  return (
    <div
      className={styleTxButton.containerTxButton}
      style={{ margin: "0px -2px" }}
    >
      <Button
        className={styleTxButton.button}
        style={
          !hasAssets
            ? {
                opacity: 0.5,
                pointerEvents: "none",
              }
            : { opacity: 1, pointerEvents: "auto" }
        }
        color="primary"
        outline
        data-loading={accountInfo.isSendingMsg === "send"}
        onClick={(e) => {
          e.preventDefault();

          if (hasAssets) {
            history.push("/send");
          }
        }}
        onMouseEnter={() => {
          setIsActiveSend(true);
        }}
        onMouseLeave={() => {
          setIsActiveSend(false);
        }}
      >
        <img
          src={isActiveSend ? activeSend : send}
          alt=""
          style={{
            marginRight: "5px",
            height: "15px",
          }}
        />
        <FormattedMessage id="main.account.button.send" />
      </Button>
      <Button
        className={styleTxButton.button}
        style={
          !accountInfo.isReadyToSendMsgs ||
          !isRewardExist ||
          !chainStore.current.walletUrlForStaking
            ? {
                opacity: 0.5,
                pointerEvents: "none",
              }
            : { opacity: 1, pointerEvents: "auto" }
        }
        outline
        color="primary"
        onClick={withdrawAllRewards}
        data-loading={accountInfo.isSendingMsg === "withdrawRewards"}
        onMouseEnter={() => {
          setIsActiveReward(true);
        }}
        onMouseLeave={() => {
          setIsActiveReward(false);
        }}
      >
        <img
          src={isActiveReward ? activeReward : reward}
          alt=""
          style={{
            marginRight: "5px",
            height: "18px",
          }}
        />
        <FormattedMessage id="main.stake.button.claim-rewards" />
      </Button>
      <a
        href={chainStore.current.walletUrlForStaking}
        target="_blank"
        rel="noopener noreferrer"
        style={
          !isStakableExist || !chainStore.current.walletUrlForStaking
            ? {
                opacity: 0.5,
                pointerEvents: "none",
              }
            : { opacity: 1, pointerEvents: "auto" }
        }
        onClick={(e) => {
          if (!isStakableExist || !chainStore.current.walletUrlForStaking) {
            e.preventDefault();
          } else {
            analyticsStore.logEvent("Stake button clicked", {
              chainId: chainStore.current.chainId,
              chainName: chainStore.current.chainName,
            });
          }
        }}
      >
        <Button
          className={styleTxButton.button}
          color="primary"
          outline
          onMouseEnter={() => {
            setIsActiveStake(true);
          }}
          onMouseLeave={() => {
            setIsActiveStake(false);
          }}
        >
          <img
            src={isActiveStake ? activeStake : stake}
            alt=""
            style={{
              marginRight: "5px",
              height: "15px",
            }}
          />
          <FormattedMessage id="main.stake.button.stake" />
        </Button>
      </a>
    </div>
  );
});
