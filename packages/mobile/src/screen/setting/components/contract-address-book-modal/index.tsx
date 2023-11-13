import React, {FunctionComponent, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStore} from '../../../../stores';
import {useFocusOnMount} from '../../../../hooks/use-focus-on-mount';
import {
  EmitterSubscription,
  Keyboard,
  Linking,
  Platform,
  Text,
} from 'react-native';
import {SearchTextInput} from '../../../../components/input/search-text-input';
import {Gutter} from '../../../../components/gutter';
import {useStyle} from '../../../../styles';
import {BottomSheetFlatList, useBottomSheet} from '@gorhom/bottom-sheet';
import {Box} from '../../../../components/box';
import {EmptyView} from '../../../../components/empty-view';
import {ContractAddressItem} from '../contract-item';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TokenContractListRepoURL} from '../../../../utils/config.ui';
import {BottomSheetSearchTextInput} from '../../../../components/input/bottom-sheet-search-input';
import {TextInput} from 'react-native-gesture-handler';

export const ContractAddressBookModal: FunctionComponent<{
  chainId: string;
  onSelect: (address: string) => void;
}> = observer(({chainId, onSelect}) => {
  const {queriesStore} = useStore();
  const style = useStyle();
  const contracts =
    queriesStore.get(chainId).tokenContracts.queryTokenContracts.tokenContracts;
  const insect = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const searchRef = useFocusOnMount<TextInput>();
  const bottom = useBottomSheet();

  const intl = useIntl();

  //NOTE - https://github.com/gorhom/react-native-bottom-sheet/issues/1072
  // android에서 키보드가 열렸을때 modal을 close 트리거 할 경우
  // 키보드가 먼저 사라지면서 bottomSheet높이가 다시 설정되고 리렌더링 되는 버그가 있음
  // 그래서 setTimeout으로 키보드를 먼저 닫은뒤 bottomSheet을 닫도록 설정함
  useEffect(() => {
    let keyboardDidHideListener: EmitterSubscription;
    if (Platform.OS === 'android') {
      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setTimeout(() => {
          bottom.close();
        }, 0);
      });
    }

    return () => {
      if (Platform.OS === 'android') {
        keyboardDidHideListener.remove();
      }
    };
  }, [bottom]);

  const filtered = search
    ? contracts.filter(
        contract =>
          contract.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
          contract.metadata.symbol.toLowerCase().includes(search.toLowerCase()),
      )
    : contracts;

  return (
    <React.Fragment>
      <Box paddingRight={12} paddingLeft={12}>
        <Text
          style={style.flatten([
            'text-center',
            'subtitle1',
            'color-text-high',
            'padding-8',
          ])}>
          <FormattedMessage id="page.setting.token.add.contract-address-book-modal.title" />
        </Text>
        <Gutter size={12} />
        {Platform.OS === 'android' ? (
          <SearchTextInput
            ref={searchRef}
            value={search}
            onChange={e => {
              e.preventDefault();
              setSearch(e.nativeEvent.text);
            }}
            placeholder={intl.formatMessage({
              id: 'page.setting.token.add.contract-address-book-modal.search-placeholder',
            })}
          />
        ) : (
          <BottomSheetSearchTextInput
            ref={searchRef}
            value={search}
            onChange={e => {
              e.preventDefault();
              setSearch(e.nativeEvent.text);
            }}
            placeholder={intl.formatMessage({
              id: 'page.setting.token.add.contract-address-book-modal.search-placeholder',
            })}
          />
        )}

        <Gutter size={12} />
      </Box>
      <BottomSheetFlatList
        data={filtered}
        renderItem={({item, index}) => {
          return (
            <ContractAddressItem
              key={index}
              name={item.metadata.name}
              address={item.contractAddress}
              imageUrl={item.imageUrl}
              afterSelect={address => {
                onSelect(address);

                if (Platform.OS === 'android') {
                  if (Keyboard.isVisible()) {
                    Keyboard.dismiss();
                    return;
                  }
                  bottom.close();
                  return;
                }
                bottom.close();
              }}
            />
          );
        }}
        ListEmptyComponent={
          <Box alignX="center" alignY="center">
            <Gutter size={50} />
            <EmptyView>
              <Text style={style.flatten(['subtitle3'])}>
                <FormattedMessage id="page.setting.token.add.contract-address-book-modal.no-search-data" />
              </Text>
            </EmptyView>
          </Box>
        }
      />

      <Box
        alignX="center"
        alignY="bottom"
        paddingTop={16}
        paddingBottom={insect.bottom}
        onClick={() => {
          Linking.openURL(TokenContractListRepoURL);
        }}>
        <Text
          style={style.flatten(['subtitle3', 'color-text-low', 'text-center'])}>
          <FormattedMessage
            id="page.setting.token.add.contract-address-book-modal.link"
            values={{
              link: (...chunks: any) => (
                <Text
                  style={style.flatten(['text-underline', 'color-gray-50'])}>
                  {chunks}
                </Text>
              ),
            }}
          />
        </Text>
      </Box>
    </React.Fragment>
  );
});
