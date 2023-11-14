import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {EmitterSubscription, Keyboard, Platform, Text} from 'react-native';

import {BottomSheetFlatList, useBottomSheet} from '@gorhom/bottom-sheet';
import {useStyle} from '../../../../styles';
import {TextInput} from 'react-native-gesture-handler';
import {Gutter} from '../../../../components/gutter';
import {SearchTextInput} from '../../../../components/input/search-text-input';
import {BottomSheetSearchTextInput} from '../../../../components/input/bottom-sheet-search-input';
import {Box} from '../../../../components/box';
import {RectButton} from '../../../../components/rect-button';
import {Column, Columns} from '../../../../components/column';
import {ChainImageFallback} from '../../../../components/image';
import {ViewToken} from '../..';
import {useStore} from '../../../../stores';
import {Stack} from '../../../../components/stack';
import {IntPretty} from '@keplr-wallet/unit';
import {formatAprString} from '../../utils';
import {AprItem} from '../../../../stores/aprs';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';

export interface SelectStakingChainModalItem {
  key: string;
  viewToken: ViewToken;
}

export const SelectStakingChainModal: FunctionComponent<{
  items: SelectStakingChainModalItem[];
  placeholder?: string;
  aprList: AprItem[];
  onSelect: (item: SelectStakingChainModalItem) => void;
}> = observer(({items, placeholder, aprList, onSelect}) => {
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
            typeof item.viewToken.chainInfo.chainName === 'string' &&
            item.viewToken.chainInfo.chainName
              .toLowerCase()
              .includes(trimmedSearchText.toLowerCase())
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
            <TokenItem
              viewToken={item.viewToken}
              onSelect={onSelect}
              apr={
                aprList.filter(
                  ({chainId}) => chainId === item.viewToken.chainInfo.chainId,
                )[0]?.apr
              }
            />
          );
        }}
      />
    </React.Fragment>
  );
});

const TokenItem: FunctionComponent<{
  viewToken: ViewToken;
  onSelect: (item: SelectStakingChainModalItem) => void;
  apr?: IntPretty;
}> = observer(({viewToken, onSelect, apr}) => {
  const {priceStore} = useStore();
  const style = useStyle();
  const bottom = useBottomSheet();
  const pricePretty = priceStore.calculatePrice(viewToken.token);
  const coinDenom = (() => {
    if (
      'originCurrency' in viewToken.token.currency &&
      viewToken.token.currency.originCurrency
    ) {
      return viewToken.token.currency.originCurrency.coinDenom;
    }
    return viewToken.token.currency.coinDenom;
  })();

  return (
    <RectButton
      underlayColor={style.get('color-gray-550').color}
      rippleColor={style.get('color-gray-550').color}
      activeOpacity={1}
      style={style.flatten(['background-color-gray-600'])}
      onPress={async () => {
        onSelect({key: viewToken.chainInfo.chainId, viewToken});
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
        padding={16}
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
              src={viewToken.chainInfo.chainSymbolImageUrl}
              alt="chain icon"
            />
          </Box>
          <Stack gutter={4}>
            <Text style={style.flatten(['subtitle3', 'color-text-high'])}>
              {coinDenom}
            </Text>
            <Text style={style.flatten(['body3', 'color-text-low'])}>
              APR {formatAprString(apr, 2)}%
            </Text>
          </Stack>
          <Column weight={2} />
          <Stack alignX="right" gutter={4}>
            <Text style={style.flatten(['subtitle1', 'color-text-high'])}>
              {viewToken.token
                .hideDenom(true)
                .maxDecimals(4)
                .inequalitySymbol(true)
                .shrink(true)
                .toString()}
            </Text>
            <Text style={style.flatten(['subtitle2', 'color-text-low'])}>
              {pricePretty
                ? pricePretty.inequalitySymbol(true).toString()
                : '-'}
            </Text>
          </Stack>
          <Gutter size={4} />
          <ArrowRightIcon size={24} color={style.get('color-gray-400').color} />
        </Columns>
      </Box>
    </RectButton>
  );
});
