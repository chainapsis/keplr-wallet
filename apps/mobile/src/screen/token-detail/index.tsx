import React, {FunctionComponent, useEffect, useMemo} from 'react';
import {PageWithScrollView} from '../../components/page';
import {Text} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../navigation.tsx';
import {useStore} from '../../stores';
import {observer} from 'mobx-react-lite';
import {Gutter} from '../../components/gutter';
import {XAxis, YAxis} from '../../components/axis';
import {ColorPalette, useStyle} from '../../styles';
import {DefaultScreenHeaderLeft} from '../../components/pageHeader';
import {
  MessageReceiveIcon,
  MessageSendIcon,
  MessageSwapIcon,
} from '../../components/icon';
import {usePaginatedCursorQuery} from '../../hooks';
import {ResMsgsHistory} from '../activities/types.ts';
import {PaginationLimit, Relations} from '../activities/constants.ts';
import {CircleButton} from './components/circle-button.tsx';
import {AddressChip} from './components/address-chip.tsx';
import {QRCodeChip} from './components/qr-chip.tsx';
import {ReceiveModal} from './components/receive-modal.tsx';
import {StakedBalance} from './components/staked-balance.tsx';
import {CoinPretty, Dec, DecUtils} from '@keplr-wallet/unit';
import {TokenInfos} from './components/token-info.tsx';
import {Box} from '../../components/box';
import {Stack} from '../../components/stack';
import {MsgItemSkeleton} from '../activities/msg-items/skeleton.tsx';
import {EmptyView} from '../../components/empty-view';
import Svg, {Path} from 'react-native-svg';
import {RenderMessages} from '../activities/messages.tsx';
import {BuyModal} from '../home/components/deposit-modal/buy-modal.tsx';
import {useBuy} from '../../hooks/use-buy.ts';
import {registerCardModal} from '../../components/modal/card';
import {IconProps} from '../../components/icon/types.ts';

export const TokenDetailScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    queriesStore,
    accountStore,
    price24HChangesStore,
    priceStore,
    skipQueriesStore,
  } = useStore();

  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const route = useRoute<RouteProp<RootStackParamList, 'TokenDetail'>>();
  const chainId = route.params.chainId;
  const coinMinimalDenom = route.params.coinMinimalDenom;

  const chainInfo = chainStore.getChain(chainId);
  const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

  const isIBCCurrency = 'paths' in currency;

  const [isReceiveOpen, setIsReceiveOpen] = React.useState(false);
  const [isOpenBuy, setIsOpenBuy] = React.useState(false);

  const buySupportServiceInfos = useBuy({chainId, currency});
  const isSomeBuySupport = buySupportServiceInfos.some(
    serviceInfo => !!serviceInfo.buyUrl,
  );

  const balance = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address,
    )
    .getBalance(currency);
  const price24HChange = (() => {
    if (!currency.coinGeckoId) {
      return undefined;
    }
    return price24HChangesStore.get24HChange(currency.coinGeckoId);
  })();

  const querySupported = queriesStore.simpleQuery.queryGet<string[]>(
    process.env['KEPLR_EXT_CONFIG_SERVER'] || '',
    '/tx-history/supports',
  );

  const isSupported: boolean = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const chainIdentifier of querySupported.response?.data ?? []) {
      map.set(chainIdentifier, true);
    }

    return map.get(chainInfo.chainIdentifier) ?? false;
  }, [chainInfo, querySupported.response]);

  const buttons: {
    icon: React.ReactElement;
    text: string;
    onClick: () => void;
    disabled?: boolean;
  }[] = [
    {
      icon: <BuyIcon size={24} color={style.get('color-white').color} />,
      text: 'Buy',
      onClick: () => {
        setIsOpenBuy(true);
      },
      disabled: !isSomeBuySupport,
    },
    {
      icon: (
        <MessageReceiveIcon size={44} color={style.get('color-white').color} />
      ),
      text: 'Receive',
      onClick: () => {
        setIsReceiveOpen(true);
      },
      disabled: isIBCCurrency,
    },
    {
      icon: (
        <MessageSwapIcon size={44} color={style.get('color-white').color} />
      ),
      text: 'Swap',
      onClick: () => {
        navigation.navigate({
          name: 'Swap',
          params: {
            chainId: chainId,
            coinMinimalDenom: coinMinimalDenom,
            outChainId: chainStore.getChain('noble').chainId,
            outCoinMinimalDenom: 'uusdc',
          },
          merge: true,
        });
      },
      disabled: !skipQueriesStore.queryIBCSwap.isSwappableCurrency(
        chainId,
        currency,
      ),
    },
    {
      icon: (
        <MessageSendIcon size={44} color={style.get('color-white').color} />
      ),
      text: 'Send',
      onClick: () => {
        navigation.navigate({
          name: 'Send',
          params: {
            chainId,
            coinMinimalDenom,
          },
        });
      },
    },
  ];

  const msgHistory = usePaginatedCursorQuery<ResMsgsHistory>(
    process.env['KEPLR_EXT_TX_HISTORY_BASE_URL'] || '',
    () => {
      return `/history/msgs/${chainInfo.chainIdentifier}/${
        accountStore.getAccount(chainId).bech32Address
      }?relations=${Relations.join(',')}&denoms=${encodeURIComponent(
        currency.coinMinimalDenom,
      )}&vsCurrencies=${priceStore.defaultVsCurrency}&limit=${PaginationLimit}`;
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
  );

  useEffect(() => {
    let denom = currency.coinDenom;
    if ('originCurrency' in currency && currency.originCurrency) {
      denom = currency.originCurrency.coinDenom;
    }

    navigation.setOptions({
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: ColorPalette['gray-700'],
      },
      headerTitle: () => (
        <XAxis>
          <Text
            style={style.flatten([
              'body1',
              'color-gray-200',
            ])}>{`${denom} on `}</Text>
          <Text
            style={style.flatten([
              'body1',
              isIBCCurrency ? 'color-white' : 'color-gray-200',
            ])}>
            {chainInfo.chainName}
          </Text>
        </XAxis>
      ),
      headerLeft: (props: any) => <DefaultScreenHeaderLeft {...props} />,
      headerRight: () => <QRCodeChip onClick={() => setIsReceiveOpen(true)} />,
    });
  }, [chainInfo.chainName, currency, isIBCCurrency, navigation, style]);

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
      }}>
      {!isIBCCurrency ? (
        <React.Fragment>
          <Gutter size={8} />

          <YAxis alignX="center">
            <AddressChip chainId={chainId} />
          </YAxis>
        </React.Fragment>
      ) : null}

      <Gutter size={22} />

      <YAxis alignX="center">
        <Text style={style.flatten(['mobile-h3', 'color-gray-10'])}>
          {(() => {
            if (!balance) {
              return `0 ${currency.coinDenom}`;
            }

            return balance.balance
              .maxDecimals(6)
              .inequalitySymbol(true)
              .shrink(true)
              .hideIBCMetadata(true)
              .toString();
          })()}
        </Text>

        <Gutter size={4} />

        <Text style={style.flatten(['subtitle3', 'color-gray-300'])}>
          {(() => {
            if (!balance) {
              return '-';
            }
            const price = priceStore.calculatePrice(balance.balance);
            if (price) {
              return price.toString();
            }
            return '-';
          })()}
        </Text>
      </YAxis>

      <Gutter size={20} />

      <YAxis alignX="center">
        <XAxis alignY="center">
          {buttons.map((obj, i) => {
            return (
              <React.Fragment key={i.toString()}>
                <Gutter size={30} />
                <CircleButton
                  text={obj.text}
                  icon={obj.icon}
                  onClick={obj.onClick}
                  disabled={obj.disabled}
                />
                {i === buttons.length - 1 ? <Gutter size={30} /> : null}
              </React.Fragment>
            );
          })}
        </XAxis>
      </YAxis>

      {!isIBCCurrency && chainInfo.walletUrlForStaking ? (
        <React.Fragment>
          <Gutter size={20} />

          <StakedBalance chainId={chainId} />
        </React.Fragment>
      ) : null}

      {(() => {
        const infos: {
          title: string;
          text: string;
          textDeco?: 'green';
        }[] = [];

        if (currency.coinGeckoId) {
          const price = priceStore.calculatePrice(
            new CoinPretty(
              currency,
              DecUtils.getTenExponentN(currency.coinDecimals),
            ),
          );
          if (price) {
            let textDeco: 'green' | undefined;
            let text = price.roundTo(3).toString();
            if (price24HChange) {
              // Max decimals가 2인데 이 경우 숫자가 0.00123%같은 경우면 +0.00% 같은식으로 표시될 수 있다.
              // 이 경우는 오차를 무시하고 0.00%로 생각한다.
              if (
                price24HChange
                  .toDec()
                  .abs()
                  // 백분율을 고려해야되기 때문에 -2가 아니라 -4임
                  .lte(DecUtils.getTenExponentN(-4))
              ) {
                text += ' (0.00%)';
              } else {
                text += ` (${price24HChange
                  .maxDecimals(2)
                  .trim(false)
                  .shrink(true)
                  .sign(true)
                  .inequalitySymbol(false)
                  .toString()})`;

                if (price24HChange.toDec().gt(Dec.zero)) {
                  textDeco = 'green';
                }
              }
            }
            if ('originCurrency' in currency && currency.originCurrency) {
              infos.push({
                title: `${currency.originCurrency.coinDenom} Price`,
                text,
                textDeco,
              });
            } else {
              infos.push({
                title: `${currency.coinDenom} Price`,
                text,
                textDeco,
              });
            }
          }
        }

        if ('paths' in currency && currency.paths.length > 0) {
          const path = currency.paths[currency.paths.length - 1];
          if (path.clientChainId) {
            const chainName = chainStore.hasChain(path.clientChainId)
              ? chainStore.getChain(path.clientChainId).chainName
              : path.clientChainId;
            infos.push({
              title: 'Channel',
              text: `${chainName}/${path.channelId.replace('channel-', '')}`,
            });
          }
        }

        if (infos.length === 0) {
          return null;
        }

        return (
          <React.Fragment>
            <Gutter size={20} />

            <TokenInfos title="Token Info" infos={infos} />
          </React.Fragment>
        );
      })()}

      <Gutter size={20} />

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
              </Stack>
            </Box>
          );
        }

        if (msgHistory.pages.find(page => page.error != null)) {
          return (
            <Box marginTop={34}>
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

        if (msgHistory.pages[0].response?.isUnsupported || !isSupported) {
          if (chainInfo.embedded.embedded) {
            return (
              <Box marginTop={34}>
                <EmptyView>
                  <Box alignX="center" alignY="center" marginX={32}>
                    <Text
                      style={style.flatten(['subtitle3', 'color-gray-400'])}>
                      Unsupported Chain
                    </Text>

                    <Gutter size={8} />

                    <Text
                      style={style.flatten([
                        'subtitle3',
                        'color-gray-400',
                        'text-center',
                      ])}>
                      We're actively working on expanding our support for natvie
                      chains.
                    </Text>
                  </Box>
                </EmptyView>
              </Box>
            );
          }

          return (
            <Box marginTop={34}>
              <EmptyView>
                <Box alignX="center" alignY="center">
                  <Text style={style.flatten(['subtitle3', 'color-gray-400'])}>
                    Non-native chains not supported
                  </Text>
                </Box>
              </EmptyView>
            </Box>
          );
        }

        // 아무 history도 없는 경우
        if (msgHistory.pages[0].response?.msgs.length === 0) {
          return (
            <Box marginTop={34}>
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
            targetDenom={coinMinimalDenom}
          />
        );
      })()}

      <ReceiveModal
        isOpen={isReceiveOpen}
        setIsOpen={setIsReceiveOpen}
        chainId={chainId}
      />

      <TokenBuyModal
        isOpen={isOpenBuy}
        navigation={navigation}
        setIsOpen={setIsOpenBuy}
        buySupportServiceInfos={buySupportServiceInfos}
      />
    </PageWithScrollView>
  );
});

const TokenBuyModal = registerCardModal(BuyModal);

const BuyIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 12L4 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <Path
        d="M12 4L12 20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
