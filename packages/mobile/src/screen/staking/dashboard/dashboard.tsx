import React, {FunctionComponent, useMemo} from 'react';
import {PageWithScrollView} from '../../../components/page';

import {observer} from 'mobx-react-lite';
import {Text} from 'react-native';
import {useStore} from '../../../stores';
import {RouteProp, useRoute} from '@react-navigation/native';
import {StakeNavigation} from '../../../navigation';
import {Staking} from '@keplr-wallet/stores';
import {ValidatorItem} from '../components/validator-item';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {CollapsibleList} from '../../../components/collapsible-list';
import {TokenTitleView} from '../../home/components/token';

export const StakingDashboardScreen: FunctionComponent = observer(() => {
  const {accountStore, queriesStore, priceStore} = useStore();
  const style = useStyle();
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.Dashboard'>>();
  // const style = useStyle();
  const {chainId} = route.params;
  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const staked = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address,
  ).total;
  const totalStakedPrice = staked
    ? priceStore.calculatePrice(staked)
    : undefined;

  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address,
    );
  const delegations = queryDelegations.delegations;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding,
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded,
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
    const map: Map<string, Staking.Validator> = new Map();

    for (const val of validators) {
      map.set(val.operator_address, val);
    }

    return map;
  }, [validators]);

  const ValidatorViewData: {
    title: string;
    balance: Staking.Delegation[];
    lenAlwaysShown: number;
  }[] = [
    {
      title: 'Staked Balance',
      balance: delegations,
      lenAlwaysShown: 4,
    },
  ];

  return (
    <PageWithScrollView backgroundMode="default">
      <Box
        alignX="center"
        padding={20}
        style={style.flatten(['margin-left-16'])}>
        <Text style={style.flatten(['h5', 'color-text-high'])}>
          {staked?.maxDecimals(6).trim(true).shrink(true).toString()}
        </Text>
        <Text style={style.flatten(['h5', 'color-text-high'])}>
          {totalStakedPrice?.inequalitySymbol(true).toString()}
        </Text>
      </Box>

      {ValidatorViewData.map(({title, balance, lenAlwaysShown}) => {
        if (balance.length === 0) {
          return null;
        }
        return (
          <CollapsibleList
            key={title}
            title={<TokenTitleView onOpenModal={() => {}} title={title} />}
            lenAlwaysShown={lenAlwaysShown}
            items={balance.map(del => {
              const validator = validatorsMap.get(
                del.delegation.validator_address,
              );
              if (!validator) {
                return null;
              }

              const thumbnail =
                bondedValidators.getValidatorThumbnail(
                  validator.operator_address,
                ) ||
                unbondingValidators.getValidatorThumbnail(
                  validator.operator_address,
                ) ||
                unbondedValidators.getValidatorThumbnail(
                  validator.operator_address,
                );

              const amount = queryDelegations.getDelegationTo(
                validator.operator_address,
              );
              return (
                <ValidatorItem
                  chainId={chainId}
                  imageUrl={thumbnail}
                  address={del.delegation.validator_address}
                  name={validator.description.moniker || ''}
                  coin={amount}
                  price={amount ? priceStore.calculatePrice(amount) : undefined}
                  afterSelect={() => {
                    console.log('click');
                  }}
                />
              );
            })}
          />
        );
      })}
    </PageWithScrollView>
  );
});
