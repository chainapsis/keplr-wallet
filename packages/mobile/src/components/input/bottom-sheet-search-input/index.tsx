import {BottomSheetTextInput as LibTextInput} from '@gorhom/bottom-sheet';
import React, {forwardRef, isValidElement, useState} from 'react';
import {StyleSheet, TextInputProps, TextStyle, ViewStyle} from 'react-native';
import {useStyle} from '../../../styles';
import {Box} from '../../box';
import {Column, Columns} from '../../column';
import {SearchIcon} from '../../icon';
import {TextInput} from 'react-native-gesture-handler';

interface WrapBottomSheetTextInputProps {
  value: string;
  inputStyle?: TextStyle;
  placeholder?: string;
  disabled?: boolean;
  left?: React.ReactNode | ((color: string) => React.ReactNode);
  containerStyle?: ViewStyle;
}
const LeftIcon = (color: string) => <SearchIcon color={color} size={20} />;

export const BottomSheetSearchTextInput = forwardRef<
  TextInput,
  WrapBottomSheetTextInputProps & TextInputProps
>(
  (
    {
      value,
      placeholder,
      containerStyle,
      inputStyle,
      disabled,
      left,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const style = useStyle();
    const [isFocus, setIsFocus] = useState(false);
    const inputBorderColor = (() => {
      if (isFocus) {
        return ['border-color-gray-200'] as const;
      }

      return ['border-color-gray-400'] as const;
    })();

    const disableStyle = [
      'background-color-gray-600',
      'border-color-gray-300',
    ] as const;

    const iconColor = 'color-gray-400';

    return (
      <Box style={StyleSheet.flatten([containerStyle])}>
        <Box
          borderWidth={1}
          borderRadius={8}
          position="relative"
          style={style.flatten(
            ['background-color-gray-700', ...inputBorderColor],
            [...(disabled ? disableStyle : [])],
          )}>
          <Columns sum={1}>
            <Box alignY="center" marginLeft={16}>
              {left
                ? isValidElement(left) || !left || !(typeof left === 'function')
                  ? left
                  : left(style.get(iconColor as any).color)
                : LeftIcon(style.get(iconColor as any).color)}
            </Box>

            <Column weight={1}>
              <LibTextInput
                ref={ref}
                value={value}
                placeholder={placeholder}
                style={StyleSheet.flatten([
                  style.flatten([
                    'color-white',
                    'body2',
                    'height-52',
                    'padding-left-4',
                    'padding-right-16',
                  ]),
                  inputStyle,
                ])}
                onFocus={e => {
                  setIsFocus(true);

                  if (onFocus) {
                    onFocus(e);
                  }
                }}
                onBlur={e => {
                  setIsFocus(false);

                  if (onBlur) {
                    onBlur(e);
                  }
                }}
                placeholderTextColor={style.get('color-gray-400').color}
                {...props}
              />
            </Column>
          </Columns>
        </Box>
      </Box>
    );
  },
);
