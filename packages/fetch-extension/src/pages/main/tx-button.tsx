import React, { FunctionComponent, useMemo, useRef, useState } from "react";

import styleTxButton from "./tx-button.module.scss";

import { Button, Tooltip } from "reactstrap";

import { observer } from "mobx-react-lite";

import { useStore } from "../../stores";

import Modal from "react-modal";

import { useNotification } from "@components/notification";

import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router";

import { Dec } from "@keplr-wallet/unit";
import send from "@assets/icon/send.png";
import reward from "@assets/icon/reward.png";
import stake from "@assets/icon/stake.png";

import activeReward from "@assets/icon/activeReward.png";
import activeStake from "@assets/icon/activeStake.png";
import activeSend from "@assets/icon/activeSend.png";
import { DepositModal } from "./qr-code";
import { Link } from "react-router-dom";
import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB } from "../../config.ui.var";

export const TxButtonView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore, analyticsStore } = useStore();

  const [isActiveSend, setIsActiveSend] = useState(false);
  const [isActiveStake, setIsActiveStake] = useState(false);
  const [isActiveReward, setIsActiveReward] = useState(false);
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryBalances = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const isEvm = chainStore.current.features?.includes("evm") ?? false;

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const [sendTooltipOpen, setSendTooltipOpen] = useState(false);

  const navigate = useNavigate();

  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;

  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const notification = useNotification();

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const stakable = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  ).stakable;

  const isRewardExist = rewards.stakableReward.toDec().gt(new Dec(0));

  const isStakableInApp = [CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB].includes(
    chainStore.current.chainId
  );
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

        navigate("/", { replace: true });
      } catch (e: any) {
        navigate("/", { replace: true });
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
      className={styleTxButton["containerTxButton"]}
      style={{ margin: "0px -2px" }}
    >
      {/*
        "Disabled" property in button tag will block the mouse enter/leave events.
        So, tooltip will not work as expected.
        To solve this problem, don't add "disabled" property to button tag and just add "disabled" class manually.
       */}
      <Button
        innerRef={sendBtnRef}
        className={styleTxButton["button"]}
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
            navigate("/send");
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
      {!isEvm && (
        <Button
          className={styleTxButton["button"]}
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
      )}
      {!isEvm && (
        <Link
          to={
            isStakableInApp
              ? "/validators/validator"
              : chainStore.current.walletUrlForStaking || ""
          }
          target={!isStakableInApp ? "_blank" : ""}
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
            className={styleTxButton["button"]}
            color="primary"
            outline
            onMouseEnter={() => {
              setIsActiveStake(true);
            }}
            onMouseLeave={() => {
              setIsActiveStake(false);
            }}
            data-loading={["undelegate", "redelegate", "delegate"].includes(
              accountInfo.txTypeInProgress
            )}
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
        </Link>
      )}
      {!hasAssets ? (
        <Tooltip
          placement="bottom"
          isOpen={sendTooltipOpen}
          target={sendBtnRef}
          toggle={() => setSendTooltipOpen((value) => !value)}
          fade
        >
          <FormattedMessage id="main.account.tooltip.no-asset" />
        </Tooltip>
      ) : null}
      <Modal
        style={{
          content: {
            width: "330px",
            minWidth: "330px",
            minHeight: "unset",
            maxHeight: "unset",
          },
        }}
        isOpen={isDepositModalOpen}
        onRequestClose={() => {
          setIsDepositModalOpen(false);
        }}
      >
        <DepositModal
          chainName={chainStore.current.chainName}
          address={
            isEvm ? accountInfo.ethereumHexAddress : accountInfo.bech32Address
          }
          isDepositOpen={isDepositModalOpen}
          setIsDepositOpen={setIsDepositModalOpen}
        />
      </Modal>
    </div>
  );
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
