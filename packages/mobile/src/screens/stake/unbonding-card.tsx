import React, { FunctionComponent, useMemo } from "react";

// eslint-disable-next-line @typescript-eslint/no-var-requires
import moment from "moment";
// const moment = require("moment");

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Staking } from "@keplr-wallet/stores";
import { Text, Avatar, Card } from "react-native-elements";
import { View } from "react-native";

const BondStatus = Staking.BondStatus;

const UnbondingList: FunctionComponent<{
  chainId: string;
}> = observer(({ chainId }) => {
  const { accountStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainId);

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
  const unbondings = queries
    .getQueryUnbondingDelegations()
    .getQueryBech32Address(accountStore.getAccount(chainId).bech32Address);

  return (
    <React.Fragment>
      {unbondings.unbondingBalances.map((unbondingBalance) => {
        const validator = validators.find(
          (val) => val.operator_address === unbondingBalance.validatorAddress
        );

        if (!validator) {
          console.log(
            `This can not be happened. Can't find the validator: ${unbondingBalance.validatorAddress}`
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
          <React.Fragment key={unbondingBalance.validatorAddress}>
            {unbondingBalance.entries.map((entry, key) => {
              const remainingComplete = moment(entry.completionTime).diff(
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
                <View key={key}>
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
                        <Text>{entry.balance.trim(true).toString()}</Text>
                        <Text>{moment(entry.completionTime).fromNow()}</Text>
                      </View>
                    </View>
                  </View>
                  <Text> progress : {progress.toFixed(3)}</Text>
                </View>
              );
            })}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
});

export const UnbondingCard: FunctionComponent<{ chainIds: string[] }> = ({
  chainIds,
}) => {
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
      {chainIds.map((chainId) => {
        return <UnbondingList key={chainId} chainId={chainId} />;
      })}
    </Card>
  );
};
