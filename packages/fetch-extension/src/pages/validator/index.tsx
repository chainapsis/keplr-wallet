import { Staking } from "@keplr-wallet/stores";
import { HeaderLayout } from "@layouts/header-layout";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useStore } from "../../stores";
import { Stake } from "./stake";
import style from "./style.module.scss";
import { Transfer } from "./transfer";
import { Unstake } from "./unstake";
import { ValidatorDetails } from "./validator-details";
import { Dec } from "@keplr-wallet/unit";

enum ValidatorOperation {
  STAKE = "stake",
  UNSTAKE = "unstake",
  TRANSFER = "transfer",
}

export const Validator: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const validatorAddress = location.pathname.split("/")[2];
  const operation = location.pathname.split("/")[3];
  const validatorTab = localStorage.getItem("validatorTab") || "validator";
  const { chainStore, accountStore, queriesStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded
  );
  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const { validator, amount, rewards } = useMemo(() => {
    const amount = queryDelegations.getDelegationTo(validatorAddress);
    const validator =
      bondedValidators.getValidator(validatorAddress) ||
      unbondingValidators.getValidator(validatorAddress) ||
      unbondedValidators.getValidator(validatorAddress);
    const thumbnail =
      bondedValidators.getValidatorThumbnail(validatorAddress) ||
      unbondingValidators.getValidatorThumbnail(validatorAddress) ||
      unbondedValidators.getValidatorThumbnail(validatorAddress);
    const rewards = queryRewards.getRewardsOf(validatorAddress);
    return {
      validator,
      thumbnail,
      rewards,
      amount: amount,
    };
  }, [
    queryDelegations,
    validatorAddress,
    bondedValidators,
    unbondingValidators,
    unbondedValidators,
    queryRewards,
  ]);
  const inflation = queries.cosmos.queryInflation;
  const { inflation: ARR, isFetching } = inflation;
  const validatorCom: any = parseFloat(
    validator?.commission.commission_rates.rate || "0"
  );
  const APR = ARR.mul(new Dec(1 - validatorCom));
  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={operation.toLocaleUpperCase()}
      onBackButton={() => navigate(`/validators/${validatorTab}`)}
    >
      <div className={style["stakeContainer"]}>
        {validator && (
          <ValidatorDetails
            chainID={chainStore.current.chainId}
            validator={validator}
            isFetching={isFetching}
            APR={APR}
            rewards={rewards}
          />
        )}
        <div>
          <div className={style["stakedAmount"]}>
            <div>Current Staked Amount</div>
            <div
              style={{
                fontWeight: "bold",
                color: amount.toDec().isPositive() ? "#3b82f6" : "black",
              }}
            >
              {amount.maxDecimals(4).trim(true).toString()}
            </div>
          </div>
          <div className={style["tabList"]}>
            <div
              className={style["tab"]}
              style={{
                borderBottom:
                  operation == ValidatorOperation.STAKE
                    ? "2px solid #D43BF6"
                    : "",
                color:
                  operation == ValidatorOperation.STAKE ? "#D43BF6" : "#000000",
              }}
              onClick={() => navigate(`/validators/${validatorAddress}/stake`)}
            >
              Stake
            </div>

            <div
              className={style["tab"]}
              style={{
                borderBottom:
                  operation == ValidatorOperation.UNSTAKE
                    ? "2px solid #3B82F6"
                    : "",
                color:
                  operation == ValidatorOperation.UNSTAKE
                    ? "#3B82F6"
                    : "#000000",
              }}
              onClick={() =>
                navigate(`/validators/${validatorAddress}/unstake`)
              }
            >
              Unstake
            </div>
            <div
              className={style["tab"]}
              style={{
                borderBottom:
                  operation == ValidatorOperation.TRANSFER
                    ? "2px solid #D43BF6"
                    : "",
                color:
                  operation == ValidatorOperation.TRANSFER
                    ? "#D43BF6"
                    : "#000000",
              }}
              onClick={() =>
                navigate(`/validators/${validatorAddress}/transfer`)
              }
            >
              Redelegate
            </div>
          </div>
          {operation == ValidatorOperation.STAKE && (
            <Stake validatorAddress={validatorAddress} />
          )}
          {operation == ValidatorOperation.UNSTAKE && (
            <Unstake validatorAddress={validatorAddress} />
          )}
          {operation == ValidatorOperation.TRANSFER && (
            <Transfer
              validatorAddress={validatorAddress}
              balance={amount}
              validatorsList={[
                ...bondedValidators.validators,
                ...unbondedValidators.validators,
                ...unbondingValidators.validators,
              ].filter(
                (validator) => validator.operator_address != validatorAddress
              )}
            />
          )}
        </div>
      </div>
    </HeaderLayout>
  );
});
