import React, {FunctionComponent, useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react-lite';
import {FlatList} from 'react-native';
import {StackNavProp, StakeNavigation} from '../../../navigation';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '../../../stores';
import {Staking} from '@keplr-wallet/stores';
import {Box} from '../../../components/box';
import {DebounceSearchTextInput} from '../../../components/input/search-text-input';
import {ValidatorListItem} from '../components/validator-item';
import {useStyle} from '../../../styles';
import {Gutter} from '../../../components/gutter';
import {ArrowDownUpIcon} from '../../../components/icon';
import {TextButton} from '../../../components/text-button';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ValidatorInfo} from '../type';

export type FilterOption = 'Commission' | 'Voting';
export const ValidatorListScreen: FunctionComponent = observer(() => {
  const {queriesStore, accountStore} = useStore();
  const style = useStyle();
  const [filterOption, setFilterOption] = useState<FilterOption>('Voting');
  const [search, setSearch] = useState('');
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.ValidateList'>>();
  const navigation = useNavigation<StackNavProp>();

  const {chainId, validatorSelector} = route.params;
  const queries = queriesStore.get(chainId);

  const delegationsValidatorSet = useMemo(() => {
    return new Set(
      queries.cosmos.queryDelegations
        .getQueryBech32Address(accountStore.getAccount(chainId).bech32Address)
        .delegations.map(del => del.delegation.validator_address),
    );
  }, [accountStore, chainId, queries.cosmos.queryDelegations]);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );
  const insect = useSafeAreaInsets();

  const filteredValidators = useMemo(() => {
    const _search = search.trim().toLowerCase();
    const _filteredValidators = bondedValidators.validators.filter(val => {
      return val.description.moniker?.toLocaleLowerCase().includes(_search);
    });

    if (filterOption === 'Voting') {
      return _filteredValidators.sort(
        (a, b) => Number(b.tokens) - Number(a.tokens),
      );
    }
    if (filterOption === 'Commission') {
      return _filteredValidators.sort(
        (a, b) =>
          Number(a.commission.commission_rates.rate) -
          Number(b.commission.commission_rates.rate),
      );
    }
    return [];
  }, [bondedValidators.validators, filterOption, search]);

  const renderItem = useCallback(
    ({item: validator}: {item: ValidatorInfo}) => {
      return (
        <ValidatorListItem
          key={validator.operator_address}
          filterOption={filterOption}
          chainId={chainId}
          validatorAddress={validator.operator_address}
          validator={validator}
          bondedToken={queries.cosmos.queryPool.bondedTokens}
          isDelegation={delegationsValidatorSet.has(validator.operator_address)}
          afterSelect={() => {
            if (validatorSelector) {
              validatorSelector(
                validator.operator_address,
                validator.description?.moniker || validator.operator_address,
              );
              navigation.goBack();
              return;
            }
            navigation.navigate('Stake', {
              screen: 'Stake.ValidateDetail',
              params: {chainId, validatorAddress: validator.operator_address},
            });
          }}
        />
      );
    },
    [
      chainId,
      delegationsValidatorSet,
      filterOption,
      navigation,
      queries.cosmos.queryPool.bondedTokens,
      validatorSelector,
    ],
  );
  return (
    <FlatList
      style={{
        paddingHorizontal: 12,
        marginBottom: insect.bottom,
      }}
      ListHeaderComponent={
        <Box marginTop={12}>
          <DebounceSearchTextInput
            placeholder="Search for Chain"
            handleSearchWord={e => {
              setSearch(e);
            }}
            delay={200}
          />
          <Gutter size={8} />
          <Box paddingY={6} paddingX={4} alignX="right">
            {/* TODO 이후 버튼 모달로 변경해야함 */}
            <TextButton
              text={filterOption}
              onPress={() => {
                setFilterOption(
                  filterOption === 'Commission' ? 'Voting' : 'Commission',
                );
              }}
              textStyle={style.flatten(['subtitle4', 'color-text-low'])}
              rightIcon={
                <ArrowDownUpIcon
                  size={6}
                  color={style.get('color-text-middle').color}
                />
              }
            />
          </Box>
        </Box>
      }
      keyExtractor={item => item.operator_address}
      data={filteredValidators}
      ItemSeparatorComponent={() => <Gutter size={8} />}
      renderItem={renderItem}
      windowSize={33}
    />
  );
});
