import React, {FunctionComponent} from 'react';
import {Pressable, Text, ViewStyle} from 'react-native';
import {useStyle} from '../../styles';
import {Box} from '../box';
import {Label} from '../input/label';
import {Columns} from '../column';
import {ArrowDownFillIcon} from '../icon/arrow-down-fill';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';

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
  menuContainerMaxHeight?: string;

  allowSearch?: boolean;
}

export const Dropdown: FunctionComponent<DropdownProps> = ({
  items,
  label,
  placeholder,
  selectedItemKey,
  color,
  size,
  allowSearch,
}) => {
  const style = useStyle();
  const [isOpen, setIsOpen] = React.useState(false);

  const [searchText, setSearchText] = React.useState('');

  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      if (!allowSearch) {
        return true;
      }

      const trimmedSearchText = searchText.trim();
      if (trimmedSearchText.length > 0) {
        return (
          typeof item.label === 'string' &&
          item.label.toLowerCase().includes(trimmedSearchText.toLowerCase())
        );
      }

      return true;
    });
  }, [allowSearch, items, searchText]);

  return (
    <Box position="relative">
      {label ? <Label content={label} /> : null}

      <Pressable onPress={() => setIsOpen(true)}>
        <Box
          position="relative"
          alignY={'center'}
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
          }>
          <Columns sum={1}>
            <Text
              style={style.flatten([
                selectedItemKey ? 'color-gray-50' : 'color-gray-300',
                isOpen && allowSearch ? 'display-none' : 'opacity-100',
                'flex-1',
              ])}>
              {selectedItemKey
                ? items.find(item => item.key === selectedItemKey)?.label ??
                  placeholder
                : placeholder}
            </Text>

            <ArrowDownFillIcon
              size={24}
              color={style.get('color-white').color}
            />
          </Columns>
        </Box>
      </Pressable>

      <Box
        position="absolute"
        borderColor={style.get('color-red-500').color}
        borderWidth={1}
        borderRadius={6}
        height={200}
        style={style.flatten([
          'flex-1',
          'width-full',
          'overflow-hidden',
          'margin-top-82',
          isOpen && filteredItems.length > 0 ? 'flex' : 'display-none',
        ])}>
        <BottomSheetFlatList
          data={filteredItems}
          keyExtractor={item => item.key}
          renderItem={({item}) => (
            <Box
              alignX="center"
              height={52}
              backgroundColor={style.get('color-gray-500').color}>
              <Text style={style.flatten(['color-red-400'])}>{item.label}</Text>
            </Box>
          )}
        />
      </Box>
    </Box>
  );
};
