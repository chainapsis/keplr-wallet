import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useLayoutEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {useStore} from '../../../../../stores';
import {Gutter} from '../../../../../components/gutter';
import {EmptyView} from '../../../../../components/empty-view';
import {Column, Columns} from '../../../../../components/column';
import {Button} from '../../../../../components/button';
import {Box} from '../../../../../components/box';
import {Stack} from '../../../../../components/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../../../navigation';
import {useStyle} from '../../../../../styles';
import {PageWithScrollView} from '../../../../../components/page';
import {AddressItem} from '../../../components/setting-address-item';
import {useConfirm} from '../../../../../hooks/confirm';
import {
  SelectChainModal,
  SelectChainModalCommonButton,
} from '../../../../../components/select-modal';
import {MenuModal} from '../../../../../components/modal/menu-modal';

interface DropdownItem {
  key: string;
  label: string;
  onSelect: () => any;
}

export const SettingContactsListScreen: FunctionComponent = observer(() => {
  const {chainStore, uiConfigStore} = useStore();
  const navigate = useNavigation<StackNavProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'Setting.General.ContactList'>>();
  const intl = useIntl();
  const [modalDropdownItems, setModalDropdownItems] = useState<DropdownItem[]>(
    [],
  );
  const [isOpenChainSelectModal, setIsOpenChainSelectModal] = useState(false);
  const [isOpenMenuModal, setIsOpenMenuModal] = useState(false);

  const style = useStyle();
  // Handle "chainId" state by search params to persist the state between page changes.
  // const paramChainId = searchParams.get('chainId');
  const paramChainId = route.params?.chainId;
  const chainId = paramChainId || chainStore.chainInfos[0].chainId;
  const confirm = useConfirm();

  useLayoutEffect(() => {
    if (!paramChainId) {
      navigate.setParams({chainId: chainStore.chainInfos[0].chainId});
    }
  }, [chainStore.chainInfos, navigate, paramChainId]);

  const items = chainStore.chainInfos.map(chainInfo => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
      imageUrl: chainInfo.chainSymbolImageUrl,
    };
  });

  const addresses = uiConfigStore.addressBookConfig.getAddressBook(chainId);

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      style={style.flatten(['padding-12'])}>
      <Columns sum={1} alignY="center">
        <Box width={208}>
          <SelectChainModalCommonButton
            items={items}
            selectedItemKey={chainId}
            placeholder={intl.formatMessage({
              id: 'page.setting.contacts.list.modal-button-placeholder',
            })}
            isOpenModal={isOpenChainSelectModal}
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
            id: 'page.setting.contacts.list.add-new-button',
          })}
          onPress={() =>
            navigate.navigate('Setting.General.ContactAdd', {chainId})
          }
        />
      </Columns>
      <Gutter size={16} />
      <Stack gutter={8}>
        {addresses.length > 0 ? (
          addresses.map((data, i) => {
            return (
              <AddressItem
                key={i}
                name={data.name}
                address={data.address}
                memo={data.memo}
                isShowMemo={true}
                onPressMenuButton={() => {
                  setModalDropdownItems([
                    {
                      key: 'change-contact-label',
                      label: intl.formatMessage({
                        id: 'page.setting.contacts.list.dropdown.edit-contact-label',
                      }),
                      onSelect: () =>
                        navigate.navigate('Setting.General.ContactAdd', {
                          chainId,
                          editIndex: i,
                        }),
                    },
                    {
                      key: 'delete-contact',
                      label: intl.formatMessage({
                        id: 'page.setting.contacts.list.dropdown.delete-contact-label',
                      }),
                      onSelect: async () => {
                        if (
                          await confirm.confirm(
                            intl.formatMessage({
                              id: 'page.setting.contacts.list.dropdown.delete-contact-confirm-title',
                            }),
                            intl.formatMessage({
                              id: 'page.setting.contacts.list.dropdown.delete-contact-confirm-paragraph',
                            }),
                          )
                        ) {
                          uiConfigStore.addressBookConfig.removeAddressBookAt(
                            chainId,
                            i,
                          );
                        }
                      },
                    },
                  ]);

                  setIsOpenMenuModal(true);
                }}
              />
            );
          })
        ) : (
          <React.Fragment>
            <Gutter size={120} direction="vertical" />
            <EmptyView
              subject={intl.formatMessage({
                id: 'page.setting.contacts.list.empty-view-subject',
              })}
            />
          </React.Fragment>
        )}
      </Stack>
      <MenuModal
        isOpen={isOpenMenuModal}
        setIsOpen={setIsOpenMenuModal}
        modalMenuItems={modalDropdownItems}
        onPressGeneral={() => {
          setIsOpenMenuModal(false);
        }}
      />

      <SelectChainModal
        isOpen={isOpenChainSelectModal}
        setIsOpen={setIsOpenChainSelectModal}
        onSelect={item => {
          navigate.setParams({chainId: item.key});
          setIsOpenChainSelectModal(false);
        }}
        placeholder={intl.formatMessage({
          id: 'page.setting.contacts.list.select-modal.placeholder',
        })}
        emptyTextTitle={intl.formatMessage({
          id: 'page.setting.contacts.list.select-modal.empty-title',
        })}
        emptyText={intl.formatMessage({
          id: 'page.setting.contacts.list.select-modal.empty-text',
        })}
        items={items}
      />
    </PageWithScrollView>
  );
});
