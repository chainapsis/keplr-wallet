import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {
  GetCosmosKeysForEachVaultSettledMsg,
  KeyInfo,
} from '@keplr-wallet/background';
import {useStore} from '../../../stores';
import {Box} from '../../../components/box';
import {XAxis, YAxis} from '../../../components/axis';
import {useStyle} from '../../../styles';
import {Gutter} from '../../../components/gutter';
import {Column, Columns} from '../../../components/column';
import {CopyOutlineIcon} from '../../../components/icon';
import {Button} from '../../../components/button';
import {App, AppCoinType} from '@keplr-wallet/ledger-cosmos';
import {StyleSheet, Text} from 'react-native';
import {StackActions, useNavigation} from '@react-navigation/native';
import {useIntl} from 'react-intl';
import {EllipsisIcon} from '../../../components/icon/ellipsis';
import {StackNavProp} from '../../../navigation';
import * as ExpoImage from 'expo-image';
import {BACKGROUND_PORT} from '@keplr-wallet/router';
import {RNMessageRequesterInternal} from '../../../router';
import * as Clipboard from 'expo-clipboard';
import {MenuModal, ModalMenuItem} from '../../../components/modal/menu-modal';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
} from 'react-native-draggable-flatlist';
import {SearchTextInput} from '../../../components/input/search-text-input';
import {EmptyView, EmptyViewText} from '../../../components/empty-view';
import {IconProps} from '../../../components/icon/types.ts';
import Svg, {Rect} from 'react-native-svg';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {defaultSpringConfig} from '../../../styles/spring.ts';

export const WalletSelectScreen: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const navigation = useNavigation();
  const intl = useIntl();
  const style = useStyle();
  const timerRef = useRef<any>(null);
  const [isOpenMenuModal, setIsOpenMenuModal] = useState(false);

  const [modalMenuItems, setModalMenuItems] = useState<ModalMenuItem[]>([]);

  const [searchText, setSearchText] = useState<string>('');
  const [debounceSearchText, setDebounceSearchText] = useState<string>('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearchText(searchText);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchText]);

  const [searchedKeyInfos, setSearchedKeyInfos] = useState<
    KeyInfo[] | undefined
  >(undefined);
  useEffect(() => {
    if (debounceSearchText.trim().length === 0) {
      setSearchedKeyInfos(undefined);
      return;
    }

    let exposed = false;

    keyRingStore
      .searchKeyRings(debounceSearchText)
      .then(keyInfos => {
        if (!exposed) {
          setSearchedKeyInfos(keyInfos);
        }
      })
      .catch(console.log);

    return () => {
      exposed = true;
    };
  }, [debounceSearchText, keyRingStore]);

  const keyInfos = searchedKeyInfos ?? keyRingStore.keyInfos;

  const mnemonicKeys = useMemo(() => {
    return keyInfos.filter(keyInfo => {
      return keyInfo.type === 'mnemonic';
    });
  }, [keyInfos]);

  const socialPrivateKeyInfos = useMemo(() => {
    return keyInfos.filter(keyInfo => {
      if (
        keyInfo.type === 'private-key' &&
        typeof keyInfo.insensitive === 'object' &&
        keyInfo.insensitive['keyRingMeta'] &&
        typeof keyInfo.insensitive['keyRingMeta'] === 'object' &&
        keyInfo.insensitive['keyRingMeta']['web3Auth'] &&
        typeof keyInfo.insensitive['keyRingMeta']['web3Auth'] === 'object'
      ) {
        const web3Auth = keyInfo.insensitive['keyRingMeta']['web3Auth'];
        if (web3Auth['type'] && web3Auth['email']) {
          return true;
        }
      }

      return false;
    });
  }, [keyInfos]);

  const privateKeyInfos = useMemo(() => {
    return keyInfos.filter(keyInfo => {
      return (
        keyInfo.type === 'private-key' &&
        !socialPrivateKeyInfos.some(k => k.id === keyInfo.id)
      );
    });
  }, [keyInfos, socialPrivateKeyInfos]);

  const ledgerKeys = useMemo(() => {
    return keyInfos.filter(keyInfo => {
      return keyInfo.type === 'ledger';
    });
  }, [keyInfos]);

  const keystoneKeys = useMemo(() => {
    return keyInfos.filter(keyInfo => {
      return keyInfo.type === 'keystone';
    });
  }, [keyInfos]);

  const unknownKeys = useMemo(() => {
    const knownKeys = mnemonicKeys
      .concat(ledgerKeys)
      .concat(privateKeyInfos)
      .concat(socialPrivateKeyInfos)
      .concat(keystoneKeys);
    return keyInfos.filter(keyInfo => {
      return !knownKeys.find(k => k.id === keyInfo.id);
    });
  }, [
    keyInfos,
    ledgerKeys,
    mnemonicKeys,
    privateKeyInfos,
    socialPrivateKeyInfos,
    keystoneKeys,
  ]);

  const socialPrivateKeyInfoByType: {
    type: string;
    keyInfos: KeyInfo[];
  }[] = useMemo(() => {
    const typeMap = new Map<string, KeyInfo[]>();

    socialPrivateKeyInfos.forEach(keyInfo => {
      if (
        keyInfo.type === 'private-key' &&
        typeof keyInfo.insensitive === 'object' &&
        keyInfo.insensitive['keyRingMeta'] &&
        typeof keyInfo.insensitive['keyRingMeta'] === 'object' &&
        keyInfo.insensitive['keyRingMeta']['web3Auth'] &&
        typeof keyInfo.insensitive['keyRingMeta']['web3Auth'] === 'object'
      ) {
        const web3Auth = keyInfo.insensitive['keyRingMeta']['web3Auth'];
        if (
          web3Auth['type'] &&
          web3Auth['email'] &&
          typeof web3Auth['type'] === 'string' &&
          typeof web3Auth['email'] === 'string'
        ) {
          const type = web3Auth['type'];

          const arr = typeMap.get(type) || [];
          arr.push(keyInfo);

          typeMap.set(type, arr);
        }
      }
    });

    const res: {
      type: string;
      keyInfos: KeyInfo[];
    }[] = [];

    for (const [type, keyInfos] of typeMap.entries()) {
      res.push({
        type,
        keyInfos,
      });
    }

    return res;
  }, [socialPrivateKeyInfos]);

  //NOTE - copy후 setTimeout에 의해서 모달이 닫히기전에 사용자가 모달을 닫을때 timer를
  //제거 해줘야 해서 해당 로직을 추가함
  useEffect(() => {
    if (!isOpenMenuModal) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }, [isOpenMenuModal]);

  return (
    <Box style={{flex: 1}}>
      <NestableScrollContainer>
        <Box paddingX={12}>
          <Gutter size={8} />

          <SearchTextInput
            placeholder={intl.formatMessage({
              id: 'page.wallet.input.search.placeholder',
            })}
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
            }}
          />
          <Box>
            <Box position="absolute" style={{top: 14, right: 12, zIndex: 1000}}>
              <Button
                text={intl.formatMessage({
                  id: 'page.wallet.add-wallet-button',
                })}
                size="extra-small"
                color="secondary"
                onPress={async () => {
                  navigation.dispatch(StackActions.push('Register'));
                }}
              />
            </Box>
          </Box>
        </Box>

        <Gutter size={36} />

        {mnemonicKeys.length > 0 ? (
          <KeyInfoList
            sortKey="sort-mnemonic"
            title={intl.formatMessage({
              id: 'page.wallet.recovery-phrase-title',
            })}
            keyInfos={mnemonicKeys}
            setModalMenuItems={setModalMenuItems}
            openModal={() => setIsOpenMenuModal(true)}
          />
        ) : null}

        {socialPrivateKeyInfoByType.map(info => {
          return (
            <KeyInfoList
              key={info.type}
              sortKey={`sort-social-${info.type}`}
              title={intl.formatMessage(
                {id: 'page.wallet.connect-with-social-account-title'},
                {
                  social:
                    info.type.length > 0
                      ? info.type[0].toUpperCase() + info.type.slice(1)
                      : info.type,
                },
              )}
              keyInfos={info.keyInfos}
              setModalMenuItems={setModalMenuItems}
              openModal={() => setIsOpenMenuModal(true)}
            />
          );
        })}

        {privateKeyInfos.length > 0 ? (
          <KeyInfoList
            sortKey="sort-private-key"
            title={intl.formatMessage({
              id: 'page.wallet.private-key-title',
            })}
            keyInfos={privateKeyInfos}
            setModalMenuItems={setModalMenuItems}
            openModal={() => setIsOpenMenuModal(true)}
          />
        ) : null}

        {ledgerKeys.length > 0 ? (
          <KeyInfoList
            sortKey="sort-ledger"
            title={intl.formatMessage({id: 'page.wallet.ledger-title'})}
            keyInfos={ledgerKeys}
            setModalMenuItems={setModalMenuItems}
            openModal={() => setIsOpenMenuModal(true)}
          />
        ) : null}

        {keystoneKeys.length > 0 ? (
          <KeyInfoList
            sortKey="sort-keystone"
            title="Keystone"
            keyInfos={keystoneKeys}
            setModalMenuItems={setModalMenuItems}
            openModal={() => setIsOpenMenuModal(true)}
          />
        ) : null}

        {unknownKeys.length > 0 ? (
          <KeyInfoList
            sortKey="sort-unknown"
            title={intl.formatMessage({id: 'page.wallet.unknown-title'})}
            keyInfos={unknownKeys}
            setModalMenuItems={setModalMenuItems}
            openModal={() => setIsOpenMenuModal(true)}
          />
        ) : null}

        {keyInfos.length === 0 ? (
          <Box style={style.flatten(['margin-top-16'])}>
            <Gutter size={40} />
            <EmptyView>
              <Box alignX="center" width={312}>
                <EmptyViewText
                  text={intl.formatMessage({
                    id: 'page.wallet.search-empty-view-title',
                  })}
                />
                <Gutter size={12} />
                <EmptyViewText
                  text={intl.formatMessage({
                    id: 'page.wallet.search-empty-view-paragraph',
                  })}
                />
              </Box>
            </EmptyView>
          </Box>
        ) : null}
      </NestableScrollContainer>

      <MenuModal
        isOpen={isOpenMenuModal}
        setIsOpen={setIsOpenMenuModal}
        modalMenuItems={modalMenuItems}
        onPressGeneral={item => {
          if (item.key === 'copy-icns-name') {
            timerRef.current = setTimeout(() => {
              setIsOpenMenuModal(false);
            }, 500);
            return;
          }
          setIsOpenMenuModal(false);
        }}
      />
    </Box>
  );
});

const KeyInfoList: FunctionComponent<{
  sortKey: string;
  title: string;
  keyInfos: KeyInfo[];
  setModalMenuItems: React.Dispatch<React.SetStateAction<ModalMenuItem[]>>;
  openModal: () => void;
}> = observer(({sortKey, title, keyInfos, setModalMenuItems, openModal}) => {
  const style = useStyle();
  const {uiConfigStore, chainStore, queriesStore} = useStore();
  const [keyInfosWithIcns, setKeyInfosWithIcns] = useState<
    (KeyInfo & {bech32Address?: string})[]
  >([]);

  const indexMap =
    uiConfigStore.selectWalletConfig.getKeyToSortVaultIdsMapIndex(sortKey);

  const sortedKeyInfos = useMemo(() => {
    return keyInfosWithIcns.sort((key1, key2) => {
      const key1Id = key1.id;
      const key2Id = key2.id;

      const key1Index = indexMap.get(key1Id);
      const key2Index = indexMap.get(key2Id);

      if (key1Index == null && key2Index != null) {
        return 1;
      }
      if (key1Index != null && key2Index == null) {
        return -1;
      }
      if (key1Index == null && key2Index == null) {
        return 0;
      }
      return key1Index! - key2Index!;
    });
  }, [keyInfosWithIcns, indexMap]);

  useEffect(() => {
    (async () => {
      if (
        uiConfigStore.icnsInfo &&
        chainStore.hasChain(uiConfigStore.icnsInfo.chainId)
      ) {
        const msg = new GetCosmosKeysForEachVaultSettledMsg(
          uiConfigStore.icnsInfo.chainId,
          keyInfos.map(item => item.id),
        );
        const result = await new RNMessageRequesterInternal().sendMessage(
          BACKGROUND_PORT,
          msg,
        );
        const infos = result.map((item, i) => {
          if (item.status === 'fulfilled') {
            return {
              ...keyInfos[i],
              bech32Address: item.value.bech32Address,
            } as KeyInfo & {
              bech32Address?: string;
            };
          }
          return keyInfos[i];
        });

        setKeyInfosWithIcns(infos);
      }
    })();
  }, [chainStore, keyInfos, queriesStore, uiConfigStore.icnsInfo]);

  return (
    <YAxis>
      <Box paddingX={12}>
        <Text
          style={style.flatten([
            'subtitle4',
            'color-gray-300',
            'padding-left-8',
          ])}>
          {title}
        </Text>
      </Box>

      <Gutter size={8} />

      <NestableDraggableFlatList
        data={sortedKeyInfos}
        onDragEnd={data => {
          uiConfigStore.selectWalletConfig.setKeyToSortVaultIds(
            sortKey,
            data.data.map(item => item.id),
          );
        }}
        renderItem={({item, drag, isActive}) => {
          return (
            <React.Fragment key={item.id}>
              <Gutter size={4} />

              <KeyringItem
                setModalMenuItems={setModalMenuItems}
                key={item.id}
                keyInfo={item}
                openModal={openModal}
                bech32Address={item.bech32Address}
                drag={drag}
                isActive={isActive}
              />

              <Gutter size={4} />
            </React.Fragment>
          );
        }}
        keyExtractor={item => item.id}
      />

      <Gutter size={20} />
    </YAxis>
  );
});

const KeyringItem: FunctionComponent<{
  keyInfo: KeyInfo;
  setModalMenuItems: React.Dispatch<React.SetStateAction<ModalMenuItem[]>>;
  openModal: () => void;
  bech32Address?: string;
  drag?: () => void;
  isActive?: boolean;
}> = observer(
  ({keyInfo, setModalMenuItems, openModal, bech32Address, drag, isActive}) => {
    const {chainStore, keyRingStore, uiConfigStore, queriesStore} = useStore();
    const intl = useIntl();
    const navigate = useNavigation<StackNavProp>();

    const style = useStyle();

    const icnsPrimaryName = (() => {
      if (
        uiConfigStore.icnsInfo &&
        chainStore.hasChain(uiConfigStore.icnsInfo.chainId) &&
        bech32Address
      ) {
        const queries = queriesStore.get(uiConfigStore.icnsInfo.chainId);
        const icnsQuery = queries.icns.queryICNSNames.getQueryContract(
          uiConfigStore.icnsInfo.resolverContractAddress,
          bech32Address,
        );
        return icnsQuery.primaryName.split('.')[0];
      }
    })();

    const paragraph = useMemo(() => {
      if (keyInfo.insensitive['bip44Path']) {
        const bip44Path = keyInfo.insensitive['bip44Path'] as any;

        // -1 means it can be multiple coin type.
        let coinType = -1;
        if (keyInfo.type === 'ledger') {
          const ledgerAppCandidate: (App | 'Ethereum')[] = [
            'Cosmos',
            'Terra',
            'Secret',
            'Ethereum',
          ];

          const app: (App | 'Ethereum')[] = [];
          for (const ledgerApp of ledgerAppCandidate) {
            if (keyInfo.insensitive[ledgerApp] != null) {
              app.push(ledgerApp);
            }
          }

          if (app.length === 0 || app.length >= 2) {
            coinType = -1;
          } else if (app[0] === 'Ethereum') {
            coinType = 60;
          } else {
            const c = AppCoinType[app[0]];
            if (c != null) {
              coinType = c;
            } else {
              coinType = -1;
            }
          }

          if (
            app.length === 1 &&
            app.includes('Cosmos') &&
            bip44Path.account === 0 &&
            bip44Path.change === 0 &&
            bip44Path.addressIndex === 0
          ) {
            return;
          }

          return `m/44'/${coinType >= 0 ? coinType : '-'}'/${
            bip44Path.account
          }'/${bip44Path.change}/${bip44Path.addressIndex}${(() => {
            if (app.length === 1) {
              if (app[0] !== 'Cosmos' && app[0] !== 'Ethereum') {
                return ` ${intl.formatMessage({
                  id: `page.wallet.keyring-item.bip44-path-${app[0]}-text`,
                })}`;
              }
            }

            return '';
          })()}`;
        }

        if (
          bip44Path.account === 0 &&
          bip44Path.change === 0 &&
          bip44Path.addressIndex === 0
        ) {
          return;
        }

        return `m/44'/${coinType >= 0 ? coinType : '-'}'/${
          bip44Path.account
        }'/${bip44Path.change}/${bip44Path.addressIndex}`;
      }

      if (
        keyInfo.type === 'private-key' &&
        typeof keyInfo.insensitive === 'object' &&
        keyInfo.insensitive['keyRingMeta'] &&
        typeof keyInfo.insensitive['keyRingMeta'] === 'object' &&
        keyInfo.insensitive['keyRingMeta']['web3Auth'] &&
        typeof keyInfo.insensitive['keyRingMeta']['web3Auth'] === 'object'
      ) {
        const web3Auth = keyInfo.insensitive['keyRingMeta']['web3Auth'];
        if (
          web3Auth['type'] &&
          web3Auth['email'] &&
          typeof web3Auth['type'] === 'string' &&
          typeof web3Auth['email'] === 'string'
        ) {
          return web3Auth['email'];
        }
      }
    }, [intl, keyInfo.insensitive, keyInfo.type]);

    const dropdownItems = (() => {
      const defaults: ModalMenuItem[] = [
        {
          key: 'change-wallet-name',
          label: intl.formatMessage({
            id: 'page.wallet.keyring-item.dropdown.change-wallet-name-title',
          }),
          onSelect: () =>
            navigate.navigate('SelectWallet.ChangeName', {id: keyInfo.id}),
        },
        {
          key: 'delete-wallet',
          label: intl.formatMessage({
            id: 'page.wallet.keyring-item.dropdown.delete-wallet-title',
          }),
          onSelect: () =>
            navigate.navigate('SelectWallet.Delete', {id: keyInfo.id}),
        },
      ];

      switch (keyInfo.type) {
        case 'mnemonic': {
          defaults.unshift({
            key: 'view-recovery-phrase',
            label: intl.formatMessage({
              id: 'page.wallet.keyring-item.dropdown.view-recovery-path-title',
            }),
            onSelect: () =>
              navigate.navigate('SelectWallet.ViewRecoveryPhrase', {
                id: keyInfo.id,
              }),
          });
          break;
        }
        case 'private-key': {
          defaults.unshift({
            key: 'view-recovery-phrase',
            label: intl.formatMessage({
              id: 'page.wallet.keyring-item.dropdown.view-private-key-title',
            }),
            onSelect: () =>
              navigate.navigate('SelectWallet.ViewRecoveryPhrase', {
                id: keyInfo.id,
              }),
          });
          break;
        }
      }

      if (icnsPrimaryName) {
        defaults.unshift({
          key: 'copy-icns-name',
          label: icnsPrimaryName,
          isClicked: false,
          left: (
            <ExpoImage.Image
              source={require('../../../public/assets/img/icns-icon.png')}
              style={style.flatten(['width-16', 'height-16'])}
            />
          ),
          right: (
            <CopyOutlineIcon
              size={20}
              color={style.get('color-text-low').color}
            />
          ),
          onSelect: async () => {
            await Clipboard.setStringAsync(icnsPrimaryName);
            setModalMenuItems(prev =>
              prev.map(item =>
                item.key === 'copy-icns-name'
                  ? {...item, isClicked: true, label: 'Copied to clipboard'}
                  : item,
              ),
            );
          },
        });
      }

      return defaults;
    })();

    const isSelected = keyRingStore.selectedKeyInfo?.id === keyInfo.id;

    const navigation = useNavigation();

    // Drag를 할 때 왼쪽 스와이프로 뒤로가기를 막기 위해서 gesture를 disable한다.(올바른 동작을 위해서)
    // Drag가 끝나면 다시 활성화한다.
    useEffect(() => {
      navigation.getParent()?.setOptions({gestureEnabled: !isActive});
    }, [navigation, isActive]);

    const [scale, setScale] = useState(1);
    const animProgress = useSharedValue(scale);

    useEffect(() => {
      animProgress.value = withSpring(scale, defaultSpringConfig);
    }, [animProgress, scale]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{scale: animProgress.value}],
      };
    });

    // Drag가 시작되면 확대한다.
    useEffect(() => {
      if (isActive) {
        setScale(1.05);
      } else {
        setScale(1);
      }
    }, [isActive]);

    return (
      <TouchableWithoutFeedback
        style={style.flatten(['padding-x-12'])}
        onPress={async () => {
          if (isSelected) {
            return;
          }
          await keyRingStore.selectKeyRing(keyInfo.id);
          await chainStore.waitSyncedEnabledChains();
          navigate.goBack();
        }}>
        <Reanimated.View style={{...animatedStyle}}>
          <Box
            paddingRight={20}
            minHeight={74}
            borderRadius={6}
            alignY="center"
            style={StyleSheet.flatten([
              style.flatten([
                isActive
                  ? 'background-color-gray-600'
                  : 'background-color-card-default',
              ]),
              isSelected &&
                style.flatten([
                  'border-width-1',
                  'border-color-gray-200',
                  'border-solid',
                ]),
            ])}>
            <Columns sum={1} alignY="center">
              <Box width={'85%'}>
                <XAxis alignY="center">
                  <TouchableWithoutFeedback
                    onLongPress={drag}
                    delayLongPress={0}>
                    <Box alignY="center" minHeight={74} paddingLeft={12}>
                      <ChangeSequenceIcon
                        size={32}
                        color={
                          isActive
                            ? style.get('color-gray-400').color
                            : style.get('color-gray-300').color
                        }
                      />
                    </Box>
                  </TouchableWithoutFeedback>

                  <Gutter size={8} />

                  <Text
                    numberOfLines={1}
                    style={StyleSheet.flatten([
                      style.flatten([
                        'subtitle2',
                        'dark:color-gray-700',
                        'color-gray-10',
                      ]),
                      {maxWidth: '80%'},
                    ])}>
                    {keyInfo.name}
                  </Text>
                  {icnsPrimaryName ? (
                    <React.Fragment>
                      <Gutter size={8} />
                      <ExpoImage.Image
                        source={require('../../../public/assets/img/icns-icon.png')}
                        style={style.flatten(['width-16', 'height-16'])}
                      />
                    </React.Fragment>
                  ) : null}
                </XAxis>
                {paragraph ? (
                  <React.Fragment>
                    <Text style={style.flatten(['body2', 'color-gray-300'])}>
                      {paragraph}
                    </Text>
                  </React.Fragment>
                ) : null}
              </Box>
              <Column weight={1} />
              <TouchableWithoutFeedback
                onPress={() => {
                  setModalMenuItems(dropdownItems);
                  openModal();
                }}>
                <EllipsisIcon
                  size={24}
                  color={style.get('color-gray-10').color}
                />
              </TouchableWithoutFeedback>
            </Columns>
          </Box>
        </Reanimated.View>
      </TouchableWithoutFeedback>
    );
  },
);

const ChangeSequenceIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect
        x="6.66699"
        y="10"
        width="18.6667"
        height="4"
        rx="2"
        fill={color || 'currentColor'}
      />
      <Rect
        x="6.66699"
        y="18"
        width="18.6667"
        height="4"
        rx="2"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
