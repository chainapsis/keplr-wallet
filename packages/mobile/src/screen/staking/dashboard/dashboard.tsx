import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';
import {PageWithScrollView} from '../../../components/page';

import {observer} from 'mobx-react-lite';
import {RefreshControl, Text} from 'react-native';
import {useStore} from '../../../stores';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavProp, StakeNavigation} from '../../../navigation';
import {Staking} from '@keplr-wallet/stores';
import {ValidatorItem, ViewValidator} from '../components/validator-item';
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
import {CoinPretty} from '@keplr-wallet/unit';
import {formatRelativeTimeString} from '../../../utils/format';
import {FormattedMessage, useIntl} from 'react-intl';
import {formatAprString} from '../../home/utils';
import {InformationOutlinedIcon} from '../../../components/icon/information-outlined';
import {InformationModal} from '../../../components/modal/infoModal';
import {Skeleton} from '../../../components/skeleton';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export const StakingDashboardScreen: FunctionComponent = observer(() => {
  const {accountStore, queriesStore, priceStore, chainStore} = useStore();
  const style = useStyle();
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.Dashboard'>>();
  const navigation = useNavigation<StackNavProp>();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const intl = useIntl();
  const {chainId} = route.params;
  const stakbleToken = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address,
    ).stakable?.balance;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);
  const chainInfo = chainStore.getChain(chainId);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: intl.formatMessage(
        {id: 'page.stake.dashboard.title'},
        {
          chainName: chainInfo.chainName,
        },
      ),
    });
  }, [chainInfo.chainName, intl, navigation]);

  const totalUnbonding =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address,
    ).total;
  const totalDelegation = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address,
  ).total;

  const totalStaked = totalUnbonding
    ? totalDelegation?.add(totalUnbonding)
    : totalDelegation;

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

  const queryDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address,
    );
  const queryUnbondings =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address,
    );

  const unbondings: ViewValidator[] = (() => {
    const res = [];
    for (const unbonding of queryUnbondings.unbondings) {
      for (const entry of unbonding.entries) {
        if (!chainInfo.stakeCurrency) {
          continue;
        }

        const validator = validatorsMap.get(unbonding.validator_address);
        if (!validator) {
          continue;
        }

        const balance = new CoinPretty(chainInfo.stakeCurrency, entry.balance);

        res.push({
          coin: balance,
          name: validator.description.moniker,
          validatorAddress: validator.operator_address,
          subString: formatRelativeTimeString(intl, entry.completion_time),
        });
      }
    }
    return res;
  })();

  const delegations: ViewValidator[] = (() => {
    const res: ViewValidator[] = [];

    for (let delegation of queryDelegations.delegations) {
      const validator = validatorsMap.get(
        delegation.delegation.validator_address,
      );
      if (!validator) {
        continue;
      }

      const amount = queryDelegations.getDelegationTo(
        validator.operator_address,
      );

      res.push({
        coin: amount,
        name: validator.description.moniker,
        validatorAddress: validator.operator_address,
        subString: amount
          ? priceStore.calculatePrice(amount)?.inequalitySymbol(true).toString()
          : undefined,
      });
    }

    return res;
  })();

  const ValidatorViewData: {
    title: string;
    validators: ViewValidator[];
    lenAlwaysShown: number;
    key: 'delegations' | 'unbondings';
  }[] = [
    {
      title: intl.formatMessage({id: 'page.stake.staked-balance-title'}),
      validators: delegations,
      lenAlwaysShown: 4,
      key: 'delegations',
    },
    {
      title: intl.formatMessage({id: 'page.stake.unstaking-balance-title'}),
      validators: unbondings,
      lenAlwaysShown: 4,
      key: 'unbondings',
    },
  ];
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryDelegations.waitFreshResponse(),
      queryUnbondings.waitFreshResponse(),
    ]);

    setRefreshing(false);
  };

  //NOTE bondedValidators.isFetching값으로 지정할 경우 방문시 마다 캐싱이 안돼서
  //skeleton이 매번 보이게됨, 해서 한번 로딩을 했으면 그때부터는 isNotReady를 false로 설정함
  const isNotReady =
    (!delegations.length && !unbondings.length) || !validators.length;

  return (
    <PageWithScrollView
      backgroundMode="default"
      style={style.flatten(['padding-x-12'])}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={style.get('color-gray-200').color}
        />
      }>
      <Box alignX="center" alignY="center" marginTop={21} marginBottom={35}>
        <Skeleton isNotReady={isNotReady} type="circle">
          <Box
            borderRadius={16}
            backgroundColor={style.get('color-gray-600').color}
            paddingX={12}
            paddingY={6}>
            <Text style={style.flatten(['body3', 'color-text-middle'])}>
              {`APR ${formatAprString(
                queriesStore.get(chainId).apr.queryApr.apr.apr,
                2,
              )}%`}
            </Text>
          </Box>
        </Skeleton>

        <Gutter size={21} />
        <TouchableWithoutFeedback
          onPress={() => {
            if (isNotReady) {
              return;
            }

            setIsInfoModalOpen(true);
          }}>
          <Skeleton isNotReady={isNotReady} type="rect">
            <Columns sum={1} gutter={4} alignY="center">
              <Text style={style.flatten(['subtitle3', 'color-text-low'])}>
                <FormattedMessage id="page.stake.dashboard.total-staked-info-modal.title" />
              </Text>

              <InformationOutlinedIcon
                size={20}
                color={style.get('color-gray-400').color}
              />
            </Columns>
          </Skeleton>
        </TouchableWithoutFeedback>

        <Gutter size={6} />
        <Skeleton isNotReady={isNotReady} type="rect">
          <Text style={style.flatten(['h1', 'color-text-high'])}>
            {totalStaked?.maxDecimals(6).trim(true).shrink(true).toString()}
          </Text>
        </Skeleton>
      </Box>

      <Box
        padding={16}
        borderRadius={8}
        backgroundColor={style.get('color-card-default').color}>
        <Columns sum={1} alignY="center" gutter={8}>
          <Columns sum={1} gutter={12} alignY="center">
            <LinearGradient
              colors={['rgba(113,196,255,0.4)', 'rgba(211,120,254,0.4)']}
              style={style.flatten([
                'border-radius-64',
                'width-36',
                'height-36',
              ])}>
              <Skeleton layer={1} isNotReady={isNotReady} type="circle">
                <Box alignX="center" alignY="center" width={36} height={36}>
                  <StakingIcon
                    size={18}
                    color={style.get('color-white').color}
                  />
                </Box>
              </Skeleton>
            </LinearGradient>

            <YAxis>
              <Skeleton type="rect" isNotReady={isNotReady} layer={1}>
                <Text style={style.flatten(['subtitle4', 'color-text-low'])}>
                  <FormattedMessage id="page.stake.dashboard.staking-button.label" />
                </Text>
              </Skeleton>
              <Gutter size={4} />
              <Skeleton layer={1} type="rect" isNotReady={isNotReady}>
                <Text
                  numberOfLines={1}
                  style={style.flatten(['subtitle2', 'color-text-high'])}>
                  {stakbleToken
                    ?.maxDecimals(6)
                    .inequalitySymbol(true)
                    .shrink(true)
                    .toString()}
                </Text>
              </Skeleton>
            </YAxis>
          </Columns>
          <Column weight={1} />
          <Skeleton layer={1} isNotReady={isNotReady} type="button">
            <Button
              style={style.flatten(['padding-x-16', 'padding-y-8'])}
              text={intl.formatMessage({
                id: 'page.stake.dashboard.staking-button',
              })}
              size="medium"
              onPress={() => {
                navigation.navigate('Stake', {
                  screen: 'Stake.ValidateList',
                  params: {chainId},
                });
              }}
            />
          </Skeleton>
        </Columns>
      </Box>
      {isNotReady ? (
        <Box>
          <Gutter size={12} />
          <ValidatorItem
            chainId={chainId}
            viewValidator={{
              name: '',
              validatorAddress: '',
              coin: stakbleToken,
              subString: 'placehold',
            }}
            afterSelect={() => {}}
            isNotReady={isNotReady}
          />
        </Box>
      ) : (
        ValidatorViewData.map(({title, validators, lenAlwaysShown, key}) => {
          if (validators.length === 0) {
            return null;
          }

          return (
            <React.Fragment key={key}>
              <Gutter size={12} />
              <CollapsibleList
                title={<TokenTitleView title={title} />}
                hideLength={true}
                itemKind="validators"
                lenAlwaysShown={lenAlwaysShown}
                items={validators.map(validator => {
                  return (
                    <ValidatorItem
                      chainId={chainId}
                      viewValidator={{
                        coin: validator.coin,
                        name: validator.name,
                        validatorAddress: validator.validatorAddress,
                        subString: validator.subString,
                        isDelegation: key === 'delegations' ? true : false,
                      }}
                      key={validator.validatorAddress + validator.subString}
                      afterSelect={() => {
                        navigation.navigate('Stake', {
                          screen: 'Stake.ValidateDetail',
                          params: {
                            chainId,
                            validatorAddress: validator.validatorAddress,
                          },
                        });
                      }}
                    />
                  );
                })}
              />
            </React.Fragment>
          );
        })
      )}

      <InformationModal
        isOpen={isInfoModalOpen}
        setIsOpen={setIsInfoModalOpen}
        title={intl.formatMessage({
          id: 'page.stake.dashboard.total-staked-info-modal.title',
        })}
        paragraph={intl.formatMessage({
          id: 'page.stake.dashboard.total-staked-info-modal.paragraph',
        })}
      />
    </PageWithScrollView>
  );
});
