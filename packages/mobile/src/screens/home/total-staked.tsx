import React, { FunctionComponent, useMemo } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Card, Image } from "react-native-elements";
import { View } from "react-native";
import { Staking } from "@keplr-wallet/stores";
import { useNavigation } from "@react-navigation/native";
import { FlexButton } from "../../components/buttons";
import {
  flexDirectionRow,
  justifyContentBetween,
  sf,
  alignItemsCenter,
  h5,
  fcHigh,
  subtitle2,
  body2,
  br3,
  mr1,
  mt1,
  mb2,
  mt3,
  mt0,
  bbw1,
  bcGray,
  py3,
} from "../../styles";

const BondStatus = Staking.BondStatus;

export const TotalStakedView: FunctionComponent = observer(() => {
  const { accountStore, queriesStore, chainStore } = useStore();
  const navigation = useNavigation();

  const queries = queriesStore.get(chainStore.current.chainId);
  const bondedValdiators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonded
  );

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const delegations = queries.cosmos.queryDelegations.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const delegatedValidatorMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const del of delegations.delegations) {
      map.set(del.validator_address, true);
    }
    return map;
    // `delegations.delegations` is a computed getter, so it is safe to use it as memo's deps.
  }, [delegations.delegations]);

  const validators = useMemo(() => {
    return bondedValdiators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators);
  }, [
    bondedValdiators.validators,
    unbondedValidators.validators,
    unbondingValidators.validators,
  ]);

  // TODO: Memorize?
  const delegatedValidators = validators.filter((val) =>
    delegatedValidatorMap.get(val.operator_address)
  );

  return (
    <Card containerStyle={mt3}>
      <Text style={sf([h5, fcHigh])}>My Delegations</Text>
      <View
        style={sf([flexDirectionRow, justifyContentBetween, py3, bbw1, bcGray])}
      >
        <Text style={subtitle2}>Total Staked</Text>
        <Text style={subtitle2}>
          {delegations.total.maxDecimals(6).trim(true).shrink(true).toString()}
        </Text>
      </View>
      {delegatedValidators.map((validator, key) => {
        const thumbnail =
          bondedValdiators.getValidatorThumbnail(validator.operator_address) ||
          unbondedValidators.getValidatorThumbnail(
            validator.operator_address
          ) ||
          unbondingValidators.getValidatorThumbnail(validator.operator_address);

        const delegatedAmount = delegations.getDelegationTo(
          validator.operator_address
        );

        return (
          <View
            key={key}
            style={sf([
              flexDirectionRow,
              justifyContentBetween,
              alignItemsCenter,
              mb2,
              key === 0 ? mt3 : mt0,
            ])}
          >
            <View style={sf([flexDirectionRow, alignItemsCenter])}>
              <Image
                style={sf([
                  {
                    width: 18,
                    height: 18,
                  },
                  br3,
                  mr1,
                ])}
                source={
                  thumbnail
                    ? {
                        uri: thumbnail,
                      }
                    : require("../../assets/svg/icons8-person.png")
                }
              />
              <Text style={subtitle2}>{validator.description.moniker}</Text>
            </View>
            <Text style={body2}>{delegatedAmount?.trim(true).toString()}</Text>
          </View>
        );
      })}
      <FlexButton
        containerStyle={[mt1]}
        title="Staking Dashboard"
        onPress={() => {
          navigation.navigate("Stake", { screen: "Validator List" });
        }}
      />
    </Card>
  );
});
