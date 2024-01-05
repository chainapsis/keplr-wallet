import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Text} from 'react-native';
import {Gutter} from '../gutter';
import {useStyle} from '../../styles';
import {Box} from '../box';
import {RectButton} from '../rect-button';
import {Column, Columns} from '../column';
import {ChainImageFallback} from '../image';
import {ArrowDownFillIcon} from '../icon/arrow-donw-fill';
import {SearchTextInput} from '../input/search-text-input';
import {registerCardModal} from '../modal/card';
import {ScrollView} from '../scroll-view/common-scroll-view';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {EmptyView, EmptyViewText} from '../empty-view';


export interface SelectModalItem {
  key: string;
  label: string | React.ReactNode;
  imageUrl?: string;
}

export const SelectChainModalCommonButton: FunctionComponent<{
  items: SelectModalItem[];
  placeholder?: string;
  selectedItemKey?: string;
  isOpenModal?: boolean;
  onPress: () => void;
}> = observer(({items, placeholder, selectedItemKey, isOpenModal, onPress}) => {
  const style = useStyle();
  return (
    <TouchableWithoutFeedback onPress={onPress}>
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
        }>
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
    </TouchableWithoutFeedback>
  );
});

export const SelectChainModal = registerCardModal(
  observer<{
    items: SelectModalItem[];
    placeholder?: string;
    isOpen: boolean;
    emptyTextTitle?: string;
    emptyText?: string;
    onSelect: (item: SelectModalItem) => void;
  }>(({items, emptyTextTitle, emptyText, placeholder, onSelect}) => {
    const style = useStyle();
    const [search, setSearch] = useState('');

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
      <Box>
        <Box paddingX={16}>
          <Gutter size={12} />
          <SearchTextInput
            value={search}
            onChange={e => {
              e.preventDefault();
              setSearch(e.nativeEvent.text);
            }}
            placeholder={placeholder}
          />

          <Gutter size={12} />
        </Box>
        <ScrollView
          isGestureScrollView={true}
          style={{height: 250, paddingHorizontal: 16}}>
          {filtered.map(item => {
            return (
              <RectButton
                underlayColor={style.get('color-gray-550').color}
                rippleColor={style.get('color-gray-550').color}
                activeOpacity={1}
                style={style.flatten(['background-color-gray-600'])}
                onPress={() => {
                  onSelect(item);
                }}
                key={item.key}>
                <Box
                  paddingY={14}
                  paddingLeft={16}
                  paddingRight={16}
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
                    <Text
                      style={style.flatten(['subtitle3', 'color-text-high'])}>
                      {item.label}
                    </Text>
                    <Column weight={1} />
                  </Columns>
                </Box>
              </RectButton>
            );
          })}
          {filtered.length === 0 ? (
            <React.Fragment>
              <Gutter size={30} />
              <EmptyView>
                <Box alignX="center" width={312}>
                  <React.Fragment>
                    {emptyTextTitle ? (
                      <EmptyViewText text={emptyTextTitle} />
                    ) : (
                      <EmptyViewText text={''} />
                    )}
                    <Gutter size={12} />
                  </React.Fragment>
                  {emptyText ? <EmptyViewText text={emptyText} /> : null}
                </Box>
              </EmptyView>
            </React.Fragment>
          ) : null}
        </ScrollView>
      </Box>
    );
  }),
);
