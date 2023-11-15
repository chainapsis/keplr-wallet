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
import {Column, Columns} from '../../../components/column';
import {StakingIcon} from '../../../components/icon/stacking';
import {Gutter} from '../../../components/gutter';
import {YAxis} from '../../../components/axis';
import {Button} from '../../../components/button';
import LinearGradient from 'react-native-linear-gradient';

export const StakingDashboardScreen: FunctionComponent = observer(() => {
  const {accountStore, queriesStore, priceStore} = useStore();
  const style = useStyle();
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.Dashboard'>>();
  // const style = useStyle();
  const {chainId} = route.params;
  const stakbleToken = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address,
    ).stakable?.balance;

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
      <Box
        padding={16}
        borderRadius={8}
        marginBottom={12}
        backgroundColor={style.get('color-gray-600').color}>
        <Columns sum={1} alignY="center" gutter={8}>
          <Columns sum={1} gutter={12} alignY="center">
            <LinearGradient
              colors={['rgba(113,196,255,0.4)', 'rgba(211,120,254,0.4)']}
              style={style.flatten([
                'border-radius-64',
                'width-36',
                'height-36',
              ])}>
              <Box alignX="center" alignY="center" width={36} height={36}>
                <StakingIcon size={18} color={style.get('color-white').color} />
              </Box>
            </LinearGradient>

            <YAxis>
              <Text style={style.flatten(['subtitle4', 'color-text-low'])}>
                Available for Staking
              </Text>
              <Gutter size={4} />
              <Text
                numberOfLines={1}
                style={style.flatten(['subtitle2', 'color-text-high'])}>
                {stakbleToken
                  ?.maxDecimals(6)
                  .inequalitySymbol(true)
                  .shrink(true)
                  .toString()}
              </Text>
            </YAxis>
          </Columns>
          <Column weight={1} />
          <Button
            style={style.flatten(['padding-x-16', 'padding-y-8'])}
            text="Stake"
            size="small"
          />
        </Columns>
      </Box>

      {ValidatorViewData.map(({title, balance, lenAlwaysShown}) => {
        if (balance.length === 0) {
          return null;
        }
        return (
          <CollapsibleList
            key={title}
            title={<TokenTitleView title={title} />}
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
                  key={del.delegation.validator_address}
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
