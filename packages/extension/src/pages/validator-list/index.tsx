import searchIcon from "@assets/icon/search.png";
import { Staking } from "@keplr-wallet/stores";
import { HeaderLayout } from "@layouts/header-layout";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { ValidatorCard } from "./validator-card";
import { CoinPretty } from "@keplr-wallet/unit";

type ValidatorData = Staking.Validator & { amount: CoinPretty };

export const ValidatorList: FunctionComponent = observer(() => {
  const history = useHistory();

  const [validators, setValidators] = useState<
    { [key in string]: ValidatorData }
  >({});
  const [filteredValidators, setFilteredValidators] = useState<ValidatorData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState<string>();
  const { chainStore, queriesStore, accountStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  useEffect(() => {
    const fetchValidators = async () => {
      setLoading(true);
      const bondedValidators = await queries.cosmos.queryValidators
        .getQueryStatus(Staking.BondStatus.Bonded)
        .waitFreshResponse();
      const unbondingValidators = await queries.cosmos.queryValidators
        .getQueryStatus(Staking.BondStatus.Unbonding)
        .waitFreshResponse();
      const unbondedValidators = await queries.cosmos.queryValidators
        .getQueryStatus(Staking.BondStatus.Unbonded)
        .waitFreshResponse();

      const map: {
        [key in string]: ValidatorData;
      } = {};
      for (const val of [
        ...(bondedValidators?.data.validators || []),
        ...(unbondingValidators?.data.validators || []),
        ...(unbondedValidators?.data.validators || []),
      ]) {
        const amount = queryDelegations.getDelegationTo(val.operator_address);

        map[val.operator_address] = { ...val, amount };
      }
      setValidators(map);
      setFilteredValidators(Object.values(map));
      setLoading(false);
    };
    fetchValidators();
  }, [queries.cosmos.queryValidators, queryDelegations]);

  const sortValidators = (a: ValidatorData, b: ValidatorData) => {
    return parseFloat(b.delegator_shares) - parseFloat(a.delegator_shares);
  };

  const handleFilterValidators = (searchValue: string) => {
    const filteredValidators = Object.values(validators).filter((validator) =>
      searchValue?.trim().length
        ? validator.description.moniker
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          validator.operator_address
            ?.toLowerCase()
            .includes(searchValue.toLowerCase())
        : true
    );
    setFilteredValidators(filteredValidators);
    setSearchInput(searchValue);
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Stake"
      onBackButton={() => history.push("/")}
    >
      <p className={classnames("h2", "my-0", "font-weight-normal")}>
        Validators
      </p>
      <div className={style.searchContainer}>
        <div className={style.searchBox}>
          <img draggable={false} src={searchIcon} alt="search" />
          <input
            placeholder="Search by Validator name or address"
            value={searchInput}
            disabled={loading}
            onChange={(e) => handleFilterValidators(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "110px 0px",
          }}
        >
          <div className={style.loader}>
            <svg viewBox="0 0 80 80">
              <rect x="8" y="8" width="64" height="64" />
            </svg>
          </div>
          <br />
          Loading Validators
        </div>
      ) : filteredValidators.length ? (
        filteredValidators
          .sort((a, b) => sortValidators(a, b))
          .map((validator: ValidatorData) => (
            <ValidatorCard
              validator={validator}
              chainID={chainStore.current.chainId}
              key={validator.operator_address}
            />
          ))
      ) : (
        <div style={{ textAlign: "center" }}>No Validators Found</div>
      )}
    </HeaderLayout>
  );
});
