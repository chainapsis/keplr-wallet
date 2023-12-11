import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {Stack} from '../../../../../components/stack';
import {useStyle} from '../../../../../styles';
import {useStore} from '../../../../../stores';
import {Column, Columns} from '../../../../../components/column';
import {Box} from '../../../../../components/box';
import {Button} from '../../../../../components/button';
import {autorun} from 'mobx';
import {TokenInfo} from '@keplr-wallet/background';
import {EmptyView} from '../../../../../components/empty-view';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {useConfirm} from '../../../../../hooks/confirm';

import {FormattedMessage, useIntl} from 'react-intl';
import {FlatList, Text} from 'react-native';
import {Gutter} from '../../../../../components/gutter';
import {IconButton} from '../../../../../components/icon-button';

import * as Clipboard from 'expo-clipboard';
import {EllipsisIcon} from '../../../../../components/icon/ellipsis';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../../../navigation';
import {
  SelectModal,
  SelectModalCommonButton,
} from '../../../../../components/select-modal';
import {
  MenuModal,
  ModalMenuItem,
} from '../../../../../components/modal/menu-modal';

export const SettingTokenListScreen: FunctionComponent = observer(() => {
  const {chainStore, accountStore, tokensStore} = useStore();

  const intl = useIntl();
  const navigate = useNavigation<StackNavProp>();
  const style = useStyle();
  const [isOpenMenuModal, setIsOpenMenuModal] = useState(false);
  const timerRef = useRef<any>(null);

  const [isOpenChainSelectModal, setIsOpenChainSelectModal] = useState(false);
  const [menuModalItems, setMenuModalItems] = useState<ModalMenuItem[]>([
    {
      key: 'change-contact-label',
      label: intl.formatMessage({
        id: 'page.setting.contacts.list.dropdown.edit-contact-label',
      }),
      onSelect: () => {},
    },
  ]);

  const supportedChainInfos = useMemo(() => {
    return chainStore.chainInfos.filter(chainInfo => {
      return (
        chainInfo.features?.includes('cosmwasm') ||
        chainInfo.features?.includes('secretwasm')
      );
    });
  }, [chainStore.chainInfos]);

  const [chainId, setChainId] = useState<string>(() => {
    if (supportedChainInfos.length > 0) {
      return supportedChainInfos[0].chainId;
    } else {
      return chainStore.chainInfos[0].chainId;
    }
  });

  useEffect(() => {
    // secret20은 계정에 귀속되기 때문에 보려면 계정이 초기화되어있어야 가능하다...
    const disposal = autorun(() => {
      const account = accountStore.getAccount(chainId);
      if (account.bech32Address === '') {
        account.init();
      }
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  }, [accountStore, chainId]);

  const items = supportedChainInfos.map(chainInfo => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
      imageUrl: chainInfo.chainSymbolImageUrl,
    };
  });

  const tokens = tokensStore.getTokens(chainId);

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
    <React.Fragment>
      <Box paddingX={12} paddingTop={6} style={style.flatten(['flex-grow-1'])}>
        <FlatList
          data={tokens}
          ListHeaderComponent={
            <Stack gutter={8}>
              <Text
                style={style.flatten([
                  'body2',
                  'color-text-middle',
                  'text-center',
                  'margin-bottom-14',
                ])}>
                <FormattedMessage id="page.setting.token.manage.paragraph" />
              </Text>
              <Columns sum={1} alignY="center">
                <Box width={208}>
                  <SelectModalCommonButton
                    items={items}
                    selectedItemKey={chainId}
                    isOpenModal={isOpenChainSelectModal}
                    placeholder="Search by chain name"
                    onPress={() => {
                      setIsOpenChainSelectModal(true);
                    }}
                  />
                </Box>

                <Column weight={1} />

                <Button
                  color="secondary"
                  size="extra-small"
                  text={intl.formatMessage({
                    id: 'page.setting.token.manage.add-token-button',
                  })}
                  onPress={() =>
                    navigate.navigate('Setting.ManageTokenList.Add', {
                      chainId,
                    })
                  }
                />
              </Columns>
              <Gutter size={12} />
            </Stack>
          }
          renderItem={({item: token}) => {
            return (
              <TokenItem
                key={token.currency.coinMinimalDenom}
                chainId={chainId}
                tokenInfo={token}
                modalOpen={() => setIsOpenMenuModal(true)}
                setMenuModalItems={setMenuModalItems}
              />
            );
          }}
          ListEmptyComponent={
            <React.Fragment>
              <Gutter size={120} direction="vertical" />
              <EmptyView
                subject={intl.formatMessage({
                  id: 'page.setting.token.manage.empty-subject',
                })}
              />
            </React.Fragment>
          }
          ItemSeparatorComponent={() => <Gutter size={8} />}
        />
      </Box>
      <MenuModal
        isOpen={isOpenMenuModal}
        setIsOpen={setIsOpenMenuModal}
        modalMenuItems={menuModalItems}
        onPressGeneral={item => {
          if (item.key === 'copy-address' || item.key === 'copy-viewing-key') {
            timerRef.current = setTimeout(() => {
              setIsOpenMenuModal(false);
            }, 500);

            return;
          }
          setIsOpenMenuModal(false);
        }}
      />
      <SelectModal
        isOpen={isOpenChainSelectModal}
        setIsOpen={setIsOpenChainSelectModal}
        onSelect={item => {
          setChainId(item.key);
          setIsOpenChainSelectModal(false);
        }}
        items={items}
        title="Select Chain"
        placeholder="Search by chain name"
      />
    </React.Fragment>
  );
});

const TokenItem: FunctionComponent<{
  chainId: string;
  tokenInfo: TokenInfo;
  modalOpen: () => void;
  setMenuModalItems: React.Dispatch<React.SetStateAction<ModalMenuItem[]>>;
}> = observer(({chainId, tokenInfo, modalOpen, setMenuModalItems}) => {
  const {tokensStore} = useStore();
  // const notification = useNotification();
  const intl = useIntl();
  const style = useStyle();
  const confirm = useConfirm();

  const isSecret20 = (() => {
    if ('type' in tokenInfo.currency) {
      return tokenInfo.currency.type === 'secret20';
    }
    return false;
  })();

  return (
    <Box
      padding={16}
      backgroundColor={
        style.get('background-color-card-default').backgroundColor
      }
      borderRadius={6}>
      <Columns sum={1}>
        <Stack gutter={4}>
          <Text style={style.flatten(['h5', 'color-text-high'])}>
            {tokenInfo.currency.coinDenom}
          </Text>
          <Text style={style.flatten(['body2', 'color-text-middle'])}>
            {(() => {
              if ('contractAddress' in tokenInfo.currency) {
                return Bech32Address.shortenAddress(
                  tokenInfo.currency.contractAddress,
                  26,
                );
              }
              return 'Unknown';
            })()}
          </Text>
        </Stack>

        <Column weight={1} />

        <Columns sum={1} gutter={8} alignY="center">
          <IconButton
            icon={
              <EllipsisIcon
                size={20}
                color={style.get('color-text-high').color}
              />
            }
            onPress={async () => {
              const secretMenu = {
                key: 'copy-viewing-key',
                label: intl.formatMessage({
                  id: 'page.setting.token.manage.token-view.copy-viewing-key-tooltip',
                }),
                isChecked: false,
                onSelect: async () => {
                  if (
                    'type' in tokenInfo.currency &&
                    tokenInfo.currency.type === 'secret20'
                  ) {
                    setMenuModalItems(prev =>
                      prev.map(item =>
                        item.key === 'copy-viewing-key'
                          ? {
                              ...item,
                              isChecked: true,
                              label: 'Copied to Clipboard',
                            }
                          : item,
                      ),
                    );
                    await Clipboard.setStringAsync(
                      tokenInfo.currency.viewingKey,
                    );
                  }
                },
              };
              const commonMenuItems = [
                {
                  key: 'copy-address',
                  label: intl.formatMessage({
                    id: 'page.setting.token.manage.token-view.copy-contract-address-tooltip',
                  }),
                  isChecked: false,
                  onSelect: async () => {
                    if ('contractAddress' in tokenInfo.currency) {
                      await Clipboard.setStringAsync(
                        tokenInfo.currency.contractAddress,
                      );
                      setMenuModalItems(prev =>
                        prev.map(item =>
                          item.key === 'copy-address'
                            ? {
                                ...item,
                                isClicked: true,
                                label: 'Copied to Clipboard',
                              }
                            : item,
                        ),
                      );
                    }
                  },
                },
                {
                  key: 'delete',
                  label: intl.formatMessage({
                    id: 'page.setting.token.manage.token-view.disable-token-tooltip',
                  }),
                  onSelect: async () => {
                    if (
                      await confirm.confirm(
                        '',
                        intl.formatMessage({
                          id: 'page.setting.token.manage.token-view.disable-token-confirm',
                        }),
                      )
                    ) {
                      await tokensStore.removeToken(chainId, tokenInfo);
                    }
                  },
                },
              ];

              const menuModalItems = isSecret20
                ? [secretMenu, ...commonMenuItems]
                : commonMenuItems;

              setMenuModalItems(menuModalItems);
              modalOpen();
            }}
          />
        </Columns>
      </Columns>
    </Box>
  );
});
