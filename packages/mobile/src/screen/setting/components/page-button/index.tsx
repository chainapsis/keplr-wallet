import React, {FunctionComponent} from 'react';
import {Column, Columns} from '../../../../components/column';
import {Box} from '../../../../components/box';
import {Stack} from '../../../../components/stack';
import {StyleSheet, Text} from 'react-native';
import {useStyle} from '../../../../styles';
import {RectButton} from '../../../../components/rect-button';

export interface PageButtonProps {
  title: string | React.ReactNode;
  paragraph?: string;
  titleIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
}

export const PageButton: FunctionComponent<PageButtonProps> = ({
  title,
  paragraph,
  titleIcon,
  endIcon,
  onClick,
}) => {
  const style = useStyle();

  if (onClick) {
    return (
      <RectButton
        rippleColor={style.get('color-gray-550').color}
        underlayColor={style.get('color-gray-550').color}
        style={style.flatten([
          'background-color-card-default',
          'border-radius-6',
        ])}
        onPress={onClick}>
        <Box alignX="center" alignY="center" padding={16} minHeight={74}>
          <Columns sum={1} alignY="center">
            <Column weight={1}>
              <Stack gutter={6}>
                <Columns sum={1} gutter={6} alignY="center">
                  {titleIcon ? <Box>{titleIcon}</Box> : null}
                  <Text
                    style={style.flatten([
                      'color-text-high',
                      'subtitle2',
                      'padding-right-20',
                    ])}>
                    {title}
                  </Text>
                </Columns>
                {paragraph ? (
                  <Text
                    style={StyleSheet.flatten([
                      style.flatten(['color-text-low', 'padding-right-20']),
                    ])}>
                    {paragraph}
                  </Text>
                ) : null}
              </Stack>
            </Column>
            {endIcon ? <Box>{endIcon}</Box> : null}
          </Columns>
        </Box>
      </RectButton>
    );
  }
  return (
    <Box
      alignX="center"
      alignY="center"
      borderRadius={6}
      padding={16}
      minHeight={74}
      backgroundColor={style.get('color-card-default').color}>
      <Columns sum={1} alignY="center">
        <Column weight={1}>
          <Stack gutter={6}>
            <Columns sum={1} gutter={6} alignY="center">
              {titleIcon ? <Box>{titleIcon}</Box> : null}
              <Text
                style={style.flatten([
                  'color-text-high',
                  'subtitle2',
                  'padding-right-20',
                ])}>
                {title}
              </Text>
            </Columns>
            {paragraph ? (
              <Text
                style={StyleSheet.flatten([
                  style.flatten(['color-text-low', 'padding-right-20']),
                ])}>
                {paragraph}
              </Text>
            ) : null}
          </Stack>
        </Column>
        {endIcon ? <Box>{endIcon}</Box> : null}
      </Columns>
    </Box>
  );
};
