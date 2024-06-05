import React, {FunctionComponent, useEffect, useRef} from 'react';
import {StyleSheet, Text, TextInput, View, ViewStyle} from 'react-native';
import {useStyle} from '../../styles';
import {Box} from '../box';
import {Label} from '../input/label';
import {ArrowDownFillIcon} from '../icon/arrow-down-fill';
import {
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native-gesture-handler';
import {XAxis} from '../axis';

export interface DropdownItemProps {
  key: string;
  label: string | React.ReactNode;
}

export interface DropdownProps {
  items: DropdownItemProps[];
  selectedItemKey?: string;
  onSelect: (key: string) => void;
  placeholder?: string;
  className?: string;
  style?: ViewStyle;
  color?: 'default' | 'text-input';
  size?: 'small' | 'large';
  label?: string;
  allowSearch?: boolean;
  searchExcludedKeys?: string[];

  itemContainerStyle?: ViewStyle;
  listContainerStyle?: ViewStyle;
}

export const Dropdown: FunctionComponent<DropdownProps> = ({
  items,
  label,
  placeholder,
  selectedItemKey,
  onSelect,
  color,
  size,
  allowSearch,
  itemContainerStyle,
  listContainerStyle,
  searchExcludedKeys,
}) => {
  const style = useStyle();
  const [isOpen, setIsOpen] = React.useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const [searchText, setSearchText] = React.useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchText('');
    } else {
      if (allowSearch) {
        searchInputRef.current?.focus();
      }
    }
  }, [allowSearch, isOpen]);

  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      if (!allowSearch) {
        return true;
      }

      const trimmedSearchText = searchText.trim();
      if (trimmedSearchText.length > 0) {
        return (
          typeof item.label === 'string' &&
          item.label.toLowerCase().includes(trimmedSearchText.toLowerCase()) &&
          (!searchExcludedKeys || !searchExcludedKeys.includes(item.key))
        );
      }

      return true;
    });
  }, [allowSearch, items, searchText, searchExcludedKeys]);

  return (
    <Box zIndex={1}>
      {label ? <Label content={label} /> : null}

      <TouchableWithoutFeedback onPress={() => setIsOpen(!isOpen)}>
        <Box
          alignY="center"
          height={size === 'small' ? 44 : 52}
          backgroundColor={style.get('color-gray-700').color}
          paddingX={16}
          paddingY={10}
          borderRadius={8}
          borderWidth={1}
          borderColor={
            color === 'text-input'
              ? isOpen
                ? style.get('color-gray-200').color
                : style.get('color-gray-400').color
              : isOpen
              ? style.get('color-gray-200').color
              : style.get('color-gray-500').color
          }
          style={StyleSheet.flatten([itemContainerStyle])}>
          <XAxis alignY="center">
            <Box
              position="absolute"
              style={{
                opacity: !isOpen || !allowSearch ? 0 : 1,
                pointerEvents: !isOpen || !allowSearch ? 'none' : 'auto',
              }}>
              <TextInput
                ref={searchInputRef}
                value={searchText}
                onChangeText={text => {
                  setSearchText(text);
                }}
                selectionColor={style.get('color-gray-50').color}
                style={{
                  padding: 0,
                  borderWidth: 1,
                  color: selectedItemKey
                    ? style.get('color-gray-50').color
                    : style.get('color-gray-300').color,
                }}
              />
            </Box>

            <Text
              style={style.flatten([
                'body2',
                selectedItemKey ? 'color-gray-50' : 'color-gray-300',
                isOpen && allowSearch ? 'display-none' : 'opacity-100',
              ])}>
              {selectedItemKey
                ? items.find(item => item.key === selectedItemKey)?.label ??
                  placeholder
                : placeholder}
            </Text>

            <Box style={{flex: 1}} />

            <ArrowDownFillIcon
              size={24}
              color={style.get('color-white').color}
            />
          </XAxis>
        </Box>
      </TouchableWithoutFeedback>
      <View>
        <ScrollView
          style={StyleSheet.flatten([
            {
              ...style.flatten([
                'flex-1',
                'width-full',
                'overflow-hidden',
                isOpen && filteredItems.length > 0 ? 'flex' : 'display-none',
                'background-color-gray-600',
                'border-width-1',
                'border-color-gray-500',
                'border-radius-6',
              ]),
              maxHeight: 160,
              position: 'absolute',
            },
            listContainerStyle,
          ])}>
          {filteredItems.map((item, index) => {
            return (
              <React.Fragment>
                <DropdownItem
                  key={item.key}
                  item={item}
                  onSelect={onSelect}
                  closeDropdown={() => setIsOpen(!isOpen)}
                />

                {filteredItems.length - 1 > index ? <Divider /> : null}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>
    </Box>
  );
};

const Divider = () => {
  const style = useStyle();

  return <Box height={1} backgroundColor={style.get('color-gray-500').color} />;
};

const DropdownItem: FunctionComponent<{
  item: DropdownItemProps;
  onSelect: (key: string) => void;
  closeDropdown: () => void;
}> = ({item, onSelect, closeDropdown}) => {
  const style = useStyle();

  return (
    <TouchableWithoutFeedback
      style={{zIndex: 2}}
      onPress={() => {
        onSelect(item.key);
        closeDropdown();
      }}>
      <Box
        alignY="center"
        height={52}
        paddingX={24}
        paddingY={15}
        backgroundColor={style.get('color-gray-600').color}>
        <Text style={style.flatten(['color-text-high'])}>{item.label}</Text>
      </Box>
    </TouchableWithoutFeedback>
  );
};
