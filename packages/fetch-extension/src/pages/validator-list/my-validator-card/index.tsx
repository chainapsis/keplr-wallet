import { ToolTip } from "@components/tooltip";
import { Staking } from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { formatAddress, shortenMintingNumber } from "@utils/format";
import React from "react";
import { useNavigate } from "react-router";
import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB } from "../../../config.ui.var";
import styleValidators from "./validators.module.scss";
import { useStore } from "../../../stores";

export const URL: { [key in string]: string } = {
  [CHAIN_ID_DORADO]: "https://explore-dorado.fetch.ai/validators",
  [CHAIN_ID_FETCHHUB]: "https://www.mintscan.io/fetchai/validators",
};

export const MyValidatorCard = ({
  validator,
  chainID,
}: {
  validator: Staking.Validator & { amount: CoinPretty };
  chainID: string;
}) => {
  const navigate = useNavigate();
  const { analyticsStore } = useStore();
  const status = validator.status.split("_")[2].toLowerCase();
  const commisionRate = (
    parseFloat(validator.commission.commission_rates.rate) * 100
  ).toFixed(2);
  return (
    <div
      className={styleValidators["item"]}
      onClick={() => {
        analyticsStore.logEvent("stake_validator_click", {
          pageName: "My Stake Tab",
        });
        navigate(`/validators/${validator.operator_address}/stake`);
      }}
    >
      <div
        className={styleValidators["row"]}
        style={{ borderBottom: "1px solid lightgray" }}
      >
        <div className={styleValidators["label"]}>
          {validator.description.moniker}
        </div>
        <ToolTip
          trigger="hover"
          options={{ placement: "bottom" }}
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
      <div className={styleValidators["row"]}>
        <div className={styleValidators["col"]}>
          <span className={styleValidators["label"]}>Staked</span>
          <span style={{ textTransform: "none" }}>
            {shortenMintingNumber(validator.amount.toDec().toString(), 0)}
            {validator.amount.currency.coinDenom}
          </span>
        </div>
        <div className={styleValidators["col"]}>
          <span className={styleValidators["label"]}>Commission</span>
          <span>{commisionRate}%</span>
        </div>
        <div className={styleValidators["col"]}>
          <span className={styleValidators["label"]}>Status</span>
          <span>{status}</span>
        </div>
      </div>
      <a
        href={`${URL[chainID]}/${validator.operator_address}`}
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: "12px" }}
      >
        View in Explorer
      </a>
    </div>
  );
};
