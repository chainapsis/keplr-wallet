import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import {
  Card,
  CardBody,
  CardDivider,
} from "../../../../components/staging/card";
import { Image, Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../../../styles";
import { StakedTokenSymbol } from "../../../../components/staging/token-symbol";
import { Button } from "../../../../components/staging/button";
import {
  BondStatus,
  Validator,
} from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { RightArrowIcon } from "../../../../components/staging/icon";
import { RectButton } from "react-native-gesture-handler";

export const DelegationsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const staked = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  ).total;

  const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegations = queryDelegations.delegations;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonded
  );

  const validators = useMemo(() => {
    return bondedValidators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators);
  }, [
    bondedValidators.validators,
    unbondingValidators.validators,
    unbondedValidators.validators,
  ]);

  const validatorsMap = useMemo(() => {
    const map: Map<string, Validator> = new Map();

    for (const val of validators) {
      map.set(val.operator_address, val);
    }

    return map;
  }, [validators]);

  const style = useStyle();

  return (
    <Card style={containerStyle}>
      <CardBody>
        <Text
          style={style.flatten([
            "h4",
            "color-text-black-very-high",
            "margin-bottom-20",
          ])}
        >
          My Delegations
        </Text>
        <View style={style.flatten(["flex-row", "items-center"])}>
          <StakedTokenSymbol size={40} />
          <View style={style.flatten(["margin-left-12"])}>
            <Text
              style={style.flatten([
                "body3",
                "color-secondary",
                "margin-bottom-4",
              ])}
            >
              Staked
            </Text>
            <Text style={style.flatten(["h5", "color-text-black-medium"])}>
              {staked.maxDecimals(6).trim(true).shrink(true).toString()}
            </Text>
          </View>
          <View style={style.flatten(["flex-1"])} />
          <Button
            text="Stake"
            size="small"
            containerStyle={style.flatten(["min-width-80"])}
          />
        </View>
      </CardBody>
      <CardDivider />
      <CardBody style={style.flatten(["padding-x-0", "padding-y-10"])}>
        {delegations.map((del) => {
          const val = validatorsMap.get(del.validator_address);
          if (!val) {
            return null;
          }

          const thumbnail = bondedValidators.getValidatorThumbnail(
            val.operator_address
          );

          const amount = queryDelegations.getDelegationTo(val.operator_address);

          return (
            <RectButton
              key={del.validator_address}
              style={style.flatten([
                "flex-row",
                "items-center",
                "padding-x-16",
                "padding-y-10",
              ])}
            >
              <Image
                style={style.flatten([
                  "width-40",
                  "height-40",
                  "border-radius-64",
                  "border-width-1",
                  "border-color-border-white",
                  "margin-right-16",
                ])}
                source={{ uri: thumbnail }}
              />
              <Text
                style={style.flatten([
                  "h5",
                  "color-text-black-medium",
                  "max-width-160",
                ])}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {val.description.moniker}
              </Text>
              <View style={style.flatten(["flex-1"])} />
              <Text
                style={style.flatten([
                  "body1",
                  "color-text-black-low",
                  "margin-right-12",
                ])}
              >
                {amount.maxDecimals(4).trim(true).shrink(true).toString()}
              </Text>
              <RightArrowIcon
                height={12}
                color={style.get("color-text-black-low").color}
              />
            </RectButton>
          );
        })}
      </CardBody>
    </Card>
  );
});
