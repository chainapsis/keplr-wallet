import React, {FunctionComponent, useMemo, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../components/box';
import {RefreshControl, Text} from 'react-native';
import {useStyle} from '../../styles';
import {action, computed, makeObservable, observable} from 'mobx';
import {IAccountStore, IChainInfoImpl, IChainStore} from '@keplr-wallet/stores';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {useStore} from '../../stores';
import {usePaginatedCursorQuery} from '../../hooks';
import {ResMsgsHistory} from './types.ts';
import {PaginationLimit, Relations} from './constants.ts';
import {RenderMessages} from './messages.tsx';
import {PageWithScrollView} from '../../components/page';
import {Dropdown} from '../../components/dropdown';
import {FormattedMessage} from 'react-intl';
import {EmptyView} from '../../components/empty-view';
import Svg, {Path} from 'react-native-svg';
import {MsgItemSkeleton} from './msg-items/skeleton.tsx';
import {Gutter} from '../../components/gutter';
import {XAxis} from '../../components/axis';
import {Stack} from '../../components/stack';

// React hook으로 처리하기 귀찮은 부분이 많아서
// 그냥 대충 mobx로...
class OtherBech32Addresses {
  @observable.ref
  protected supportedChainList: IChainInfoImpl[] = [];

  constructor(
    protected readonly chainStore: IChainStore,
    protected readonly accountStore: IAccountStore,
    protected readonly baseChainId: string,
  ) {
    makeObservable(this);
  }

  @action
  setSupportedChainList(chainInfos: IChainInfoImpl[]) {
    this.supportedChainList = chainInfos;
  }

  @computed
  get otherBech32Addresses(): {
    chainIdentifier: string;
    bech32Address: string;
  }[] {
    const baseAddress = this.accountStore.getAccount(
      this.baseChainId,
    ).bech32Address;
    if (baseAddress) {
      return this.supportedChainList
        .filter(chainInfo => {
          return chainInfo.chainId !== this.baseChainId;
        })
        .filter(chainInfo => {
          const baseAccount = this.accountStore.getAccount(this.baseChainId);
          const account = this.accountStore.getAccount(chainInfo.chainId);
          if (!account.bech32Address) {
            return false;
          }
          return (
            Buffer.from(
              Bech32Address.fromBech32(account.bech32Address).address,
            ).toString('hex') !==
            Buffer.from(
              Bech32Address.fromBech32(baseAccount.bech32Address).address,
            ).toString('hex')
          );
        })
        .map(chainInfo => {
          const account = this.accountStore.getAccount(chainInfo.chainId);
          return {
            chainIdentifier: chainInfo.chainIdentifier,
            bech32Address: account.bech32Address,
          };
        });
    }

    return [];
  }
}

export const ActivitiesScreen: FunctionComponent = observer(() => {
  const {chainStore, accountStore, queriesStore, priceStore} = useStore();

  const [otherBech32Addresses] = useState(
    () => new OtherBech32Addresses(chainStore, accountStore, 'cosmoshub'),
  );
  const account = accountStore.getAccount('cosmoshub');
  const [selectedKey, setSelectedKey] = useState<string>('__all__');

  const querySupported = queriesStore.simpleQuery.queryGet<string[]>(
    process.env['KEPLR_EXT_CONFIG_SERVER'] || '',
    '/tx-history/supports',
  );

  const supportedChainList = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const chainIdentifier of querySupported.response?.data ?? []) {
      map.set(chainIdentifier, true);
    }

    return chainStore.chainInfosInListUI.filter(chainInfo => {
      return map.get(chainInfo.chainIdentifier) ?? false;
    });
  }, [chainStore.chainInfosInListUI, querySupported.response?.data]);

  otherBech32Addresses.setSupportedChainList(supportedChainList);

  const msgHistory = usePaginatedCursorQuery<ResMsgsHistory>(
    process.env['KEPLR_EXT_TX_HISTORY_BASE_URL'] || '',
    () => {
      return `/history/msgs/keplr-multi-chain?baseBech32Address=${
        account.bech32Address
      }&chainIdentifiers=${(() => {
        if (selectedKey === '__all__') {
          return supportedChainList
            .map(chainInfo => chainInfo.chainId)
            .join(',');
        }
        return selectedKey;
      })()}&relations=${Relations.join(',')}&vsCurrencies=${
        priceStore.defaultVsCurrency
      }&limit=${PaginationLimit}${(() => {
        if (otherBech32Addresses.otherBech32Addresses.length === 0) {
          return '';
        }
        return `&otherBech32Addresses=${otherBech32Addresses.otherBech32Addresses
          .map(address => `${address.chainIdentifier}:${address.bech32Address}`)
          .join(',')}`;
      })()}`;
    },
    (_, prev) => {
      return {
        cursor: prev.nextCursor,
      };
    },
    res => {
      if (!res.nextCursor) {
        return true;
      }
      return false;
    },
    `${selectedKey}/${supportedChainList
      .map(chainInfo => chainInfo.chainId)
      .join(',')}/${otherBech32Addresses.otherBech32Addresses
      .map(address => `${address.chainIdentifier}:${address.bech32Address}`)
      .join(',')}`,
    (key: string) => {
      // key가 아래와 같으면 querySupported나 account 중 하나도 load되지 않은 경우다.
      // 이런 경우 query를 할 필요가 없다.
      return key !== `${selectedKey}//`;
    },
  );

  const style = useStyle();

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.flatten(['padding-x-12', 'padding-y-8'])}
      onScroll={({nativeEvent}) => {
        const bottomPadding = 30;

        if (
          nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
          nativeEvent.contentSize.height - bottomPadding
        ) {
          msgHistory.next();
        }
      }}
      refreshControl={
        msgHistory.pages.length > 0 ? (
          <RefreshControl
            refreshing={false}
            onRefresh={() => msgHistory.refresh()}
            tintColor={style.get('color-gray-200').color}
          />
        ) : undefined
      }>
      <Box alignX="center" alignY="center" padding={20}>
        <Text style={style.flatten(['h3', 'color-text-high'])}>
          <FormattedMessage id="page.activity.title" />
        </Text>
      </Box>

      <Box style={{zIndex: 1}}>
        <Dropdown
          size="large"
          allowSearch={true}
          searchExcludedKeys={['__all__']}
          selectedItemKey={selectedKey}
          onSelect={key => {
            setSelectedKey(key);
          }}
          items={[
            {
              key: '__all__',
              label: 'All',
            },
            ...supportedChainList.map(chainInfo => {
              return {
                key: chainInfo.chainId,
                label: chainInfo.chainName,
              };
            }),
          ]}
        />
      </Box>

      {(() => {
        if (msgHistory.pages.length === 0) {
          return (
            <Box>
              <Gutter size={8} />

              <Box marginLeft={6}>
                <XAxis alignY="center">
                  <Box
                    width={82}
                    height={16}
                    backgroundColor={style.get('color-card-default').color}
                  />
                </XAxis>
              </Box>

              <Gutter size={4} />

              <Stack gutter={8}>
                <MsgItemSkeleton />
                <MsgItemSkeleton />
                <MsgItemSkeleton />
                <MsgItemSkeleton />
                <MsgItemSkeleton />
              </Stack>
            </Box>
          );
        }
        if (msgHistory.pages.find(page => page.error != null)) {
          return (
            <Box marginTop={72}>
              <EmptyView
                altSvg={
                  <Svg width="73" height="73" fill="none" viewBox="0 0 73 73">
                    <Path
                      stroke={style.get('color-gray-400').color}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="6"
                      d="M46.15 49.601a13.635 13.635 0 00-9.626-4.006 13.636 13.636 0 00-9.72 4.006m37.03-13.125c0 15.11-12.249 27.357-27.358 27.357S9.12 51.585 9.12 36.476 21.367 9.12 36.476 9.12c15.11 0 27.357 12.248 27.357 27.357zm-34.197-6.839c0 1.26-.51 2.28-1.14 2.28-.63 0-1.14-1.02-1.14-2.28 0-1.26.51-2.28 1.14-2.28.63 0 1.14 1.02 1.14 2.28zm-1.14 0h.023v.046h-.023v-.046zm17.098 0c0 1.26-.51 2.28-1.14 2.28-.63 0-1.14-1.02-1.14-2.28 0-1.26.51-2.28 1.14-2.28.63 0 1.14 1.02 1.14 2.28zm-1.14 0h.023v.046h-.023v-.046z"
                    />
                  </Svg>
                }>
                <Box alignX="center" alignY="center">
                  <Text style={style.flatten(['subtitle3', 'color-gray-400'])}>
                    Network error.
                  </Text>
                  <Text
                    style={style.flatten([
                      'subtitle3',
                      'color-gray-400',
                      'text-center',
                    ])}>
                    Please try again after a few minutes.
                  </Text>
                </Box>
              </EmptyView>
            </Box>
          );
        }

        // 아무 history도 없는 경우
        if (msgHistory.pages[0].response?.msgs.length === 0) {
          return (
            <Box marginTop={72}>
              <EmptyView>
                <Box alignX="center" alignY="center">
                  <Text style={style.flatten(['subtitle3', 'color-gray-400'])}>
                    No recent transaction history
                  </Text>
                </Box>
              </EmptyView>
            </Box>
          );
        }

        return (
          <RenderMessages
            msgHistory={msgHistory}
            targetDenom={msg => {
              // "custom/merged-claim-rewards"는 예외임
              if (msg.relation === 'custom/merged-claim-rewards') {
                if (!msg.denoms || msg.denoms.length === 0) {
                  throw new Error(`Invalid denoms: ${msg.denoms})`);
                }
                const chainInfo = chainStore.getChain(msg.chainId);
                if (chainInfo.chainIdentifier === 'dydx-mainnet') {
                  // dydx는 USDC에 우선권을 줌
                  if (
                    msg.denoms.includes(
                      'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
                    )
                  ) {
                    return 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5';
                  }
                }
                if (chainInfo.stakeCurrency) {
                  if (
                    msg.denoms.includes(
                      chainInfo.stakeCurrency.coinMinimalDenom,
                    )
                  ) {
                    return chainInfo.stakeCurrency.coinMinimalDenom;
                  }
                }
                return msg.denoms[0];
              }
              if (!msg.denoms || msg.denoms.length !== 1) {
                // 백엔드에서 denoms는 무조건 한개 오도록 보장한다.
                throw new Error(`Invalid denoms: ${msg.denoms})`);
              }

              return msg.denoms[0];
            }}
            isInAllActivitiesPage={true}
          />
        );
      })()}
    </PageWithScrollView>
  );
});
