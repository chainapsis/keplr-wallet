import { HeaderLayout } from "@layouts/header-layout";
import React, { FunctionComponent, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import style from "./style.module.scss";
import { Staking } from "@keplr-wallet/stores";
import { useStore } from "../../stores";
import { ValidatorDetails } from "./validator-details";
import { observer } from "mobx-react-lite";
import { Stake } from "./stake";
import { Unstake } from "./unstake";

export const Validator: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const validatorAddress = location.pathname.split("/")[2];
  const operation = location.pathname.split("/")[3];

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
  const { validator, amount } = useMemo(() => {
    const amount = queryDelegations.getDelegationTo(validatorAddress);
    const validator =
      bondedValidators.getValidator(validatorAddress) ||
      unbondingValidators.getValidator(validatorAddress) ||
      unbondedValidators.getValidator(validatorAddress);
    const thumbnail =
      bondedValidators.getValidatorThumbnail(validatorAddress) ||
      unbondingValidators.getValidatorThumbnail(validatorAddress) ||
      unbondedValidators.getValidatorThumbnail(validatorAddress);

    return {
      validator,
      thumbnail,
      amount: amount,
    };
  }, [
    queryDelegations,
    validatorAddress,
    bondedValidators,
    unbondingValidators,
    unbondedValidators,
  ]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={operation == "stake" ? "Stake" : "Unstake"}
      onBackButton={() => navigate("/validators")}
    >
      <div className={style["stakeContainer"]}>
        {validator && (
          <ValidatorDetails
            chainID={chainStore.current.chainId}
            validator={validator}
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
                borderBottom: operation == "stake" ? "2px solid #D43BF6" : "",
                color: operation == "stake" ? "#D43BF6" : "#000000",
              }}
              onClick={() => navigate(`/validators/${validatorAddress}/stake`)}
            >
              Stake
            </div>

            <div
              className={style["tab"]}
              style={{
                borderBottom: operation == "unstake" ? "2px solid #3B82F6" : "",
                color: operation == "unstake" ? "#3B82F6" : "#000000",
              }}
              onClick={() =>
                navigate(`/validators/${validatorAddress}/unstake`)
              }
            >
              Unstake
            </div>
          </div>
          {operation == "stake" ? (
            <Stake validatorAddress={validatorAddress} />
          ) : (
            <Unstake validatorAddress={validatorAddress} />
          )}
        </div>
      </div>
    </HeaderLayout>
  );
});
