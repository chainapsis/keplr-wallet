import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {Text, View} from 'react-native';
import {useStyle} from '../../../styles';
import {useIntl} from 'react-intl';
import {ProgressBar} from '../../../components/progress-bar';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {Stack} from '../../../components/stack';
import {Column, Columns} from '../../../components/column';

export const UnbondingCard: FunctionComponent<{
  validatorAddress: string;
  chainId: string;
}> = observer(({validatorAddress, chainId}) => {
  const {accountStore, queriesStore} = useStore();

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(account.bech32Address)
    .unbondingBalances.find(
      unbonding => unbonding.validatorAddress === validatorAddress,
    );

  const style = useStyle();

  const intl = useIntl();

  return unbonding ? (
    <Box>
      <Text
        style={style.flatten([
          'subtitle3',
          'color-text-middle',
          'padding-x-6',
          'padding-y-4',
        ])}>
        My Unstaking
      </Text>
      <Gutter size={8} />
      <Box
        paddingX={16}
        paddingY={20}
        borderRadius={6}
        backgroundColor={style.get('color-gray-600').color}>
        <Stack gutter={24}>
          {unbonding.entries.map((entry, i) => {
            const remainingText = (() => {
              const current = new Date().getTime();

              const relativeEndTime =
                (new Date(entry.completionTime).getTime() - current) / 1000;
              const relativeEndTimeDays = Math.floor(
                relativeEndTime / (3600 * 24),
              );
              const relativeEndTimeHours = Math.ceil(relativeEndTime / 3600);

              if (relativeEndTimeDays) {
                return (
                  intl
                    .formatRelativeTime(relativeEndTimeDays, 'days', {
                      numeric: 'always',
                    })
                    .replace('in ', '') + ' left'
                );
              } else if (relativeEndTimeHours) {
                return (
                  intl
                    .formatRelativeTime(relativeEndTimeHours, 'hours', {
                      numeric: 'always',
                    })
                    .replace('in ', '') + ' left'
                );
              }

              return '';
            })();
            const progress = (() => {
              const currentTime = new Date().getTime();
              const endTime = new Date(entry.completionTime).getTime();
              const remainingTime = Math.floor((endTime - currentTime) / 1000);
              const unbondingTime = queries.cosmos.queryStakingParams.response
                ? queries.cosmos.queryStakingParams.unbondingTimeSec
                : 3600 * 24 * 21;

              return Math.max(
                0,
                Math.min(100 - (remainingTime / unbondingTime) * 100, 100),
              );
            })();

            return (
              <View key={i.toString()}>
                <Columns sum={1}>
                  <Text style={style.flatten(['body1', 'color-text-middle'])}>
                    {entry.balance
                      .shrink(true)
                      .trim(true)
                      .maxDecimals(6)
                      .toString()}
                  </Text>
                  <Column weight={1} />
                  <Text style={style.flatten(['body2', 'color-text-middle'])}>
                    {remainingText}
                  </Text>
                </Columns>
                <View>
                  <ProgressBar progress={progress} />
                </View>
              </View>
            );
          })}
        </Stack>
      </Box>
    </Box>
  ) : null;
});
