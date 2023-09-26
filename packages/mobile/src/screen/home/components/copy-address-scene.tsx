import React, {FunctionComponent, useCallback, useState} from 'react';
import {observer} from 'mobx-react-lite';

import {Bech32Address, ChainIdHelper} from '@keplr-wallet/cosmos';

import {IChainInfoImpl} from '@keplr-wallet/stores';
import Color from 'color';
import {useStore} from '../../../stores';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {XAxis, YAxis} from '../../../components/axis';
import {Image, Text, View} from 'react-native';
import {Gutter} from '../../../components/gutter';
import {TextInput} from '../../../components/input';
import {CopyOutlineIcon, SearchIcon, StarIcon} from '../../../components/icon';
import {BottomSheetScrollView, useBottomSheet} from '@gorhom/bottom-sheet';
import {BaseModalHeader} from '../../../components/modal';
import {ChainImageFallback} from '../../../components/image';
import {CheckToggleIcon} from '../../../components/icon/check-toggle';
import {IconButton} from '../../../components/icon-button';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {DepositModalNav} from '../deposit-modal';
import {QRCodeIcon} from '../../../components/icon/qr-code';

export const CopyAddressScene: FunctionComponent = observer(() => {
  const {chainStore, accountStore, keyRingStore, uiConfigStore} = useStore();
  const [search, setSearch] = useState('');
  const style = useStyle();

  //NOTE qr 창에 갔다가 올아올때는 다시 모달의 사이즈를 키워줘야 함
  const bottom = useBottomSheet();
  useFocusEffect(
    useCallback(() => {
      bottom.snapToPosition('60%');
    }, [bottom]),
  );

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

  return (
    <Box height={'100%'} backgroundColor={style.get('color-gray-600').color}>
      <BaseModalHeader title="Copy Address" />
      <Gutter size={12} />
      <Box paddingX={12}>
        <TextInput
          left={color => <SearchIcon size={20} color={color} />}
          value={search}
          onChange={e => {
            e.preventDefault();

            setSearch(e.nativeEvent.text);
          }}
          placeholder="Search for a chain"
        />
      </Box>

      <Gutter size={12} />

      <BottomSheetScrollView>
        {addresses.length === 0 ? (
          <Box
            alignX="center"
            alignY="center"
            paddingX={26}
            paddingTop={49.6}
            paddingBottom={51.2}>
            <Image
              source={require('../../../public/assets/img/copy-address-no-search-result.png')}
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
              To use an address on certain chain, you may need to first visit
              the \"Manage Chain Visibility\" in the side menu and make the
              chain visible on your wallet.
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
                />
              );
            })}
        </Box>
      </BottomSheetScrollView>
    </Box>
  );
});

const CopyAddressItem: FunctionComponent<{
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
  ({address, blockInteraction, setBlockInteraction, setSortPriorities}) => {
    const {keyRingStore, uiConfigStore} = useStore();
    const nav = useNavigation<NavigationProp<DepositModalNav>>();
    const bottomSheet = useBottomSheet();

    const style = useStyle();

    const [hasCopied, setHasCopied] = useState(false);

    const isBookmarked = keyRingStore.selectedKeyInfo
      ? uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          address.chainInfo.chainId,
        )
      : false;

    //hover 대신 pressIn event로 할 에정
    const [isCopyContainerPress, setIsCopyContainerPress] = useState(false);
    const [isBookmarkPress, setIsBookmarkPress] = useState(false);

    // 클릭 영역 문제로 레이아웃이 복잡해졌다.
    // 알아서 잘 해결하자
    return (
      <Box height={64} borderRadius={6} alignY="center">
        <XAxis alignY="center">
          <Box
            height={64}
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
            paddingLeft={16}
            style={{
              flex: 1,
            }}
            onClick={async e => {
              e.preventDefault();

              // await navigator.clipboard.writeText(
              //   address.ethereumAddress || address.bech32Address,
              // );
              setHasCopied(true);
              setBlockInteraction(true);

              // analyticsStore.logEvent('click_copyAddress_copy', {
              //   chainId: address.chainInfo.chainId,
              //   chainName: address.chainInfo.chainName,
              // });
              setHasCopied(true);

              setTimeout(() => {
                bottomSheet.close();
              }, 500);
            }}>
            <XAxis alignY="center">
              <Box
                cursor={
                  blockInteraction || address.ethereumAddress
                    ? undefined
                    : 'pointer'
                }
                onClick={e => {
                  e.preventDefault();
                  // 컨테이너로의 전파를 막아야함
                  e.stopPropagation();

                  if (blockInteraction) {
                    return;
                  }

                  const newIsBookmarked = !isBookmarked;

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
                <StarIcon
                  size={20}
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

          <Gutter size={6.08} />
          <XAxis alignY="center">
            <IconButton
              style={style.flatten(['padding-8'])}
              // padding="0.5rem"
              // hoverColor={
              //   theme.mode === 'light'
              //     ? ColorPalette['gray-50']
              //     : ColorPalette['gray-500']
              // }
              disabled={hasCopied || !!address.ethereumAddress}
              onPress={() => {
                nav.navigate('QR', {
                  chainId: address.chainInfo.chainId,
                  bech32Address: address.bech32Address,
                  chainName: address.chainInfo.chainName,
                });
              }}
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
