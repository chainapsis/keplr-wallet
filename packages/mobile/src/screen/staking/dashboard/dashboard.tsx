import React, {FunctionComponent, useEffect, useMemo, useRef} from 'react';
import {PageWithScrollView} from '../../../components/page';

import {observer} from 'mobx-react-lite';
import {Text} from 'react-native';
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
import {useIntl} from 'react-intl';
import {formatAprString} from '../../home/utils';
import {InformationOutlinedIcon} from '../../../components/icon/information-outlined';
import {Modal} from '../../../components/modal';
import {InformationModal} from '../../../components/modal/infoModal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

export const StakingDashboardScreen: FunctionComponent = observer(() => {
  const {accountStore, queriesStore, priceStore, chainStore} = useStore();
  const style = useStyle();
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.Dashboard'>>();
  const navigation = useNavigation<StackNavProp>();
  const infoModalRef = useRef<BottomSheetModal>(null);

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

  useEffect(() => {
    navigation.setOptions({title: `Staking on ${chainInfo.chainName}`});
  }, [chainInfo.chainName, navigation]);

  const staked = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address,
  ).total;
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
  }[] = [
    {
      title: 'Staked Balance',
      validators: delegations,
      lenAlwaysShown: 4,
    },
    {
      title: 'Unstaking Balance',
      validators: unbondings,
      lenAlwaysShown: 4,
    },
  ];

  return (
    <PageWithScrollView
      backgroundMode="default"
      style={style.flatten(['padding-x-12'])}>
      <Box alignX="center" alignY="center" marginTop={21} marginBottom={35}>
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
        <Gutter size={21} />
        <Box
          onClick={() => {
            infoModalRef.current?.present();
          }}>
          <Columns sum={1} gutter={4} alignY="center">
            <Text style={style.flatten(['subtitle3', 'color-text-low'])}>
              Total staked
            </Text>

            <InformationOutlinedIcon
              size={20}
              color={style.get('color-gray-400').color}
            />
          </Columns>
        </Box>

        <Gutter size={6} />
        <Text style={style.flatten(['h1', 'color-text-high'])}>
          {staked?.maxDecimals(6).trim(true).shrink(true).toString()}
        </Text>
      </Box>

      <Box
        padding={16}
        borderRadius={8}
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
            onPress={() => {
              navigation.navigate('Stake', {
                screen: 'Stake.ValidateList',
                params: {chainId},
              });
            }}
          />
        </Columns>
      </Box>

      {ValidatorViewData.map(({title, validators, lenAlwaysShown}) => {
        if (validators.length === 0) {
          return null;
        }
        return (
          <React.Fragment key={title}>
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
      })}
      <Modal ref={infoModalRef} enableDynamicSizing={true}>
        <InformationModal
          title="Total staked"
          paragraph="The total of staked and unstaking amounts"
        />
      </Modal>
    </PageWithScrollView>
  );
});
