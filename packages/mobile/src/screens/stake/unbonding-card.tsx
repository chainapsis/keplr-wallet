import React, { FunctionComponent, useMemo } from "react";

import moment from "moment";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Staking } from "@keplr-wallet/stores";
import { Text, Avatar, Card } from "react-native-elements";
import { View } from "react-native";

const BondStatus = Staking.BondStatus;
type UnbondingDelegation = Staking.UnbondingDelegation;

const UnbondingItem: FunctionComponent<{
  thumbnail: string;
  validator: Staking.Validator;
  entry: {
    creation_height: string;
    completion_time: string;
    initial_balance: string;
    balance: string;
  };
  progress: number;
}> = ({ thumbnail, validator, entry, progress }) => {
  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <Avatar
          source={{ uri: thumbnail }}
          size={40}
          rounded
          icon={{ name: "user", type: "font-awesome" }}
        />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 13,
              flex: 1,
            }}
          >
            {validator.description.moniker}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text>{entry.balance}</Text>
            <Text>{moment(entry.completion_time).fromNow()}</Text>
          </View>
        </View>
      </View>
      <Text> progress : {progress.toFixed(3)}</Text>
    </View>
  );
};

const UnbondingList: FunctionComponent<{
  unbondings: UnbondingDelegation[];
}> = observer(({ unbondings }) => {
  const { queriesStore, chainStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValdiators = queries
    .getQueryValidators()
    .getQueryStatus(BondStatus.Bonded);
  const unbondingValidators = queries
    .getQueryValidators()
    .getQueryStatus(BondStatus.Unbonding);
  const unbondedValidators = queries
    .getQueryValidators()
    .getQueryStatus(BondStatus.Unbonded);

  const validators = useMemo(() => {
    return bondedValdiators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators);
  }, [
    bondedValdiators.validators,
    unbondingValidators.validators,
    unbondedValidators.validators,
  ]);

  const stakingParams = queries.getQueryStakingParams();

  return (
    <React.Fragment>
      {unbondings.map((unbonding) => {
        const validator = validators.find(
          (val) => val.operator_address === unbonding.validator_address
        );

        if (!validator) {
          console.log(
            `This can not be happened. Can't find the validator: ${unbonding.validator_address}`
          );
          return;
        }

        const thumbnail =
          bondedValdiators.getValidatorThumbnail(validator.operator_address) ||
          unbondedValidators.getValidatorThumbnail(
            validator.operator_address
          ) ||
          unbondingValidators.getValidatorThumbnail(validator.operator_address);

        return (
          <React.Fragment key={unbonding.validator_address}>
            {unbonding.entries.map((entry, key) => {
              const remainingComplete = moment(entry.completion_time).diff(
                moment(),
                "seconds"
              );

              // Set unbonding time as 21 days by default.
              let unbondingTime = 3600 * 24 * 21;
              if (stakingParams.response) {
                unbondingTime =
                  parseFloat(
                    stakingParams.response.data.result.unbonding_time
                  ) /
                  10 ** 9;
              }
              const progress = 100 - (remainingComplete / unbondingTime) * 100;

              return (
                <UnbondingItem
                  key={key}
                  progress={progress}
                  entry={entry}
                  validator={validator}
                  thumbnail={thumbnail}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
});

export const UnbondingCard: FunctionComponent<{
  unbondings: UnbondingDelegation[];
}> = ({ unbondings }) => {
  return (
    <Card
      containerStyle={{
        padding: 16,
        marginHorizontal: 0,
        marginVertical: 16,
        borderRadius: 6,
      }}
    >
      <Card.Title h4 style={{ textAlign: "left", marginBottom: 0 }}>
        UnDelegating
      </Card.Title>
      <UnbondingList unbondings={unbondings} />
    </Card>
  );
};
