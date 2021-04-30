import React, { FunctionComponent, useMemo } from "react";

import { Dec, DecUtils, CoinPretty, IntPretty } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { Text, Badge } from "react-native-elements";
import { View, FlatList } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { Staking } from "@keplr-wallet/stores";
import {
  alignItemsCenter,
  flex1,
  flexDirectionRow,
  fs13,
  sf,
  cardStyle,
  bgcWhite,
  shadow,
  justifyContentCenter,
  body3,
  subtitle2,
} from "../../styles";
import { Image } from "react-native-elements";
const BondStatus = Staking.BondStatus;

/*
 * To reduce the rendering count of table, split the validator's row component and memorize it.
 * The `validator` and `power` props expected to be deleivered from the computed value of mobx.
 * So, it probably doens't make the unnecessary re-render.
 */

type ValidatorProps = {
  index: number;
  validator: Staking.Validator;
  thumbnail: string;
  power: CoinPretty | undefined;
  inflation: IntPretty;
  isDelegated: boolean;
};

/* eslint-disable react/display-name */
const Validator: FunctionComponent<ValidatorProps> = React.memo(
  ({ index, validator, thumbnail, power, inflation, isDelegated }) => {
    const navigation = useNavigation();

    return (
      <RectButton
        onPress={() => {
          navigation.navigate("Validator Details", {
            validator,
            thumbnail,
            power,
          });
        }}
        rippleColor="#AAAAAA"
      >
        <View
          accessible
          style={{
            borderTopWidth: 0.5,
            borderTopColor: "#CDCDCD",
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={sf([flex1, alignItemsCenter, justifyContentCenter])}>
            <Text style={body3}>{index + 1}</Text>
          </View>
          <View style={sf([{ flex: 8 }, flexDirectionRow, alignItemsCenter])}>
            <Image
              style={{
                width: 20,
                height: 20,
                borderRadius: 100,
                marginRight: 10,
              }}
              source={
                thumbnail
                  ? {
                      uri: thumbnail,
                    }
                  : require("../../assets/svg/icons8-person.png")
              }
            />
            <Text numberOfLines={1} style={subtitle2}>
              {validator.description.moniker}
            </Text>
            {isDelegated ? <Badge status="primary" /> : null}
          </View>
          <View
            style={sf([{ flex: 2 }, alignItemsCenter, justifyContentCenter])}
          >
            <Text style={body3}>
              {`${DecUtils.trim(
                inflation
                  .toDec()
                  .mul(
                    new Dec(1).sub(
                      new Dec(validator.commission.commission_rates.rate)
                    )
                  )
                  .toString(1)
              )}%`}
            </Text>
          </View>
        </View>
      </RectButton>
    );
  }
);

export const AllValidators: FunctionComponent<{
  blacklistValidators?: {
    [validatorAddress: string]: true | undefined;
  };
}> = observer(({ blacklistValidators = {} }) => {
  const { accountStore, queriesStore, chainStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);

  const inflation = queries.getQueryInflation().inflation;

  const bondedValidators = queries
    .getQueryValidators()
    .getQueryStatus(BondStatus.Bonded);

  const delegations = queries
    .getQueryDelegations()
    .getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

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

  const flatListValidatorData = useMemo(() => {
    return renderableValidators.map((validator, index) => {
      const thumbnail = bondedValidators.getValidatorThumbnail(
        validator.operator_address
      );

      const power = bondedValidators.getValidatorShare(
        validator.operator_address
      );

      return { index, validator, thumbnail, inflation, power };
    });
  }, [renderableValidators, bondedValidators, inflation]);

  const renderValidator: FunctionComponent<{
    item: {
      index: number;
      validator: Staking.Validator;
      thumbnail: string;
      inflation: IntPretty;
      power: CoinPretty | undefined;
    };
  }> = ({ item }) => (
    <Validator
      index={item.index}
      validator={item.validator}
      thumbnail={item.thumbnail}
      inflation={item.inflation}
      power={item.power}
      isDelegated={
        delegatedValidators.get(item.validator.operator_address) != null
      }
    />
  );

  return (
    <View style={sf([cardStyle, bgcWhite, shadow])}>
      {/* <Text>All Validators</Text> */}
      {/* To Do Loading progress bar */}
      {/* {bondedValidators.isFetching || delegations.isFetching ? (
          <Icon></Icon>
        ) : null} */}
      <FlatList
        data={flatListValidatorData}
        renderItem={renderValidator}
        windowSize={5}
      />
    </View>
  );
});
