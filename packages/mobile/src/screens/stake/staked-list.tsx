import React, { FunctionComponent, useMemo } from "react";
import { SafeAreaPage } from "../../components/page";
import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Text, Image, Card } from "react-native-elements";
import { View } from "react-native";
import { CoinPretty } from "@keplr-wallet/unit";
import {
  sf,
  fs13,
  flexDirectionRow,
  justifyContentBetween,
} from "../../styles";

const BondStatus = Staking.BondStatus;

export const StakedSummary: FunctionComponent<{
  thumbnail: string;
  validator: Staking.Validator;
  delegatedAmount: CoinPretty;
}> = observer(({ thumbnail, validator, delegatedAmount }) => {
  const { accountStore, queriesStore, chainStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const queries = queriesStore.get(chainStore.current.chainId);
  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  return (
    <Card>
      <View>
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
        <Text numberOfLines={1} style={fs13}>
          {validator.description.moniker}
        </Text>
      </View>
      <View style={sf([flexDirectionRow, justifyContentBetween])}>
        <Text>Staked</Text>
        <Text>{delegatedAmount.trim(true).toString()}</Text>
      </View>
      <View style={sf([flexDirectionRow, justifyContentBetween])}>
        <Text>Reward</Text>
        <Text>
          {rewards
            .getStakableRewardOf(validator.operator_address)
            .maxDecimals(6)
            .trim(true)
            .toString()}
        </Text>
      </View>
    </Card>
  );
});

export const StakedListScreen: FunctionComponent = observer(() => {
  const { accountStore, queriesStore, chainStore } = useStore();

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
    unbondingValidators.validators,
    unbondedValidators.validators,
  ]);

  // TODO: Memorize?
  const delegatedValidators = validators.filter((val) =>
    delegatedValidatorMap.get(val.operator_address)
  );

  return (
    <SafeAreaPage>
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
          <StakedSummary
            key={key}
            thumbnail={thumbnail}
            delegatedAmount={delegatedAmount}
            validator={validator}
          />
        );
      })}
    </SafeAreaPage>
  );
});
