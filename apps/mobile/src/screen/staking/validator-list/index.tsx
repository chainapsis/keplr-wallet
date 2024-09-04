import React, {FunctionComponent, useMemo, useState} from 'react';

import {observer} from 'mobx-react-lite';
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
import {SelectItemModal} from '../../../components/modal/select-item-modal';
import {Dec} from '@keplr-wallet/unit';
import {
  BoundaryScrollView,
  BoundaryScrollViewBoundary,
} from '../../../components/boundary-scroll-view';
import {EmptyView, EmptyViewText} from '../../../components/empty-view';
import {useIntl} from 'react-intl';

export type FilterOption = 'Commission' | 'Voting Power';

export const ValidatorListScreen: FunctionComponent = observer(() => {
  const {queriesStore, accountStore} = useStore();
  const style = useStyle();
  const [filterOption, setFilterOption] =
    useState<FilterOption>('Voting Power');
  const [search, setSearch] = useState('');
  const intl = useIntl();
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.ValidateList'>>();
  const navigation = useNavigation<StackNavProp>();
  const filterItems: {
    option: FilterOption;
    title: string;
  }[] = [
    {
      option: 'Commission',
      title: intl.formatMessage({
        id: 'page.stake.validator-list.option.commission',
      }),
    },
    {
      option: 'Voting Power',
      title: intl.formatMessage({
        id: 'page.stake.validator-list.option.voting-power',
      }),
    },
  ];

  const {chainId, validatorSelector, fromDeepLink} = route.params;
  const queries = queriesStore.get(chainId);

  const bech32Address = accountStore.getAccount(chainId).bech32Address;
  const delegationsValidatorSet = useMemo(() => {
    return new Set(
      queries.cosmos.queryDelegations
        .getQueryBech32Address(bech32Address)
        .delegations.map(del => del.delegation.validator_address),
    );
  }, [bech32Address, queries.cosmos.queryDelegations]);
  const icsProviderParamsQuery = queries.cosmos.queryICSProviderParams;
  const bondedValidatorsQuery = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );
  const bondedValidators = useMemo(() => {
    if (icsProviderParamsQuery.maxProviderConsensusValidators != null) {
      return bondedValidatorsQuery.validators
        .sort((a, b) => {
          const aTokens = new Dec(a.tokens);
          const bTokens = new Dec(b.tokens);
          if (aTokens.gt(bTokens)) {
            return -1;
          } else if (aTokens.equals(bTokens)) {
            return 0;
          } else {
            return 1;
          }
        })
        .slice(0, icsProviderParamsQuery.maxProviderConsensusValidators);
    } else {
      return bondedValidatorsQuery.validators;
    }
  }, [
    bondedValidatorsQuery.validators,
    icsProviderParamsQuery.maxProviderConsensusValidators,
  ]);
  const safeAreaInsets = useSafeAreaInsets();
  const [isOpenSelectItemModal, setIsOpenSelectItemModal] = useState(false);

  const sortedValidators = useMemo(() => {
    if (filterOption === 'Voting Power') {
      return bondedValidators.slice().sort((a, b) => {
        const aTokens = new Dec(a.tokens);
        const bTokens = new Dec(b.tokens);
        if (aTokens.gt(bTokens)) {
          return -1;
        } else if (aTokens.equals(bTokens)) {
          return 0;
        } else {
          return 1;
        }
      });
    }
    if (filterOption === 'Commission') {
      return bondedValidators.slice().sort((a, b) => {
        const aRate = new Dec(a.commission.commission_rates.rate);
        const bRate = new Dec(b.commission.commission_rates.rate);
        if (aRate.lt(bRate)) {
          return -1;
        } else if (aRate.equals(bRate)) {
          return 0;
        } else {
          return 1;
        }
      });
    }
    return [];
  }, [bondedValidators, filterOption]);

  const filteredValidators = useMemo(() => {
    const _search = search.trim().toLowerCase();
    return sortedValidators.filter(val => {
      return val.description.moniker?.toLocaleLowerCase().includes(_search);
    });
  }, [search, sortedValidators]);

  return (
    <Box style={style.flatten(['flex-1'])} paddingTop={12}>
      <Box paddingX={12} paddingBottom={4}>
        <DebounceSearchTextInput
          placeholder={intl.formatMessage({
            id: 'page.stake.validator-list.search-input-placeholder',
          })}
          handleSearchWord={e => {
            setSearch(e);
          }}
          delay={200}
        />
        <Gutter size={8} />
        <Box paddingY={6} paddingX={4} alignX="right">
          <TextButton
            text={
              filterOption === 'Voting Power'
                ? intl.formatMessage({
                    id: 'page.stake.validator-list.option.voting-power',
                  })
                : intl.formatMessage({
                    id: 'page.stake.validator-list.option.commission',
                  })
            }
            onPress={() => {
              setIsOpenSelectItemModal(true);
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

      <BoundaryScrollView
        contentContainerStyle={{
          ...style.flatten(['flex-grow-1', 'padding-x-12']),
          paddingBottom: safeAreaInsets.bottom,
        }}>
        {filteredValidators.length === 0 ? (
          <React.Fragment>
            <Gutter size={102} />
            <EmptyView>
              <Box alignX="center" paddingX={39}>
                <EmptyViewText
                  text={intl.formatMessage({
                    id: 'page.stake.validator-list.empty-title',
                  })}
                />
                <Gutter size={12} />
                <EmptyViewText
                  text={intl.formatMessage({
                    id: 'page.stake.validator-list.empty-text',
                  })}
                />
              </Box>
            </EmptyView>
          </React.Fragment>
        ) : (
          <BoundaryScrollViewBoundary
            itemHeight={filterOption === 'Voting Power' ? 70 : 64}
            gap={8}
            data={filteredValidators}
            renderItem={(validator: Staking.Validator) => {
              return (
                <ValidatorListItem
                  filterOption={filterOption}
                  chainId={chainId}
                  validatorAddress={validator.operator_address}
                  validator={validator}
                  bondedToken={queries.cosmos.queryPool.bondedTokens}
                  isDelegation={delegationsValidatorSet.has(
                    validator.operator_address,
                  )}
                  afterSelect={() => {
                    if (validatorSelector) {
                      navigation.push('Stake', {
                        screen: 'Stake.ValidateDetail',
                        params: {
                          chainId,
                          validatorAddress: validator.operator_address,
                          validatorSelector,
                          fromDeepLink,
                        },
                      });
                      return;
                    }
                    navigation.navigate('Stake', {
                      screen: 'Stake.ValidateDetail',
                      params: {
                        chainId,
                        validatorAddress: validator.operator_address,
                        fromDeepLink,
                      },
                    });
                  }}
                />
              );
            }}
            keyExtractor={item => item.operator_address}
          />
        )}
      </BoundaryScrollView>

      <SelectItemModal
        isOpen={isOpenSelectItemModal}
        setIsOpen={setIsOpenSelectItemModal}
        items={filterItems.map(item => ({
          key: item.option,
          title: item.title,
          selected: item.option === filterOption,
          onSelect: () => {
            setFilterOption(item.option);
            setIsOpenSelectItemModal(false);
          },
        }))}
      />
    </Box>
  );
});
