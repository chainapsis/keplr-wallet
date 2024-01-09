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
import {FormattedMessage, useIntl} from 'react-intl';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {CoinPretty} from '@keplr-wallet/unit';

export const DelegatedCard: FunctionComponent<{
  chainId: string;
  validatorAddress: string;
  isFromRedelegate?: boolean;
}> = observer(({validatorAddress, chainId, isFromRedelegate}) => {
  const {queriesStore, accountStore} = useStore();
  const navigation = useNavigation<StackNavProp>();
  const intl = useIntl();

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const style = useStyle();

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address,
  );

  const rewards = (() => {
    let reward: CoinPretty | undefined;
    const isDydx = ChainIdHelper.parse(chainId).identifier === 'dydx-mainnet';
    if (isDydx) {
      const denom =
        'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5';
      reward = queryRewards
        .getRewardsOf(validatorAddress)
        .find(r => r.currency.coinMinimalDenom === denom);
    } else {
      reward = queryRewards.getStakableRewardOf(validatorAddress);
    }
    //NOTE reward가 stake currency가 아닐경우 reward가 없을때 undefined로 반환될 떄가 있음
    //현재 usdc가 유일한 경우라서 하드코딩된 문자열로 처리함
    return !reward && isDydx
      ? '0 USDC'
      : reward
          ?.trim(true)
          .shrink(true)
          .maxDecimals(6)
          .inequalitySymbol(true)
          .hideIBCMetadata(true)
          .toString();
  })();

  return staked && !staked.toDec().isZero() ? (
    <Box>
      <Text
        style={style.flatten([
          'subtitle3',
          'color-text-middle',
          'padding-x-6',
          'padding-y-4',
        ])}>
        <FormattedMessage id="page.stake.validator-detail.delegated-card.label" />
      </Text>
      <Gutter size={8} />
      <Box
        paddingX={16}
        paddingY={20}
        borderRadius={6}
        backgroundColor={style.get('color-card-default').color}>
        <Columns sum={1} alignY="center">
          <Text style={style.flatten(['body1', 'color-text-middle'])}>
            <FormattedMessage id="page.stake.validator-detail.delegated-card.staked-label" />
          </Text>
          <Column weight={1} />
          <Text style={style.flatten(['body1', 'color-text-high'])}>
            {staked
              ?.trim(true)
              .shrink(true)
              .maxDecimals(6)
              .inequalitySymbol(true)
              .toString()}
          </Text>
        </Columns>

        <Gutter size={4} />

        <Columns sum={1} alignY="center">
          <Text style={style.flatten(['body1', 'color-text-middle'])}>
            <FormattedMessage id="page.stake.validator-detail.delegated-card.reward-label" />
          </Text>
          <Column weight={1} />
          <Text style={style.flatten(['body1', 'color-text-high'])}>
            {rewards}
          </Text>
        </Columns>

        {isFromRedelegate ? null : (
          <React.Fragment>
            <Gutter size={12} />

            <Columns sum={1} gutter={10}>
              <Button
                color="secondary"
                text={intl.formatMessage({
                  id: 'page.stake.validator-detail.delegated-card.redelegate-button',
                })}
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
                text={intl.formatMessage({
                  id: 'page.stake.validator-detail.delegated-card.undelegate-button',
                })}
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
          </React.Fragment>
        )}
      </Box>
    </Box>
  ) : null;
});
