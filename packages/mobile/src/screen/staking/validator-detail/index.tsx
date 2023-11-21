import React, {FunctionComponent} from 'react';

import {observer} from 'mobx-react-lite';

import {useStyle} from '../../../styles';

import {PageWithScrollView} from '../../../components/page';
import {Stack} from '../../../components/stack';
import {GuideBox} from '../../../components/guide-box';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavProp, StakeNavigation} from '../../../navigation';
import {UnbondingCard} from './unbonding-card';
import {DelegatedCard} from './delegated-card';
import {useStore} from '../../../stores';
import {Staking} from '@keplr-wallet/stores';
import {Box} from '../../../components/box';
import {Column, Columns} from '../../../components/column';
import {ValidatorImage} from '../components/validator-image';
import {Text} from 'react-native';
import {CoinPretty, Dec, RatePretty} from '@keplr-wallet/unit';
import {Button} from '../../../components/button';

export const ValidatorDetailScreen: FunctionComponent = observer(() => {
  const {queriesStore, chainStore} = useStore();

  const route = useRoute<RouteProp<StakeNavigation, 'Stake.ValidateDetail'>>();
  const navigation = useNavigation<StackNavProp>();
  const style = useStyle();
  const {validatorAddress, chainId} = route.params;
  const queries = queriesStore.get(chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded,
  );

  const validatorInfo = bondedValidators.validators
    .sort((a, b) => Number(b.tokens) - Number(a.tokens))
    .map((validator, i) => ({...validator, rank: i + 1}))
    .find(val => val.operator_address === validatorAddress);

  const thumbnail = bondedValidators.getValidatorThumbnail(validatorAddress);
  const chainInfo = chainStore.getChain(chainId);
  const token = new CoinPretty(
    chainInfo.stakeCurrency || chainInfo.feeCurrencies[0],
    new Dec(validatorInfo?.delegator_shares || 0),
  );

  const isCommissionHigh =
    Number(validatorInfo?.commission.commission_rates.rate) >= 0.2;
  const isTop10Validator = validatorInfo?.rank
    ? validatorInfo.rank <= 10
    : false;

  return (
    <PageWithScrollView
      backgroundMode="default"
      style={style.flatten(['padding-x-12', 'padding-y-12'])}>
      <Stack gutter={12}>
        {isCommissionHigh ? (
          <GuideBox
            title={`Commission ${new RatePretty(
              validatorInfo?.commission.commission_rates.rate || 0,
            )
              .maxDecimals(2)
              .toString()}`}
            paragraph={
              <Text style={style.flatten(['body2', 'color-yellow-500'])}>
                This validator is currently charging
                <Text style={style.flatten(['font-bold'])}> very high </Text>
                commissions. Consider staking to other validators with lower
                commissions to increaser your rewards.
              </Text>
            }
            color="warning"
          />
        ) : null}
        {isTop10Validator ? (
          <GuideBox
            title="You are staking to top 10 validator"
            paragraph="To improve decentralization, please consider staking to other validators"
            color="default"
          />
        ) : null}

        {validatorInfo ? (
          <Box
            paddingX={16}
            paddingY={20}
            backgroundColor={style.get('color-gray-600').color}
            borderRadius={6}>
            <Stack gutter={20}>
              <Columns sum={1} alignY="center" gutter={12}>
                <ValidatorImage
                  size={40}
                  imageUrl={thumbnail}
                  name={validatorInfo?.description.moniker}
                />
                <Text style={style.flatten(['subtitle2', 'color-text-high'])}>
                  {validatorInfo.description.moniker}
                </Text>
              </Columns>
              <Columns sum={1}>
                <Column weight={1}>
                  <Stack gutter={8}>
                    <Text
                      style={style.flatten([
                        'subtitle3',
                        'color-label-default',
                      ])}>
                      Commission
                    </Text>
                    <Text style={style.flatten(['body3', 'color-text-middle'])}>
                      {new RatePretty(
                        validatorInfo.commission.commission_rates.rate,
                      )
                        .maxDecimals(2)
                        .toString()}
                    </Text>
                  </Stack>
                </Column>

                <Column weight={1}>
                  <Stack gutter={8}>
                    <Text
                      style={style.flatten([
                        'subtitle3',
                        'color-label-default',
                      ])}>
                      Voting power
                    </Text>
                    <Text style={style.flatten(['body3', 'color-text-middle'])}>
                      {token.maxDecimals(10).trim(true).shrink(true).toString()}
                    </Text>
                  </Stack>
                </Column>
              </Columns>
              <Stack gutter={8}>
                <Text
                  style={style.flatten(['subtitle3', 'color-label-default'])}>
                  Description
                </Text>
                <Text style={style.flatten(['body3', 'color-text-middle'])}>
                  {validatorInfo.description.details}
                </Text>
              </Stack>
              <Button
                size="large"
                text="Stake"
                onPress={() => {
                  navigation.navigate('Stake', {
                    screen: 'Stake.Delegate',
                    params: {
                      chainId,
                      coinMinimalDenom: token.currency.coinMinimalDenom,
                      validatorAddress: validatorInfo.operator_address,
                    },
                  });
                }}
              />
            </Stack>
          </Box>
        ) : null}

        <DelegatedCard chainId={chainId} validatorAddress={validatorAddress} />
        <UnbondingCard chainId={chainId} validatorAddress={validatorAddress} />
      </Stack>
    </PageWithScrollView>
  );
});
