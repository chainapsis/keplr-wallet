import { Staking } from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import React from "react";
import { useStore } from "../../../stores";
import { ValidatorCard } from "../validator-card";

type ValidatorData = Staking.Validator & { amount: CoinPretty };

export const ValidatorsList = ({
  filteredValidators,
}: {
  filteredValidators: ValidatorData[];
}) => {
  const { chainStore } = useStore();

  const sortValidators = (a: ValidatorData, b: ValidatorData) => {
    return parseFloat(b.delegator_shares) - parseFloat(a.delegator_shares);
  };

  return (
    <React.Fragment>
      {filteredValidators.length ? (
        filteredValidators
          .sort((a, b) => sortValidators(a, b))
          .map((validator: ValidatorData) => (
            <ValidatorCard
              validator={validator}
              chainID={chainStore.current.chainId}
              key={validator.operator_address}
            />
          ))
      ) : (
        <div style={{ textAlign: "center" }}>No Validators Found</div>
      )}
    </React.Fragment>
  );
};
