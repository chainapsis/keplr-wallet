import { ToolTip } from "@components/tooltip";
import { Staking } from "@keplr-wallet/stores";
import { formatAddress, shortenNumber } from "@utils/format";
import React from "react";
import { useStore } from "../../../stores";
import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB } from "../../../config.ui.var";
import styleValidators from "./validatordetails.module.scss";
import { useNavigate } from "react-router";
import { useNotification } from "@components/notification";

export const URL: { [key in string]: string } = {
  [CHAIN_ID_DORADO]: "https://fetchstation.azoyalabs.com/dorado/validators",
  [CHAIN_ID_FETCHHUB]: "https://fetchstation.azoyalabs.com/mainnet/validators",
};

export const ValidatorDetails = ({
  validator,
  chainID,
  rewards,
  APR,
  isFetching,
}: {
  validator: Staking.Validator;
  chainID: string;
  rewards: any;
  APR: any;
  isFetching: boolean;
}) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const navigate = useNavigate();
  const notification = useNotification();

  const status = validator.status.split("_")[2].toLowerCase();

  const commisionRate = (
    parseFloat(validator.commission.commission_rates.rate) * 100
  ).toFixed(2);
  const maxCommisionRate = (
    parseFloat(validator.commission.commission_rates.max_rate) * 100
  ).toFixed(2);

  const handleClaim = async () => {
    try {
      await account.cosmos.sendWithdrawDelegationRewardMsgs(
        [validator.operator_address],
        "",
        undefined,
        undefined,
        {
          onBroadcasted() {
            notification.push({
              type: "primary",
              placement: "top-center",
              duration: 5,
              content: `Transaction Broadcasted`,
              canDelete: true,
              transition: {
                duration: 0.25,
              },
            });
          },
          onFulfill: (tx: any) => {
            const istxnSuccess = tx.code ? false : true;
            notification.push({
              type: istxnSuccess ? "success" : "danger",
              placement: "top-center",
              duration: 5,
              content: istxnSuccess
                ? `Transaction Completed`
                : `Transaction Failed`,
              canDelete: true,
              transition: {
                duration: 0.25,
              },
            });
          },
        }
      );
      navigate(`/validators/${validator.operator_address}/stake`);
    } catch (err) {
      console.error(err);
      if (err.toString().includes("Error: Request rejected")) {
        navigate(`/validators/${validator.operator_address}/stake`);
      }
    }
  };
  return (
    <div className={styleValidators["item"]}>
      <div className={styleValidators["title"]}>
        <div className={styleValidators["label"]}>
          {validator.description.website ? (
            <a
              target="_blank"
              rel="noreferrer"
              href={validator.description.website}
            >
              {validator.description.moniker}
            </a>
          ) : (
            <React.Fragment>{validator.description.moniker}</React.Fragment>
          )}
        </div>
        <ToolTip
          trigger="hover"
          options={{ placement: "bottom-start" }}
          tooltip={
            <div className={styleValidators["tooltip"]}>
              {validator.operator_address}
            </div>
          }
        >
          <span className={styleValidators["address"]}>
            {formatAddress(validator.operator_address)}
          </span>
        </ToolTip>
      </div>
      {validator.description.details && (
        <div
          className={styleValidators["description"]}
          style={{ borderBottom: "1px solid lightgray" }}
        >
          <span className={styleValidators["label"]}>Description</span>
          <span>{validator.description.details}</span>
        </div>
      )}
      <div className={styleValidators["details"]}>
        <div className={styleValidators["col"]}>
          <span className={styleValidators["label"]}>Commission Rate</span>
          <span>
            {commisionRate}% ({maxCommisionRate}% Max)
          </span>
        </div>
        <div className={styleValidators["col"]}>
          <span className={styleValidators["label"]}>Delegated</span>
          <span>{shortenNumber(validator.delegator_shares)}</span>
        </div>
        <div className={styleValidators["col"]}>
          <span className={styleValidators["label"]}>Status</span>
          <span style={{ textTransform: "capitalize" }}>{status}</span>
        </div>
      </div>

      <div className={styleValidators["details"]}>
        <div className={styleValidators["col"]}>
          <span className={styleValidators["label"]}>APR </span>
          <span>
            {!isFetching ? (
              <div>{APR.maxDecimals(2).trim(true).toString()}%</div>
            ) : (
              <span style={{ fontSize: "14px" }}>
                <i className="fas fa-spinner fa-spin" />
              </span>
            )}
          </span>
        </div>
        <div className={styleValidators["col"]}>
          <span className={styleValidators["label"]}>Earned Rewards</span>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {!isFetching ? (
              <div>
                {!rewards ||
                rewards.length === 0 ||
                parseFloat(
                  rewards[0]?.maxDecimals(4).toString().split(" ")[0]
                ) < 0.00001 ? (
                  <span style={{ color: "black" }}>0</span>
                ) : (
                  rewards[0]?.maxDecimals(4).toString()
                )}
              </div>
            ) : (
              <span style={{ fontSize: "14px" }}>
                <i className="fas fa-spinner fa-spin" />
              </span>
            )}
            {(!rewards ||
              rewards.length !== 0 ||
              parseFloat(rewards[0]?.maxDecimals(4).toString().split(" ")[0]) >
                0.00001) && (
              <button
                color="primary"
                onClick={handleClaim}
                className={styleValidators["claimButton"]}
              >
                Claim
              </button>
            )}
          </div>
        </div>
      </div>
      <a
        href={`${URL[chainID]}/${validator.operator_address}`}
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: "12px" }}
      >
        View in Explorer for more Details
      </a>
      {validator.jailed && (
        <div className={styleValidators["jailed"]}>
          This validator is currently jailed. Redelegate your tokens.
        </div>
      )}
    </div>
  );
};
