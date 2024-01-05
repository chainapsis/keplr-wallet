import React, {FunctionComponent, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
  useMemoConfig,
  useRecipientConfig,
  useTxConfigsValidate,
} from '@keplr-wallet/hooks';
import {useIntl} from 'react-intl';
import {useStore} from '../../../../../stores';
import {MemoInput} from '../../../../../components/input/memo-input';
import {RecipientInput} from '../../../../../components/input/reciepient-input';
import {TextInput} from '../../../../../components/input';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {Stack} from '../../../../../components/stack';
import {RootStackParamList} from '../../../../../navigation';
import {Button} from '../../../../../components/button';
import {Column} from '../../../../../components/column';
import {StyleSheet} from 'react-native';
import {PageWithScrollView} from '../../../../../components/page';
import {useStyle} from '../../../../../styles';
import {useFocusAfterRouting} from '../../../../../hooks/use-focus';

export const SettingContactsAddScreen: FunctionComponent = observer(() => {
  const {chainStore, uiConfigStore} = useStore();
  const labelRef = useFocusAfterRouting();
  const navigate = useNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'Setting.General.ContactAdd'>>();
  const intl = useIntl();
  const style = useStyle();

  const [chainId, setChainId] = useState(chainStore.chainInfosInUI[0].chainId);
  // If edit mode, this will be equal or greater than 0.
  const [editIndex, setEditIndex] = useState(-1);

  const [name, setName] = useState('');

  const recipientConfig = useRecipientConfig(chainStore, chainId, {
    allowHexAddressOnEthermint: !chainStore
      .getChain(chainId)
      .chainId.startsWith('injective'),
    icns: uiConfigStore.icnsInfo,
  });
  const memoConfig = useMemoConfig(chainStore, chainId);

  // Param "chainId" is required.
  const paramChainId = route.params.chainId;
  const paramEditIndex = route.params.editIndex;

  useEffect(() => {
    navigate.setOptions({
      title:
        editIndex < 0
          ? intl.formatMessage({id: 'page.setting.contacts.add.add-title'})
          : intl.formatMessage({id: 'page.setting.contacts.add.edit-title'}),
    });
  }, [editIndex, intl, navigate]);

  useEffect(() => {
    if (!paramChainId) {
      throw new Error('Param "chainId" is required');
    }

    setChainId(paramChainId);
    recipientConfig.setChain(paramChainId);
    memoConfig.setChain(paramChainId);

    if (typeof paramEditIndex !== 'undefined') {
      const index = paramEditIndex;
      // const index = Number.parseInt(paramEditIndex, 10);
      const addressBook =
        uiConfigStore.addressBookConfig.getAddressBook(paramChainId);
      if (addressBook.length > index) {
        setEditIndex(index);
        const data = addressBook[index];
        setName(data.name);
        recipientConfig.setValue(data.address);
        memoConfig.setValue(data.memo);
        return;
      }
    }

    setEditIndex(-1);
  }, [
    intl,
    memoConfig,
    paramChainId,
    paramEditIndex,
    recipientConfig,
    uiConfigStore.addressBookConfig,
  ]);

  const txConfigsValidate = useTxConfigsValidate({
    recipientConfig,
    memoConfig,
  });

  const handleSubmit = () => {
    if (txConfigsValidate.interactionBlocked || name === '') {
      return;
    }
    if (editIndex < 0) {
      uiConfigStore.addressBookConfig.addAddressBook(chainId, {
        name,
        address: recipientConfig.value,
        memo: memoConfig.value,
      });
    } else {
      uiConfigStore.addressBookConfig.setAddressBookAt(chainId, editIndex, {
        name,
        address: recipientConfig.value,
        memo: memoConfig.value,
      });
    }

    navigate.goBack();
  };
  return (
    <PageWithScrollView
      backgroundMode="default"
      contentContainerStyle={StyleSheet.flatten([
        style.flatten(['flex-grow-1', 'padding-x-12', 'padding-top-8']),
        {paddingBottom: 23},
      ])}>
      <Stack gutter={16}>
        <TextInput
          label={intl.formatMessage({
            id: 'page.setting.contacts.add.label-label',
          })}
          ref={labelRef}
          value={name}
          placeholder={intl.formatMessage({
            id: 'page.setting.contacts.add.label-placeholder',
          })}
          onChange={e => {
            e.preventDefault();
            setName(e.nativeEvent.text);
          }}
        />
        <RecipientInput
          recipientConfig={recipientConfig}
          hideAddressBookButton={true}
        />
        <MemoInput
          label={intl.formatMessage({
            id: 'page.setting.contacts.add.memo-label',
          })}
          placeholder={intl.formatMessage({
            id: 'page.setting.contacts.add.memo-placeholder',
          })}
          memoConfig={memoConfig}
        />
      </Stack>
      <Column weight={1} />
      <Button
        text={intl.formatMessage({
          id: 'button.confirm',
        })}
        color="primary"
        size="large"
        disabled={txConfigsValidate.interactionBlocked || name === ''}
        onPress={() => handleSubmit()}
      />
    </PageWithScrollView>
  );
});
