import React, {useState} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {useStyle} from '../../styles';
import {Label} from '../input/label';

export const MnemonicInput = React.forwardRef<
  NativeTextInput,
  React.ComponentProps<typeof NativeTextInput> & {
    labelStyle?: TextStyle;
    containerStyle?: ViewStyle;
    inputContainerStyle?: ViewStyle;
    errorLabelStyle?: TextStyle;

    label?: string;
    error?: string;
    paragraph?: string;

    topInInputContainer?: React.ReactNode;
    bottomInInputContainer?: React.ReactNode;

    inputLeft?: React.ReactNode;
    inputRight?: React.ReactNode;
  }
>((props, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const {
    style: propsStyle,
    containerStyle,
    inputContainerStyle,
    label,
    error,
    paragraph,
    topInInputContainer,
    inputLeft,
    inputRight,
    onBlur,
    onFocus,
    ...restProps
  } = props;

  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(['padding-bottom-28']),
        containerStyle,
      ])}>
      {label ? <Label content={label} /> : null}
      <View
        style={StyleSheet.flatten([
          style.flatten(
            [
              'background-color-gray-600',
              'light:background-color-platinum-700',
              'padding-x-11',
              'padding-y-12',
              'border-radius-6',
              'border-width-1',
            ],
            [
              // The order is important.
              // The border color has different priority according to state.
              // The more in front, the lower the priority.
              isFocused ? 'border-color-blue-400' : undefined,
              isFocused ? 'light:border-color-platinum-100' : undefined,
              error ? 'border-color-red-200' : undefined,
              error ? 'light:border-color-red-400' : undefined,
              !(props.editable ?? true) && 'background-color-gray-50',
              !(props.editable ?? true) &&
                'light:background-color-platinum-500',
            ],
          ),
          inputContainerStyle,
        ])}>
        {topInInputContainer}
        <View style={style.flatten(['flex-row', 'items-center'])}>
          {inputLeft}
          <NativeTextInput
            multiline={true}
            numberOfLines={4}
            placeholderTextColor={
              props.placeholderTextColor ??
              style.flatten(
                ['color-gray-300', 'light:color-platinum-500'],
                [!(props.editable ?? true) && 'light:color-platinum-200'],
              ).color
            }
            style={StyleSheet.flatten([
              style.flatten(
                [
                  'padding-0',
                  'body2',
                  'color-white',
                  'light:color-platinum-50',
                  'flex-1',
                  'min-height-104',
                ],
                [
                  !(props.editable ?? true) && 'color-gray-300',
                  !(props.editable ?? true) && 'light:color-platinum-200',
                ],
              ),
              Platform.select({
                ios: {},
                android: {
                  // On android, the text input's height does not equals to the line height by strange.
                  // To fix this problem, set the height explicitly.
                  height: style.get('body2-in-text-input')?.lineHeight,
                },
              }),
              {
                textAlignVertical: 'top',
              },
              propsStyle,
            ])}
            onFocus={e => {
              setIsFocused(true);

              if (onFocus) {
                onFocus(e);
              }
            }}
            onBlur={e => {
              setIsFocused(false);

              if (onBlur) {
                onBlur(e);
              }
            }}
            {...restProps}
            ref={ref}
          />
          {inputRight}
        </View>
      </View>
      {error || paragraph ? (
        <Text
          style={StyleSheet.flatten([
            style.flatten([
              'text-caption2',
              'margin-top-4',
              'margin-left-8',
              ...(getSubTextStyleForErrorOrParagraph(error, paragraph) as any),
            ]),
          ])}>
          {error || paragraph}
        </Text>
      ) : null}
    </View>
  );
});

const getSubTextStyleForErrorOrParagraph = (
  error?: string,
  paragraph?: string,
) => {
  if (error) {
    return ['color-yellow-400'] as const;
  }

  if (paragraph) {
    return ['color-platinum-200'] as const;
  }
};
