import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardBody } from "../../../../components/staging/card";
import { useStore } from "../../../../stores";
import { BondStatus } from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { Image, Text, View } from "react-native";
import { useStyle } from "../../../../styles";
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { Button } from "../../../../components/staging/button";
import { useSmartNavigation } from "../../../../navigation";

export const ValidatorDetailsCard: FunctionComponent<{
  validatorAddress: string;
}> = observer(({ validatorAddress }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Unbonded
  );

  const validator = useMemo(() => {
    return bondedValidators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators)
      .find((val) => val.operator_address === validatorAddress);
  }, [
    bondedValidators.validators,
    unbondingValidators.validators,
    unbondedValidators.validators,
    validatorAddress,
  ]);

  const smartNavigation = useSmartNavigation();

  const style = useStyle();

  return (
    <Card>
      {validator ? (
        <CardBody>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "margin-bottom-16",
            ])}
          >
            <Image
              style={style.flatten([
                "width-44",
                "height-44",
                "border-radius-64",
                "margin-right-12",
              ])}
              source={{
                uri: queries.cosmos.queryValidators
                  .getQueryStatus(BondStatus.Bonded)
                  .getValidatorThumbnail(validator.operator_address),
              }}
            />
            <Text style={style.flatten(["h4", "color-text-black-medium"])}>
              {validator.description.moniker}
            </Text>
          </View>
          <View style={style.flatten(["flex-row", "margin-bottom-12"])}>
            <View style={style.flatten(["flex-1"])}>
              <Text
                style={style.flatten([
                  "h6",
                  "color-text-black-medium",
                  "margin-bottom-4",
                ])}
              >
                Commision
              </Text>
              <Text style={style.flatten(["body3", "color-text-black-medium"])}>
                {new IntPretty(
                  new Dec(validator.commission.commission_rates.rate)
                )
                  .decreasePrecision(2)
                  .maxDecimals(2)
                  .trim(true)
                  .toString() + "%"}
              </Text>
            </View>
            <View style={style.flatten(["flex-1"])}>
              <Text
                style={style.flatten([
                  "h6",
                  "color-text-black-medium",
                  "margin-bottom-4",
                ])}
              >
                Voting Power
              </Text>
              <Text style={style.flatten(["body3", "color-text-black-medium"])}>
                {new CoinPretty(
                  chainStore.current.stakeCurrency,
                  new Dec(validator.tokens)
                )
                  .maxDecimals(0)
                  .toString()}
              </Text>
            </View>
          </View>
          <View style={style.flatten(["margin-bottom-14"])}>
            <Text
              style={style.flatten([
                "h6",
                "color-text-black-medium",
                "margin-bottom-4",
              ])}
            >
              Description
            </Text>
            <Text
              style={style.flatten(["body3", "color-text-black-medium"])}
              selectable={true}
            >
              {validator.description.details}
            </Text>
          </View>
          <Button
            text="Stake"
            onPress={() => {
              smartNavigation.navigateSmart("Delegate", {
                validatorAddress,
              });
            }}
          />
        </CardBody>
      ) : null}
    </Card>
  );
});
