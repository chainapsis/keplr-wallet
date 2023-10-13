import React, {
  forwardRef,
  FunctionComponent,
  isValidElement,
  PropsWithChildren,
  useState,
} from 'react';
import {TextInputProps} from './types';
import {useStyle} from '../../../styles';
import {
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  TextInputProps as NativeTextInputProps,
} from 'react-native';
import {Label} from '../label';
import {Box} from '../../box';
import {Column, Columns} from '../../column';

export const TextInput = forwardRef<
  NativeTextInput,
  TextInputProps & NativeTextInputProps
>(
  (
    {
      containerStyle,
      style: inputStyle,
      label,
      paragraph,
      error,
      rightLabel,
      left,
      right,
      bottom,
      isLoading,
      disabled,
      autoComplete,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const style = useStyle();
    const [isFocus, setIsFocus] = useState(false);

    const inputBorderColor = (() => {
      if (error || props.errorBorder) {
        return ['border-color-yellow-400'] as const;
      }

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
        <Columns sum={1} alignY="center">
          {label ? <Label content={label} isLoading={isLoading} /> : null}
          <Column weight={1} />
          {rightLabel ? <Box>{rightLabel}</Box> : null}
        </Columns>

        <Box
          borderWidth={1}
          borderRadius={8}
          position="relative"
          style={style.flatten(
            ['background-color-gray-700', ...inputBorderColor],
            [...(disabled ? disableStyle : [])],
          )}>
          <Columns sum={1}>
            {/*
               left, right props이 변했을때 컴포넌트 자체의 구조가 바뀌면서 text input이 re-render되서 focus를 잃을 수 있다
               이 문제 때문에 컴포넌트의 render 구조를 유지하기 위해서 MockBox를 사용한다.
               쓸데없어 보이지만 중요한 친구임.
             */}
            <MockBox show={!!left}>
              <Box alignY="center" marginLeft={16}>
                {isValidElement(left) || !left || !(typeof left === 'function')
                  ? left
                  : left(style.get(iconColor as any).color)}
              </Box>
            </MockBox>

            <Column weight={1}>
              <NativeTextInput
                editable={!disabled}
                selectTextOnFocus={!disabled}
                style={StyleSheet.flatten([
                  style.flatten(
                    ['color-white', 'body2', 'height-52'],
                    left
                      ? ['padding-left-4', 'padding-right-16']
                      : ['padding-x-16'],
                  ),
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
                ref={ref}
                autoComplete={autoComplete || 'off'}
                {...props}
              />
            </Column>

            <MockBox show={!!right}>
              <Box alignY="center" marginRight={16}>
                {isValidElement(right) ||
                !right ||
                !(typeof right === 'function')
                  ? right
                  : right(style.get(iconColor as any).color)}
              </Box>
            </MockBox>
          </Columns>
        </Box>

        <Box marginLeft={8}>{bottom}</Box>
        {error || paragraph ? (
          <Text
            style={StyleSheet.flatten([
              style.flatten([
                'text-caption2',
                'margin-top-4',
                'margin-left-8',
                ...(getSubTextStyleForErrorOrParagraph(
                  error,
                  paragraph,
                ) as any),
              ]),
            ])}>
            {error || paragraph}
          </Text>
        ) : null}
      </Box>
    );
  },
);

const MockBox: FunctionComponent<
  PropsWithChildren<{
    show: boolean;
  }>
> = ({show, children}) => {
  if (!show) {
    return null;
  }
  return <React.Fragment>{children}</React.Fragment>;
};

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
