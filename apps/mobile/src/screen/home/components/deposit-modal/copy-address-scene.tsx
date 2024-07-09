import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';

import {Bech32Address, ChainIdHelper} from '@keplr-wallet/cosmos';
import * as Clipboard from 'expo-clipboard';

import {IChainInfoImpl} from '@keplr-wallet/stores';
import Color from 'color';
import {useStore} from '../../../../stores';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {XAxis, YAxis} from '../../../../components/axis';
import {Image, Text, View} from 'react-native';
import {Gutter} from '../../../../components/gutter';
import {TextInput} from '../../../../components/input';
import {
  CopyOutlineIcon,
  SearchIcon,
  StarIcon,
} from '../../../../components/icon';
import {BaseModalHeader} from '../../../../components/modal';
import {ChainImageFallback} from '../../../../components/image';
import {CheckToggleIcon, QRCodeIcon} from '../../../../components/icon';
import {IconButton} from '../../../../components/icon-button';
import {FormattedMessage, useIntl} from 'react-intl';
import {ScrollView} from '../../../../components/scroll-view/common-scroll-view';
import {
  RectButton,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {Defs, LinearGradient, Path, Rect, Stop, Svg} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const CopyAddressScene: FunctionComponent<{
  setIsOpen: (isOpen: boolean) => void;
  setCurrentScene: (scene: string) => void;
  setQRChainId: (value: string) => void;
  setQRBech32Address: (value: string) => void;
}> = observer(
  ({setIsOpen, setCurrentScene, setQRChainId, setQRBech32Address}) => {
    const {chainStore, accountStore, keyRingStore, uiConfigStore} = useStore();
    const [search, setSearch] = useState('');
    const style = useStyle();
    const intl = useIntl();

    // 북마크된 체인과 sorting을 위한 state는 분리되어있다.
    // 이걸 분리하지 않고 북마크된 체인은 무조건 올린다고 가정하면
    // 유저 입장에서 북마크 버튼을 누르는 순간 그 체인은 위로 올라가게 되고
    // 아래에 있던 체인의 경우는 유저가 보기에 갑자기 사라진 것처럼 보일 수 있고
    // 그게 아니더라도 추가적인 인터렉션을 위해서 스크롤이 필요해진다.
    // 이 문제를 해결하기 위해서 state가 분리되어있다.
    // 처음 시자할때는 북마크된 체인 기준으로 하고 이후에 북마크가 해제된 체인의 경우만 정렬 우선순위에서 뺀다.
    const [sortPriorities, setSortPriorities] = useState<
      Record<string, true | undefined>
    >(() => {
      if (!keyRingStore.selectedKeyInfo) {
        return {};
      }
      const res: Record<string, true | undefined> = {};
      for (const chainInfo of chainStore.chainInfosInUI) {
        if (
          uiConfigStore.copyAddressConfig.isBookmarkedChain(
            keyRingStore.selectedKeyInfo.id,
            chainInfo.chainId,
          )
        ) {
          res[chainInfo.chainIdentifier] = true;
        }
      }
      return res;
    });

    const addresses: {
      chainInfo: IChainInfoImpl;
      bech32Address: string;
      ethereumAddress?: string;
    }[] = chainStore.chainInfosInUI
      .map(chainInfo => {
        const accountInfo = accountStore.getAccount(chainInfo.chainId);

        const bech32Address = accountInfo.bech32Address;
        const ethereumAddress = (() => {
          if (chainInfo.chainId.startsWith('injective')) {
            return undefined;
          }

          return accountInfo.hasEthereumHexAddress
            ? accountInfo.ethereumHexAddress
            : undefined;
        })();

        return {
          chainInfo,
          bech32Address,
          ethereumAddress,
        };
      })
      .filter(address => {
        if (address.bech32Address.length === 0) {
          return false;
        }

        const s = search.trim();
        if (s.length === 0) {
          return true;
        }

        if (address.chainInfo.chainId.includes(s)) {
          return true;
        }
        if (address.chainInfo.chainName.includes(s)) {
          return true;
        }
        const bech32Split = address.bech32Address.split('1');
        if (bech32Split.length > 0) {
          if (bech32Split[0].includes(s)) {
            return true;
          }
        }
      })
      .sort((a, b) => {
        const aPriority = sortPriorities[a.chainInfo.chainIdentifier];
        const bPriority = sortPriorities[b.chainInfo.chainIdentifier];

        if (aPriority && bPriority) {
          return 0;
        }
        if (aPriority) {
          return -1;
        }
        if (bPriority) {
          return 1;
        }
        return 0;
      });

    const [blockInteraction, setBlockInteraction] = useState(false);

    const safeAreaInsets = useSafeAreaInsets();

    return (
      <Box backgroundColor={style.get('color-gray-600').color}>
        <XAxis alignY="center">
          <BaseModalHeader
            title={intl.formatMessage({
              id: 'page.main.components.deposit-modal.title',
            })}
          />
          <View
            style={{
              flex: 1,
            }}
          />
          <RectButton
            style={{
              marginRight: 20,
              borderRadius: 9999,
            }}
            rippleColor={style.get('color-gray-400').color}
            underlayColor={style.get('color-gray-500').color}
            activeOpacity={1}
            onPress={() => {
              setCurrentScene('Buy');
            }}>
            <Box
              position="relative"
              height={36}
              paddingX={16}
              alignX="center"
              alignY="center"
              borderRadius={9999}>
              <XAxis>
                <Text style={style.flatten(['text-caption2', 'color-gray-10'])}>
                  Buy Crypto
                </Text>
                <Gutter size={4} />
                <Svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <Path
                    stroke={style.get('color-gray-10').color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.667"
                    d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                  />
                </Svg>
              </XAxis>
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                }}>
                <Svg width="100%" height="100%">
                  <Defs>
                    <LinearGradient id="Gradient">
                      <Stop offset="0" stopColor="#00C2FF" />
                      <Stop offset="1" stopColor="#DB00FF" />
                    </LinearGradient>
                  </Defs>
                  {/* react native에서 svg rect의 stroke를 inside로 설정할 방법이 없는 것 같다.
                     그러므로 border width 1일때 양옆 각각 0.5씩을 고려해야한다
                     height의 경우는 1을 빼주고 y를 0.5로 하면 된다
                     근데 width는 딱히 방법이 없으므로 x를 0.5로하고 width를 대충 99%로 줘서 해결한다*/}
                  <Rect
                    x={0.5}
                    y={0.5}
                    width="99%"
                    height={35}
                    fill="transparent"
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="url(#Gradient)"
                    rx="18"
                  />
                </Svg>
              </View>
            </Box>
          </RectButton>
        </XAxis>
        <Gutter size={12} />
        <Box paddingX={12}>
          <TextInput
            left={color => <SearchIcon size={20} color={color} />}
            value={search}
            onChange={e => {
              e.preventDefault();

              setSearch(e.nativeEvent.text);
            }}
            placeholder={intl.formatMessage({
              id: 'page.main.components.deposit-modal.search-placeholder',
            })}
          />
        </Box>

        <Gutter size={12} />
        <ScrollView
          isGestureScrollView={true}
          style={style.flatten(['height-400'])}>
          {addresses.length === 0 ? (
            <Box
              alignX="center"
              alignY="center"
              paddingX={53}
              paddingTop={49.6}
              paddingBottom={51.2}>
              <Image
                source={require('../../../../public/assets/img/copy-address-no-search-result.png')}
                style={{
                  width: 140,
                  height: 160,
                }}
                alt="copy-address-no-search-result-image"
              />
              <Gutter size={12} />
              <Text
                style={style.flatten([
                  'subtitle3',
                  'color-gray-300',
                  'text-center',
                ])}>
                <FormattedMessage id="page.main.components.deposit-modal.empty-text" />
              </Text>
            </Box>
          ) : null}

          <Box paddingX={12}>
            {addresses
              .map(address => {
                // CopyAddressItem 컴포넌트는 ethereumAddress가 있냐 없냐에 따라서 다르게 동작한다.
                // ethereumAddress가 있으면 두개의 CopyAddressItem 컴포넌트를 각각 렌더링하기 위해서
                // ethereumAddress가 있으면 두개의 address로 쪼개서 리턴하고 flat으로 펼져서 렌더링한다.
                if (address.ethereumAddress) {
                  return [
                    {
                      chainInfo: address.chainInfo,
                      bech32Address: address.bech32Address,
                    },
                    {
                      ...address,
                    },
                  ];
                }

                return address;
              })
              .flat()
              .map(address => {
                return (
                  <CopyAddressItem
                    key={
                      address.chainInfo.chainIdentifier +
                      address.bech32Address +
                      (address.ethereumAddress || '')
                    }
                    address={address}
                    blockInteraction={blockInteraction}
                    setBlockInteraction={setBlockInteraction}
                    setSortPriorities={setSortPriorities}
                    setIsOpen={setIsOpen}
                    setCurrentScene={setCurrentScene}
                    setQRChainId={setQRChainId}
                    setQRBech32Address={setQRBech32Address}
                  />
                );
              })}
          </Box>

          <View
            style={{
              height: safeAreaInsets.bottom,
            }}
          />
        </ScrollView>
      </Box>
    );
  },
);

const CopyAddressItem: FunctionComponent<{
  setIsOpen: (isOpen: boolean) => void;
  setCurrentScene: (scene: string) => void;
  setQRChainId: (value: string) => void;
  setQRBech32Address: (value: string) => void;

  address: {
    chainInfo: IChainInfoImpl;
    bech32Address: string;
    ethereumAddress?: string;
  };

  blockInteraction: boolean;
  setBlockInteraction: (block: boolean) => void;
  setSortPriorities: (
    fn: (
      value: Record<string, true | undefined>,
    ) => Record<string, true | undefined>,
  ) => void;
}> = observer(
  ({
    setIsOpen,
    setCurrentScene,
    setQRChainId,
    setQRBech32Address,
    address,
    blockInteraction,
    setBlockInteraction,
    setSortPriorities,
  }) => {
    const {keyRingStore, uiConfigStore} = useStore();

    const style = useStyle();

    const [hasCopied, setHasCopied] = useState(false);

    const isBookmarked = keyRingStore.selectedKeyInfo
      ? uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          address.chainInfo.chainId,
        )
      : false;

    const [isCopyContainerPress, setIsCopyContainerPress] = useState(false);
    const [isBookmarkPress, setIsBookmarkPress] = useState(false);

    // 클릭 영역 문제로 레이아웃이 복잡해졌다.
    // 알아서 잘 해결하자
    return (
      <Box height={74} borderRadius={6} alignY="center" width={'100%'}>
        <XAxis alignY="center">
          <TouchableWithoutFeedback
            containerStyle={{
              flex: 1,
            }}
            onPressIn={() => setIsCopyContainerPress(true)}
            onPressOut={() => setIsCopyContainerPress(false)}
            onPress={async () => {
              await Clipboard.setStringAsync(
                address.ethereumAddress || address.bech32Address,
              );

              setHasCopied(true);
              setBlockInteraction(true);

              //NOTE analytics관련 로직 필요하면 참고해서 추가
              // analyticsStore.logEvent('click_copyAddress_copy', {
              //   chainId: address.chainInfo.chainId,
              //   chainName: address.chainInfo.chainName,
              // });
              setHasCopied(true);

              setTimeout(() => {
                setIsOpen(false);
              }, 300);
            }}>
            <Box
              height={74}
              borderRadius={6}
              alignY="center"
              backgroundColor={(() => {
                if (blockInteraction) {
                  return;
                }

                if (isBookmarkPress) {
                  return;
                }

                if (isCopyContainerPress) {
                  return style.get('color-gray-500@50%').color;
                }

                return;
              })()}
              paddingLeft={16}>
              <XAxis alignY="center">
                <TouchableWithoutFeedback
                  onPressIn={() => setIsBookmarkPress(true)}
                  onPressOut={() => setIsBookmarkPress(false)}
                  disabled={!!address.ethereumAddress}
                  onPress={() => {
                    if (blockInteraction) {
                      return;
                    }

                    const newIsBookmarked = !isBookmarked;
                    //NOTE analytics관련 로직 필요하면 참고해서 추가
                    // analyticsStore.logEvent('click_favoriteChain', {
                    //   chainId: address.chainInfo.chainId,
                    //   chainName: address.chainInfo.chainName,
                    //   isFavorite: newIsBookmarked,
                    // });

                    if (keyRingStore.selectedKeyInfo) {
                      if (newIsBookmarked) {
                        uiConfigStore.copyAddressConfig.bookmarkChain(
                          keyRingStore.selectedKeyInfo.id,
                          address.chainInfo.chainId,
                        );
                      } else {
                        uiConfigStore.copyAddressConfig.unbookmarkChain(
                          keyRingStore.selectedKeyInfo.id,
                          address.chainInfo.chainId,
                        );

                        setSortPriorities(priorities => {
                          const identifier = ChainIdHelper.parse(
                            address.chainInfo.chainId,
                          ).identifier;
                          const newPriorities = {...priorities};
                          if (newPriorities[identifier]) {
                            delete newPriorities[identifier];
                          }
                          return newPriorities;
                        });
                      }
                    }
                  }}>
                  <Box>
                    <StarIcon
                      size={24}
                      style={{
                        opacity: address.ethereumAddress ? 0 : 1,
                      }}
                      color={(() => {
                        if (isBookmarked) {
                          if (!blockInteraction && isBookmarkPress) {
                            return style.get('color-blue-500').color;
                          }
                          return style.get('color-blue-400').color;
                        }

                        if (!blockInteraction && isBookmarkPress) {
                          return style.get('color-gray-400').color;
                        }

                        return style.get('color-gray-300').color;
                      })()}
                    />
                  </Box>
                </TouchableWithoutFeedback>
                <Gutter size={8} />

                <ChainImageFallback
                  alt={address.chainInfo.chainName}
                  src={address.chainInfo.chainSymbolImageUrl}
                  style={{
                    width: 32,
                    height: 32,
                  }}
                />
                <Gutter size={8} />
                <YAxis>
                  <Text style={style.flatten(['subtitle3', 'color-gray-10'])}>
                    {address.chainInfo.chainName}
                  </Text>
                  <Gutter size={4} />
                  <Text
                    style={style.flatten(['text-caption1', 'color-gray-300'])}>
                    {(() => {
                      if (address.ethereumAddress) {
                        return address.ethereumAddress.length === 42
                          ? `${address.ethereumAddress.slice(
                              0,
                              10,
                            )}...${address.ethereumAddress.slice(-8)}`
                          : address.ethereumAddress;
                      }

                      return Bech32Address.shortenAddress(
                        address.bech32Address,
                        20,
                      );
                    })()}
                  </Text>
                </YAxis>

                <View
                  style={{
                    flex: 1,
                  }}
                />

                <Box padding={8} alignX="center" alignY="center">
                  {hasCopied ? (
                    <CheckToggleIcon
                      size={20}
                      color={style.get('color-green-400').color}
                    />
                  ) : (
                    <CopyOutlineIcon
                      size={20}
                      color={style.get('color-white').color}
                    />
                  )}
                </Box>
                <Gutter size={8} />
              </XAxis>
            </Box>
          </TouchableWithoutFeedback>
          <Gutter size={6.08} />
          <XAxis alignY="center">
            <IconButton
              style={style.flatten(['padding-8'])}
              disabled={hasCopied || !!address.ethereumAddress}
              onPress={() => {
                setQRChainId(address.chainInfo.chainId);
                setQRBech32Address(address.bech32Address);
                setCurrentScene('QR');
              }}
              containerStyle={style.flatten(['width-36', 'height-36'])}
              activeOpacity={1}
              icon={
                <QRCodeIcon
                  size={20}
                  color={(() => {
                    const color = style.get('color-white').color;

                    if (address.ethereumAddress) {
                      return Color(color).alpha(0.3).toString();
                    }

                    return color;
                  })()}
                />
              }
            />
            <Gutter size={12} direction="horizontal" />
          </XAxis>
        </XAxis>
      </Box>
    );
  },
);
