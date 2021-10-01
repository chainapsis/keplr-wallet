import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { StakedTokenSymbol } from "../../../components/token-symbol";
import { Button } from "../../../components/button";
import {
  BondStatus,
  Validator,
} from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { RightArrowIcon } from "../../../components/icon";
import { useSmartNavigation } from "../../../navigation";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { RectButton } from "../../../components/rect-button";

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

  const smartNavigation = useSmartNavigation();

  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-bottom-28"])}>
        <Text
          style={style.flatten([
            "h4",
            "color-text-black-very-high",
            "margin-bottom-28",
          ])}
        >
          My Staking
        </Text>
        <View style={style.flatten(["flex-row", "items-center"])}>
          <StakedTokenSymbol size={44} />
          <View style={style.flatten(["margin-left-16"])}>
            <Text
              style={style.flatten([
                "subtitle3",
                "color-primary",
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
            containerStyle={style.flatten(["min-width-72"])}
            onPress={() => {
              smartNavigation.navigateSmart("Validator.List", {});
            }}
          />
        </View>
      </CardBody>
      {delegations && delegations.length > 0 && <CardDivider />}
      {delegations && delegations.length > 0 && (
        <CardBody style={style.flatten(["padding-x-0", "padding-y-14"])}>
          {delegations.map((del) => {
            const val = validatorsMap.get(del.validator_address);
            if (!val) {
              return null;
            }

            const thumbnail =
              bondedValidators.getValidatorThumbnail(val.operator_address) ||
              unbondingValidators.getValidatorThumbnail(val.operator_address) ||
              unbondedValidators.getValidatorThumbnail(val.operator_address);

            const amount = queryDelegations.getDelegationTo(
              val.operator_address
            );

            return (
              <RectButton
                key={del.validator_address}
                style={style.flatten([
                  "flex-row",
                  "items-center",
                  "padding-x-20",
                  "padding-y-14",
                ])}
                onPress={() => {
                  smartNavigation.navigateSmart("Validator.Details", {
                    validatorAddress: del.validator_address,
                  });
                }}
              >
                <ValidatorThumbnail
                  style={style.flatten(["margin-right-16"])}
                  size={40}
                  url={thumbnail}
                />
                <Text
                  style={style.flatten([
                    "h6",
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
      )}
    </Card>
  );
});
