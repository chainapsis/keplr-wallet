import { HeaderLayout } from "@layouts/header-layout";
import React, { FunctionComponent, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "reactstrap";
import activeStake from "@assets/icon/activeStake.png";
import { Staking } from "@keplr-wallet/stores";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";

export const StakeComplete: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const validatorAddress = useLocation().pathname.split("/")[2];

  const { chainStore, queriesStore } = useStore();
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

  const { validator } = useMemo(() => {
    const validator =
      bondedValidators.getValidator(validatorAddress) ||
      unbondingValidators.getValidator(validatorAddress) ||
      unbondedValidators.getValidator(validatorAddress);
    return {
      validator,
    };
  }, [
    bondedValidators,
    validatorAddress,
    unbondingValidators,
    unbondedValidators,
  ]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Stake"
    >
      <div className="next-staked-info">
        <img
          src={require("@assets/svg/Box.svg")}
          alt=""
          style={{
            width: "265px",
            height: "265px",
            margin: "auto",
            display: "flex",
          }}
        />
        {validator && (
          <div style={{ textAlign: "center", width: "100%" }}>
            Amount processed with
            <div style={{ fontWeight: "bold", color: "#5090FF" }}>
              {validator.description.moniker}
            </div>
          </div>
        )}
      </div>

      <Button color="secondary" block onClick={() => navigate("/")}>
        Return Home
      </Button>

      <Button
        color="primary"
        block
        onClick={() => navigate("/validators")}
        style={{ marginLeft: "0px" }}
      >
        <img
          src={activeStake}
          alt=""
          style={{
            marginRight: "5px",
            height: "15px",
          }}
        />
        Go back to Validators List
      </Button>
    </HeaderLayout>
  );
});
