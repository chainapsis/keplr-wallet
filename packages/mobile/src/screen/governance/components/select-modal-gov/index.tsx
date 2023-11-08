import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {EmitterSubscription, Keyboard, Platform, Text} from 'react-native';
import {BottomSheetFlatList, useBottomSheet} from '@gorhom/bottom-sheet';
import {TextInput} from 'react-native-gesture-handler';
import {useStyle} from '../../../../styles';
import {BottomSheetSearchTextInput} from '../../../../components/input/bottom-sheet-search-input';
import {SearchTextInput} from '../../../../components/input/search-text-input';
import {Gutter} from '../../../../components/gutter';
import {Box} from '../../../../components/box';
import {RectButton} from '../../../../components/rect-button';
import {Column, Columns} from '../../../../components/column';
import {ChainImageFallback} from '../../../../components/image';

export interface SelectModalItem {
  key: string;
  label: string | React.ReactNode;
  imageUrl?: string;
}

export const GovSelectChainModal: FunctionComponent<{
  items: SelectModalItem[];
  placeholder?: string;
  onSelect: (item: SelectModalItem) => void;
}> = observer(({items, placeholder, onSelect}) => {
  const style = useStyle();
  const [search, setSearch] = useState('');
  const searchRef = useRef<TextInput>(null);
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
      <Box paddingTop={0} paddingRight={12} paddingBottom={0} paddingLeft={12}>
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
                  <Column weight={1} />
                </Columns>
              </Box>
            </RectButton>
          );
        }}
      />
    </React.Fragment>
  );
});
