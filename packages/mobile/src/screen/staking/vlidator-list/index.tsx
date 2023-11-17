import React, {FunctionComponent, useState} from 'react';

import {observer} from 'mobx-react-lite';
import {FlatList} from 'react-native';
import {StakeNavigation} from '../../../navigation';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useStore} from '../../../stores';
import {Staking} from '@keplr-wallet/stores';
import {ValidatorInfo} from '../type';
import {Box} from '../../../components/box';
import {DebounceSearchTextInput} from '../../../components/input/search-text-input';
import {ValidatorItem, ViewValidator} from '../components/validator-item';
import {CoinPretty, Dec, RatePretty} from '@keplr-wallet/unit';
import {useStyle} from '../../../styles';
import {Gutter} from '../../../components/gutter';
import {ArrowDownUpIcon} from '../../../components/icon';
import {TextButton} from '../../../components/text-button';

type FilterOption = 'Commission' | 'Voting';
export const ValidatorListScreen: FunctionComponent = observer(() => {
  const {queriesStore, chainStore, accountStore} = useStore();
  const [thumbnailLen, setThumbnailLen] = useState(20);
  const style = useStyle();
  const [filterOption, setFilterOption] = useState<FilterOption>('Voting');
  const [search, setSearch] = useState('');

  const route = useRoute<RouteProp<StakeNavigation, 'Stake.ValidateList'>>();
  const {chainId} = route.params;
  const chainInfo = chainStore.getChain(chainId);
  const queries = queriesStore.get(chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );
  const bondedToken = queries.cosmos.queryPool.bondedTokens;

  const delegationsValidator =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address,
    ).delegations;

  console.log(delegationsValidator.length);

  const activeValidators: ValidatorInfo[] = bondedValidators.validators
    .sort((a, b) => Number(b.tokens) - Number(a.tokens))
    .map((validator, i) => ({...validator, rank: i + 1}));

  const filteredValidators: {
    viewValidator: ViewValidator;
    validatorInfo: ValidatorInfo;
  }[] = (() => {
    const _search = search.trim().toLowerCase();
    const _filteredValidators = activeValidators.filter(val => {
      return val.description.moniker?.toLocaleLowerCase().includes(_search);
    });

    if (filterOption === 'Voting') {
      return _filteredValidators.map(val => {
        const coin = new CoinPretty(
          chainInfo.stakeCurrency || chainInfo.feeCurrencies[0],
          new Dec(val.delegator_shares),
        );
        return {
          viewValidator: {
            name: val.description.moniker,
            validatorAddress: val.operator_address,
            imageUrl: bondedValidators.getValidatorThumbnail(
              val.operator_address,
            ),
            coin,
            subString:
              bondedToken?.toCoin().amount === '0'
                ? '0%'
                : new RatePretty(
                    coin.toDec().quo(bondedToken?.toDec() || new Dec(1)),
                  )
                    .maxDecimals(2)
                    .toString(),
            isDelegation: !!delegationsValidator.find(
              del => del.delegation.validator_address === val.operator_address,
            ),
          },
          validatorInfo: val,
        };
      });
    }
    if (filterOption === 'Commission') {
      return _filteredValidators
        .sort(
          (a, b) =>
            Number(a.commission.commission_rates.rate) -
            Number(b.commission.commission_rates.rate),
        )
        .map(val => {
          return {
            viewValidator: {
              name: val.description.moniker,
              validatorAddress: val.operator_address,
              imageUrl: bondedValidators.getValidatorThumbnail(
                val.operator_address,
              ),
              subString: new RatePretty(val.commission.commission_rates.rate)
                .maxDecimals(2)
                .toString(),
              isDelegation: !!delegationsValidator.find(
                del =>
                  del.delegation.delegator_address === val.operator_address,
              ),
            },
            validatorInfo: val,
          };
        });
    }
    return [];
  })();
  // const filteredValidators: {
  //   viewValidator: ViewValidator;
  //   validatorInfo: ValidatorInfo;
  // }[] = useMemo(() => {
  //   const _search = search.trim().toLowerCase();
  //   const _filteredValidators = activeValidators.filter(val => {
  //     return val.description.moniker?.toLocaleLowerCase().includes(_search);
  //   });
  //   if (filterOption === 'Voting') {
  //     return _filteredValidators.slice(0, thumbnailLen).map(val => {
  //       const coin = new CoinPretty(
  //         chainInfo.stakeCurrency || chainInfo.feeCurrencies[0],
  //         new Dec(val.delegator_shares),
  //       );
  //       return {
  //         viewValidator: {
  //           name: val.description.moniker,
  //           validatorAddress: val.operator_address,
  //           // imageUrl: '',
  //           imageUrl: bondedValidators.getValidatorThumbnail(
  //             val.operator_address,
  //           ),
  //           coin,
  //           subString:
  //             bondedToken?.toCoin().amount === '0'
  //               ? '0%'
  //               : new RatePretty(
  //                   coin.toDec().quo(bondedToken?.toDec() || new Dec(1)),
  //                 )
  //                   .maxDecimals(2)
  //                   .toString(),
  //         },
  //         validatorInfo: val,
  //       };
  //     });
  //   }
  //   // if (filterOption === 'Commission') {
  //   //   return activeValidators.sort(
  //   //     (a, b) =>
  //   //       Number(b.commission.commission_rates.rate) -
  //   //       Number(a.commission.commission_rates.rate),
  //   //   );
  //   // }
  //   return [];
  // }, [
  //   activeValidators,
  //   bondedToken,
  //   chainInfo.feeCurrencies,
  //   chainInfo.stakeCurrency,
  //   filterOption,
  //   search,
  // ]);

  //NOTE flatList render item안에는 observe 할 수 없어서 외부에서 썸네일 리스트를 만들고 사용

  return (
    // <Box></Box>
    <FlatList
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
      keyExtractor={item => item.validatorInfo.consensus_pubkey.key}
      data={filteredValidators}
      maxToRenderPerBatch={20}
      onEndReached={() => {
        setThumbnailLen(thumbnailLen + 20);
      }}
      ItemSeparatorComponent={() => <Gutter size={8} />}
      renderItem={({item: validator}) => {
        return (
          <ValidatorItem
            viewValidator={validator.viewValidator}
            coinMaxDecimal={9}
            coinTextStyle={style.flatten(['body2', 'color-text-low'])}
            subStringStyle={style.flatten(['body2', 'color-text-low'])}
            afterSelect={() => {}}
          />
        );
      }}
    />
  );
});
