import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useIntl} from 'react-intl';
import {EmitterSubscription, Keyboard, Platform, Text} from 'react-native';
import {Gutter} from '../gutter';
import {useStyle} from '../../styles';
import {BottomSheetFlatList, useBottomSheet} from '@gorhom/bottom-sheet';
import {Box} from '../box';
import {RectButton} from '../rect-button';
import {Column, Columns} from '../column';
import {ChainImageFallback} from '../image';
import {TextButton} from '../text-button';
import {ArrowDownFillIcon} from '../icon/arrow-donw-fill';
import {BottomSheetSearchTextInput} from '../input/bottom-sheet-search-input';
import {TextInput} from 'react-native-gesture-handler';
import {SearchTextInput} from '../input/search-text-input';

export interface SelectModalItem {
  key: string;
  label: string | React.ReactNode;
  imageUrl?: string;
}

export const SelectModalCommonButton: FunctionComponent<{
  items: SelectModalItem[];
  placeholder?: string;
  selectedItemKey?: string;
  isOpenModal?: boolean;
  onPress: () => void;
}> = observer(({items, placeholder, selectedItemKey, isOpenModal, onPress}) => {
  const style = useStyle();
  return (
    <Box
      alignY="center"
      height={52}
      backgroundColor={style.get('color-gray-700').color}
      paddingX={16}
      paddingY={10}
      borderRadius={8}
      borderWidth={1}
      borderColor={
        isOpenModal
          ? style.get('color-gray-400').color
          : style.get('color-gray-500').color
      }
      onClick={onPress}>
      <Columns sum={1} alignY="center">
        <Text
          style={style.flatten([
            selectedItemKey ? 'color-gray-50' : 'color-gray-300',
            'flex-1',
          ])}>
          {selectedItemKey
            ? items.find(item => item.key === selectedItemKey)?.label ??
              placeholder
            : ''}
        </Text>

        <ArrowDownFillIcon size={24} color={style.get('color-white').color} />
      </Columns>
    </Box>
  );
});

export const SelectModal: FunctionComponent<{
  title: string;
  items: SelectModalItem[];
  placeholder?: string;
  onSelect: (item: SelectModalItem) => void;
}> = observer(({items, title, placeholder, onSelect}) => {
  const style = useStyle();
  const [search, setSearch] = useState('');
  const searchRef = useRef<TextInput>(null);
  const intl = useIntl();
  const bottom = useBottomSheet();

  useEffect(() => {
    searchRef.current?.focus();
  }, [searchRef]);

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
    ? items.filter(item => {
        const trimmedSearchText = search.trim();
        if (trimmedSearchText.length > 0) {
          return (
            typeof item.label === 'string' &&
            item.label.toLowerCase().includes(trimmedSearchText.toLowerCase())
          );
        }
      })
    : items;

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
          {title}
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
            placeholder={placeholder}
          />
        ) : (
          <BottomSheetSearchTextInput
            ref={searchRef}
            value={search}
            onChange={e => {
              e.preventDefault();
              setSearch(e.nativeEvent.text);
            }}
            placeholder={placeholder}
            onSubmitEditing={() => {
              bottom.snapToIndex(0);
            }}
          />
        )}

        <Gutter size={12} />
      </Box>
      <BottomSheetFlatList
        data={filtered}
        renderItem={({item}) => {
          return (
            <RectButton
              underlayColor={style.get('color-gray-550').color}
              rippleColor={style.get('color-gray-550').color}
              activeOpacity={1}
              style={style.flatten(['background-color-gray-600'])}
              onPress={async () => {
                onSelect(item);
                //NOTE - https://github.com/gorhom/react-native-bottom-sheet/issues/1072
                // android에서 키보드가 열렸을때 modal을 close 트리거 할 경우
                // 키보드가 먼저 사라지면서 bottomSheet높이가 다시 설정되고 리렌더링 되는 버그가 있음
                // 그래서 setTimeout으로 키보드를 먼저 닫은뒤 bottomSheet을 닫도록 설정함
                if (Platform.OS === 'android') {
                  if (Keyboard.isVisible()) {
                    Keyboard.dismiss();
                    return;
                  }
                  bottom.close();
                  return;
                }
                bottom.close();
              }}>
              <Box
                paddingY={14}
                paddingLeft={16}
                paddingRight={8}
                borderRadius={6}
                height={74}
                alignY="center"
                alignX="center">
                <Columns sum={1} alignY="center" gutter={8}>
                  <Box>
                    <ChainImageFallback
                      style={{
                        width: 32,
                        height: 32,
                      }}
                      src={item.imageUrl}
                      alt="chain icon"
                    />
                  </Box>
                  <Text style={style.flatten(['subtitle3', 'color-text-high'])}>
                    {item.label}
                  </Text>
                  <Column weight={2} />
                  <TextButton
                    text={intl.formatMessage({
                      id: 'page.setting.token.add.contract-item.select-button',
                    })}
                  />
                </Columns>
              </Box>
            </RectButton>
          );
        }}
      />
    </React.Fragment>
  );
});
