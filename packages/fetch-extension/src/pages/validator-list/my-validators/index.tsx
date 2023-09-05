import { Staking } from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import React from "react";
import { useStore } from "../../../stores";
import { MyValidatorCard } from "../my-validator-card";

type ValidatorData = Staking.Validator & { amount: CoinPretty };

export const MyValidatorsList = ({
  filteredValidators,
}: {
  filteredValidators: ValidatorData[];
}) => {
  const { chainStore } = useStore();

  const filterValidators = (validator: ValidatorData) => {
    return validator.amount
      .toDec()
      .gt(new CoinPretty(validator.amount.currency, "0").toDec());
  };

  const sortValidators = (a: ValidatorData, b: ValidatorData) => {
    return (
      parseFloat(b.amount.toDec().toString()) -
      parseFloat(a.amount.toDec().toString())
    );
  };

  return (
    <React.Fragment>
      {filteredValidators.length ? (
        filteredValidators
          .filter(filterValidators)
          .sort(sortValidators)
          .map((validator: ValidatorData) => (
            <MyValidatorCard
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
