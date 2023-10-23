import {observer} from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
// import {useConfirm} from '../../../../hooks/confirm';
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
import {Modal} from '../../../../../components/modal';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {Pressable, Text} from 'react-native';
import {useStyle} from '../../../../../styles';
import {PageWithScrollView} from '../../../../../components/page';
import {AddressItem} from '../../../components/setting-address-item';

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
  const menuModalRef = useRef<BottomSheetModal>(null);
  const style = useStyle();
  // Handle "chainId" state by search params to persist the state between page changes.
  // const paramChainId = searchParams.get('chainId');
  const paramChainId = route.params?.chainId;
  const chainId = paramChainId || chainStore.chainInfos[0].chainId;
  // const confirm = useConfirm();

  useLayoutEffect(() => {
    if (!paramChainId) {
      navigate.setParams({chainId: chainStore.chainInfos[0].chainId});
      // setSearchParams(
      //   {chainId: chainStore.chainInfos[0].chainId},
      //   {
      //     replace: true,
      //   },
      // );
    }
  }, [chainStore.chainInfos, navigate, paramChainId]);

  //TODO dropdown 완료 되면 dropdown 추가 해야함
  // const items = chainStore.chainInfos.map(chainInfo => {
  //   return {
  //     key: chainInfo.chainId,
  //     label: chainInfo.chainName,
  //   };
  // });

  const addresses = uiConfigStore.addressBookConfig.getAddressBook(chainId);

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      style={style.flatten(['padding-12'])}>
      <Columns sum={1} alignY="center">
        <Box width={208}>
          {/* <Dropdown
            items={items}
            selectedItemKey={chainId}
            onSelect={key => {
              setSearchParams(
                {chainId: key},
                {
                  replace: true,
                },
              );
            }}
            allowSearch={true}
          /> */}
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
                        // if (
                        //   await confirm.confirm(
                        //     intl.formatMessage({
                        //       id: 'page.setting.contacts.list.dropdown.delete-contact-confirm-title',
                        //     }),
                        //     intl.formatMessage({
                        //       id: 'page.setting.contacts.list.dropdown.delete-contact-confirm-paragraph',
                        //     }),
                        //   )
                        // ) {
                        //   uiConfigStore.addressBookConfig.removeAddressBookAt(
                        //     chainId,
                        //     i,
                        //   );
                        // }
                      },
                    },
                  ]);

                  menuModalRef.current?.present();
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
      <Modal ref={menuModalRef} isDetachedModal={true} snapPoints={[135]}>
        <BottomSheetView>
          {modalDropdownItems.map((item, i) => (
            <Pressable
              key={item.key}
              onPress={() => {
                item.onSelect();
                menuModalRef.current?.dismiss();
              }}>
              <Box
                height={68}
                alignX="center"
                alignY="center"
                style={style.flatten(
                  ['border-width-bottom-1', 'border-color-gray-500'],
                  [i === 1 && 'border-width-bottom-0'], //마지막 요소는 아래 보더 스타일 제가하기 위해서
                )}>
                <Text style={style.flatten(['body1', 'color-text-high'])}>
                  {item.label}
                </Text>
              </Box>
            </Pressable>
          ))}
        </BottomSheetView>
      </Modal>
    </PageWithScrollView>
  );
});
