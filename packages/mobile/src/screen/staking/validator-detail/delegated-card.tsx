import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {Text} from 'react-native';
import {useStyle} from '../../../styles';
import {Button} from '../../../components/button';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {Column, Columns} from '../../../components/column';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';

export const DelegatedCard: FunctionComponent<{
  chainId: string;
  validatorAddress: string;
}> = observer(({validatorAddress, chainId}) => {
  const {queriesStore, accountStore} = useStore();
  const navigation = useNavigation<StackNavProp>();

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const style = useStyle();

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const rewards = queries.cosmos.queryRewards
    .getQueryBech32Address(account.bech32Address)
    .getStakableRewardOf(validatorAddress);

  return staked && !staked.toDec().isZero() ? (
    <Box>
      <Text
        style={style.flatten([
          'subtitle3',
          'color-text-middle',
          'padding-x-6',
          'padding-y-4',
        ])}>
        My Staking
      </Text>
      <Gutter size={8} />
      <Box
        paddingX={16}
        paddingY={20}
        borderRadius={6}
        backgroundColor={style.get('color-gray-600').color}>
        <Columns sum={1} alignY="center">
          <Text style={style.flatten(['body1', 'color-text-middle'])}>
            Staked
          </Text>
          <Column weight={1} />
          <Text style={style.flatten(['body1', 'color-text-high'])}>
            {staked?.trim(true).shrink(true).maxDecimals(6).toString()}
          </Text>
        </Columns>

        <Gutter size={4} />

        <Columns sum={1} alignY="center">
          <Text style={style.flatten(['body1', 'color-text-middle'])}>
            Rewards
          </Text>
          <Column weight={1} />
          <Text style={style.flatten(['body1', 'color-text-high'])}>
            {rewards?.trim(true).shrink(true).maxDecimals(6).toString()}
          </Text>
        </Columns>

        <Gutter size={12} />

        <Columns sum={1} gutter={10}>
          <Button
            color="secondary"
            text="Switch Validator"
            containerStyle={style.flatten(['flex-1'])}
            size="large"
            onPress={() => {
              navigation.navigate('Stake', {
                screen: 'Stake.Redelegate',
                params: {
                  chainId,
                  validatorAddress,
                },
              });
            }}
          />
          <Button
            containerStyle={style.flatten(['flex-1'])}
            text="Unstake"
            size="large"
            onPress={() => {
              navigation.navigate('Stake', {
                screen: 'Stake.Undelegate',
                params: {
                  chainId,
                  validatorAddress,
                },
              });
            }}
          />
        </Columns>
      </Box>
    </Box>
  ) : null;
});
