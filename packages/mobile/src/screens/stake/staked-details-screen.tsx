import React, { FunctionComponent, useMemo } from "react";
import { SafeAreaPage } from "../../components/page";
import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { StakedDetailsCard } from "./staked-details-card";
const BondStatus = Staking.BondStatus;

export const StakedDetailsScreen: FunctionComponent = observer(() => {
  const { accountStore, queriesStore, chainStore } = useStore();

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

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const delegations = queries
    .getQueryDelegations()
    .getQueryBech32Address(accountInfo.bech32Address);

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
          <StakedDetailsCard
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
