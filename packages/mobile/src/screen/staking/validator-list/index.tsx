import React, {FunctionComponent, useMemo, useState} from 'react';

import {observer} from 'mobx-react-lite';
import {FlatList} from 'react-native';
import {StakeNavigation} from '../../../navigation';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useStore} from '../../../stores';
import {Staking} from '@keplr-wallet/stores';
import {ValidatorInfo} from '../type';
import {Box} from '../../../components/box';
import {DebounceSearchTextInput} from '../../../components/input/search-text-input';
import {ValidatorListItem} from '../components/validator-item';
import {useStyle} from '../../../styles';
import {Gutter} from '../../../components/gutter';
import {ArrowDownUpIcon} from '../../../components/icon';
import {TextButton} from '../../../components/text-button';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type FilterOption = 'Commission' | 'Voting';
export const ValidatorListScreen: FunctionComponent = observer(() => {
  const {queriesStore} = useStore();
  const style = useStyle();
  const [filterOption, setFilterOption] = useState<FilterOption>('Voting');
  const [search, setSearch] = useState('');
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.ValidateList'>>();
  const {chainId} = route.params;
  const queries = queriesStore.get(chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );
  const insect = useSafeAreaInsets();

  const activeValidators: ValidatorInfo[] = bondedValidators.validators
    .sort((a, b) => Number(b.tokens) - Number(a.tokens))
    .map((validator, i) => ({...validator, rank: i + 1}));

  const filteredValidators = useMemo(() => {
    const _search = search.trim().toLowerCase();
    const _filteredValidators = activeValidators.filter(val => {
      return val.description.moniker?.toLocaleLowerCase().includes(_search);
    });

    if (filterOption === 'Voting') {
      return _filteredValidators;
    }
    if (filterOption === 'Commission') {
      return _filteredValidators.sort(
        (a, b) =>
          Number(a.commission.commission_rates.rate) -
          Number(b.commission.commission_rates.rate),
      );
    }
    return [];
  }, [activeValidators, filterOption, search]);
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
      keyExtractor={item => item.consensus_pubkey.key}
      data={filteredValidators}
      ItemSeparatorComponent={() => <Gutter size={8} />}
      renderItem={({item: validator}) => {
        return (
          <ValidatorListItem
            filterOption={filterOption}
            chainId={chainId}
            validatorAddress={validator.operator_address}
            afterSelect={() => {}}
          />
        );
      }}
    />
  );
});
