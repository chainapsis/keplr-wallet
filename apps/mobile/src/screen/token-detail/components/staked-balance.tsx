import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {XAxis, YAxis} from '../../../components/axis';
import {Dec} from '@keplr-wallet/unit';
import {Text} from 'react-native';
import {Gutter} from '../../../components/gutter';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation.tsx';
import {APR_API_URL} from '../../../config.ts';
import {Button} from '../../../components/button';
import {ChainImageFallback} from '../../../components/image';

export const StakedBalance: FunctionComponent<{
  chainId: string;
}> = observer(({chainId}) => {
  const {queriesStore, accountStore, chainStore} = useStore();

  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const queryAPR = queriesStore.simpleQuery.queryGet<{
    apr: number;
  }>(APR_API_URL, `/apr/${chainStore.getChain(chainId).chainIdentifier}`);

  const queryDelegation = queriesStore
    .get(chainId)
    .cosmos.queryDelegations.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address,
    );

  const stakeBalanceIsZero =
    !queryDelegation.total || queryDelegation.total.toDec().equals(new Dec(0));

  return (
    <Box
      style={style.flatten([
        'padding-x-16',
        'padding-y-20',
        'background-color-card-default',
        'border-radius-6',
      ])}>
      {!stakeBalanceIsZero ? (
        <YAxis>
          <XAxis alignY="center">
            <Text style={style.flatten(['subtitle3', 'color-text-high'])}>
              Staking Details
            </Text>

            <Gutter size={8} />

            <Box
              paddingX={6}
              paddingY={4}
              borderRadius={5}
              backgroundColor={'rgba(17, 35, 119, 0.7)'}>
              {queryAPR.response &&
              'apr' in queryAPR.response.data &&
              typeof queryAPR.response.data.apr === 'number' &&
              queryAPR.response.data.apr > 0 ? (
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '400',
                    color: style.get('color-blue-100').color,
                  }}>
                  {`${new Dec(queryAPR.response.data.apr)
                    .mul(new Dec(100))
                    .toString(2)}% APR`}
                </Text>
              ) : null}
            </Box>
          </XAxis>

          <Box
            style={style.flatten([
              'background-color-gray-500',
              'height-1',
              'flex-1',
              'margin-y-10',
            ])}
          />
        </YAxis>
      ) : null}

      <XAxis alignY="center">
        <Box alignX="center" alignY="center">
          <ChainImageFallback
            style={{
              width: 36,
              height: 36,
            }}
            src={chainStore.getChain(chainId).stakeCurrency?.coinImageUrl}
            alt={
              chainStore.getChain(chainId).stakeCurrency?.coinDenom ??
              chainStore.getChain(chainId).currencies[0].coinDenom
            }
          />
        </Box>

        <Gutter size={12} />

        <YAxis>
          {(() => {
            if (
              stakeBalanceIsZero &&
              chainStore.getChain(chainId).walletUrlForStaking
            ) {
              return (
                <React.Fragment>
                  <Text style={style.flatten(['subtitle1', 'color-white'])}>
                    Start Staking
                  </Text>

                  <Gutter size={4} />

                  {queryAPR.response &&
                  'apr' in queryAPR.response.data &&
                  typeof queryAPR.response.data.apr === 'number' &&
                  queryAPR.response.data.apr > 0 ? (
                    <Text style={style.flatten(['body3', 'color-gray-200'])}>
                      {`${new Dec(queryAPR.response.data.apr)
                        .mul(new Dec(100))
                        .toString(2)}% APR`}
                    </Text>
                  ) : null}
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment>
                  <Text style={style.flatten(['body3', 'color-gray-200'])}>
                    Staked Balance
                  </Text>

                  <Gutter size={4} />

                  <Text style={style.flatten(['subtitle3', 'color-white'])}>
                    {queryDelegation.total
                      ? queryDelegation.total
                          .maxDecimals(6)
                          .shrink(true)
                          .inequalitySymbol(true)
                          .trim(true)
                          .toString()
                      : '-'}
                  </Text>
                </React.Fragment>
              );
            }
          })()}
        </YAxis>

        <Box style={{flex: 1}} />

        <XAxis alignY="center">
          {stakeBalanceIsZero ? (
            <Button
              text={'Stake'}
              onPress={() => {
                if (chainStore.getChain(chainId).walletUrlForStaking) {
                  navigation.navigate('Stake', {
                    screen: 'Stake.ValidateList',
                    params: {
                      chainId: chainId,
                    },
                  });
                }
              }}
            />
          ) : (
            <Button
              text={'Stake More'}
              onPress={() => {
                if (chainStore.getChain(chainId).walletUrlForStaking) {
                  navigation.navigate('Stake', {
                    screen: 'Stake.Dashboard',
                    params: {
                      chainId,
                    },
                  });
                }
              }}
            />
          )}
        </XAxis>
      </XAxis>
    </Box>
  );
});
