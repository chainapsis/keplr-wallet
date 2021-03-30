import React, { FunctionComponent, useMemo } from "react";

import { Dec, DecUtils } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { Text, Badge, Avatar, Card } from "react-native-elements";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Staking } from "@keplr-wallet/stores";
import { TouchableOpacity } from "react-native-gesture-handler";
const BondStatus = Staking.BondStatus;
type Validator = Staking.Validator;

/*
 * To reduce the rendering count of table, split the validator's row component and memorize it.
 * The `validator` and `power` props expected to be deleivered from the computed value of mobx.
 * So, it probably doens't make the unnecessary re-render.
 */

/* eslint-disable react/display-name */
const Validator: FunctionComponent<{
  index: number;
  validator: Validator;
  thumbnail: string;
  isDelegated: boolean;
}> = React.memo(({ index, validator, thumbnail, isDelegated }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        // navigation.navigate("Validator Details", { validator });
        navigation.navigate("Details");
      }}
    >
      <View
        style={{
          borderTopWidth: 0.5,
          borderTopColor: "#CDCDCD",
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            flex: 1,
          }}
        >
          {index + 1}
        </Text>
        <View
          style={{
            flex: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Avatar
            source={{ uri: thumbnail }}
            size={40}
            rounded
            icon={{ name: "user", type: "font-awesome" }}
          />
          <Text
            numberOfLines={1}
            style={{
              fontSize: 13,
            }}
          >
            {validator.description.moniker}
          </Text>
          {isDelegated ? <Badge status="primary" /> : null}
        </View>
        <Text
          style={{
            flex: 1,
          }}
        >
          {`${DecUtils.trim(
            new Dec(validator.commission.commission_rates.rate)
              .mul(DecUtils.getPrecisionDec(2))
              .toString(1)
          )}%`}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export const AllValidators: FunctionComponent<{
  chainId: string;
  blacklistValidators?: {
    [validatorAddress: string]: true | undefined;
  };
}> = observer(({ chainId, blacklistValidators = {} }) => {
  const { accountStore, queriesStore } = useStore();
  const queries = queriesStore.get(chainId);
  const bondedValidators = queries
    .getQueryValidators()
    .getQueryStatus(BondStatus.Bonded);

  const delegations = queries
    .getQueryDelegations()
    .getQueryBech32Address(accountStore.getAccount(chainId).bech32Address);

  const delegatedValidators = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const del of delegations.delegations) {
      map.set(del.validator_address, true);
    }
    return map;
    // `delegations.delegations` is a computed getter, so it is safe to use it as memo's deps.
  }, [delegations.delegations]);

  const renderableValidators = bondedValidators.validatorsSortedByVotingPower.filter(
    (val) => !blacklistValidators[val.operator_address]
  );

  return (
    <Card
      containerStyle={{
        padding: 0,
        marginHorizontal: 0,
        marginVertical: 16,
        borderRadius: 6,
      }}
    >
      <Card.Title
        h4
        style={{
          marginBottom: 0,
          paddingVertical: 12,
          paddingHorizontal: 16,
          textAlign: "left",
        }}
      >
        All Validators
      </Card.Title>
      {/* To Do Loading progress bar */}
      {/* {bondedValidators.isFetching || delegations.isFetching ? (
          <Icon></Icon>
        ) : null} */}
      {renderableValidators.map((val, key) => {
        const thumbnail = bondedValidators.getValidatorThumbnail(
          val.operator_address
        );

        return (
          <Validator
            key={key.toString()}
            index={key}
            validator={val}
            thumbnail={thumbnail}
            isDelegated={delegatedValidators.get(val.operator_address) != null}
          />
        );
      })}
    </Card>
  );
});
