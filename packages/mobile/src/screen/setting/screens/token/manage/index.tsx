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
import {Text} from 'react-native';
import {Gutter} from '../../../../../components/gutter';
import {IconButton} from '../../../../../components/icon-button';

import * as Clipboard from 'expo-clipboard';
import {EllipsisIcon} from '../../../../../components/icon/ellipsis';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../../../navigation';
import {Modal} from '../../../../../components/modal';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {Dropdown} from '../../../../../components/dropdown';

interface MenuModalItems {
  key: string;
  label: string;
  isChecked?: boolean;
  onSelect: () => any;
}

export const SettingTokenListScreen: FunctionComponent = observer(() => {
  const {chainStore, accountStore, tokensStore} = useStore();

  const intl = useIntl();
  const navigate = useNavigation<StackNavProp>();
  const style = useStyle();
  const menuModalRef = useRef<BottomSheetModal>(null);
  const [menuModalItems, setMenuModalItems] = useState<MenuModalItems[]>([
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
      return supportedChainInfos[1].chainId;
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
    };
  });

  const tokens = tokensStore.getTokens(chainId);

  return (
    <React.Fragment>
      <Box paddingX={12}>
        <Stack gutter={8}>
          <Text
            style={style.flatten([
              'body2',
              'color-text-middle',
              'text-center',
              'margin-bottom-12',
            ])}>
            <FormattedMessage id="page.setting.token.manage.paragraph" />
          </Text>
          <Columns sum={1} alignY="center">
            <Box width={208}>
              <Dropdown
                items={items}
                selectedItemKey={chainId}
                onSelect={setChainId}
                allowSearch={true}
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
                navigate.navigate('Setting.ManageTokenList.Add', {chainId})
              }
            />
          </Columns>

          {tokens.length === 0 ? (
            <React.Fragment>
              <Gutter size={120} direction="vertical" />
              <EmptyView
                subject={intl.formatMessage({
                  id: 'page.setting.token.manage.empty-subject',
                })}
              />
            </React.Fragment>
          ) : (
            tokens.map(token => {
              return (
                <TokenItem
                  key={token.currency.coinMinimalDenom}
                  chainId={chainId}
                  tokenInfo={token}
                  modalOpen={() => menuModalRef.current?.present()}
                  setMenuModalItems={setMenuModalItems}
                />
              );
            })
          )}
        </Stack>
      </Box>
      <Modal
        isDetachedModal={true}
        ref={menuModalRef}
        //NOTE DynamicSizing로 하면 detached가 안되서 각 item높이를 갯수만큼 곱해서 설정함
        snapPoints={[68 * menuModalItems.length]}>
        <BottomSheetView>
          {menuModalItems.map((item, i) => (
            <Box
              key={item.key}
              height={68}
              alignX="center"
              alignY="center"
              style={style.flatten(
                ['border-width-bottom-1', 'border-color-gray-500'],
                [i === menuModalItems.length - 1 && 'border-width-bottom-0'], //마지막 요소는 아래 보더 스타일 제가하기 위해서
              )}
              onClick={() => {
                item.onSelect();
                menuModalRef.current?.dismiss();
              }}>
              <Text
                style={style.flatten(
                  ['body1', 'color-text-high'],
                  [item.isChecked && 'color-red-200'],
                )}>
                {item.label}
              </Text>
            </Box>
          ))}
        </BottomSheetView>
      </Modal>
    </React.Fragment>
  );
});

const TokenItem: FunctionComponent<{
  chainId: string;
  tokenInfo: TokenInfo;
  modalOpen: () => void;
  setMenuModalItems: React.Dispatch<React.SetStateAction<MenuModalItems[]>>;
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
      backgroundColor={style.get('background-color-gray-600').backgroundColor}
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
                onSelect: async () => {
                  if (
                    'type' in tokenInfo.currency &&
                    tokenInfo.currency.type === 'secret20'
                  ) {
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
                  onSelect: async () => {
                    if ('contractAddress' in tokenInfo.currency) {
                      await Clipboard.setStringAsync(
                        tokenInfo.currency.contractAddress,
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
