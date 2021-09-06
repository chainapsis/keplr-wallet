import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardBody, CardHeader } from "../../../components/staging/card";
import { Text, View, ViewStyle } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { ValidatorThumbnail } from "../../../components/staging/thumbnail";
import { BondStatus } from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { useIntl } from "react-intl";

export const UnbondingCard: FunctionComponent<{
  containerStyle?: ViewStyle;

  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);
  const account = accountStore.getAccount(chainStore.current.chainId);

  const unbondings = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(account.bech32Address)
    .unbondingBalances.filter(
      (unbonding) => unbonding.validatorAddress === validatorAddress
    );

  return (
    <Card style={containerStyle}>
      <CardHeader title="My Unbondings" />
      <CardBody>
        {unbondings.map((unbonding) => {
          return (
            <ValidatorUnbodingsView
              key={unbonding.validatorAddress}
              validatorAddress={unbonding.validatorAddress}
              entries={unbonding.entries}
            />
          );
        })}
      </CardBody>
    </Card>
  );
});

const ValidatorUnbodingsView: FunctionComponent<{
  validatorAddress: string;
  entries: {
    creationHeight: Int;
    completionTime: string;
    balance: CoinPretty;
  }[];
}> = observer(({ validatorAddress, entries }) => {
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

  const style = useStyle();

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

  const thumbnail =
    bondedValidators.getValidatorThumbnail(validatorAddress) ||
    unbondingValidators.getValidatorThumbnail(validatorAddress) ||
    unbondedValidators.getValidatorThumbnail(validatorAddress);

  const intl = useIntl();

  return (
    <View>
      <View style={style.flatten(["flex-row", "items-center"])}>
        <ValidatorThumbnail size={32} url={thumbnail} />
        <Text
          style={style.flatten([
            "margin-left-8",
            "h6",
            "color-text-black-medium",
          ])}
        >
          {validator?.description.moniker ?? "..."}
        </Text>
      </View>
      {entries.map((entry, i) => {
        const remainingText = (() => {
          const current = new Date().getTime();

          const relativeEndTime =
            (new Date(entry.completionTime).getTime() - current) / 1000;
          const relativeEndTimeDays = Math.floor(relativeEndTime / (3600 * 24));
          const relativeEndTimeHours = Math.ceil(relativeEndTime / 3600);

          if (relativeEndTimeDays) {
            return (
              intl
                .formatRelativeTime(relativeEndTimeDays, "days", {
                  numeric: "always",
                })
                .replace("in ", "") + " left"
            );
          } else {
            return (
              intl
                .formatRelativeTime(relativeEndTimeHours, "hours", {
                  numeric: "always",
                })
                .replace("in ", "") + " left"
            );
          }
        })();

        return (
          <View key={i.toString()}>
            <View style={style.flatten(["flex-row", "items-center"])}>
              <Text
                style={style.flatten(["subtitle2", "color-text-black-medium"])}
              >
                {entry.balance
                  .shrink(true)
                  .trim(true)
                  .maxDecimals(6)
                  .toString()}
              </Text>
              <View style={style.get("flex-1")} />
              <Text style={style.flatten(["body2", "color-text-black-low"])}>
                {remainingText}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
});
