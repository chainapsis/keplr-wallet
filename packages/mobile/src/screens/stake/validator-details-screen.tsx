import React, { FunctionComponent } from "react";
import { Page } from "../../components/page";
import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { ValidatorDetailCard } from "./validator-detail-card";
import { useStore } from "../../stores";
import { UnbondingCard } from "./unbonding-card";
import { CoinPretty } from "@keplr-wallet/unit";

type Validator = Staking.Validator;

type ValidatorDetailsScreenProps = {
  route: {
    params: {
      validator: Validator;
      thumbnail: string;
      power: CoinPretty | undefined;
    };
  };
};

export const ValidatorDetailsScreen: FunctionComponent<ValidatorDetailsScreenProps> = observer(
  ({ route }) => {
    const { validator, thumbnail, power } = route.params;

    const { accountStore, queriesStore, chainStore } = useStore();

    const queries = queriesStore.get(chainStore.current.chainId);

    const unbondings = queries
      .getQueryUnbondingDelegations()
      .getQueryBech32Address(
        accountStore.getAccount(chainStore.current.chainId).bech32Address
      ).unbondings;

    const unbonding = unbondings.filter(
      (val) => val.validator_address === validator.operator_address
    );

    return (
      <Page>
        <ValidatorDetailCard
          validator={validator}
          thumbnail={thumbnail}
          power={power}
        />
        {unbonding.length > 0 ? <UnbondingCard unbondings={unbonding} /> : null}
      </Page>
    );
  }
);
