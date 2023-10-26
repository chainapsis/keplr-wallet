import React, {FunctionComponent, useState} from 'react';
import {Column, Columns} from '../../../../components/column';
import {Box} from '../../../../components/box';
import {Stack} from '../../../../components/stack';
import {Pressable, Text} from 'react-native';
import {useStyle} from '../../../../styles';

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
  const [isPressing, setIsPressing] = useState(false);
  return (
    <Pressable
      onPressIn={() => setIsPressing(true)}
      onPressOut={() => setIsPressing(false)}
      onPress={
        onClick &&
        (e => {
          e.preventDefault();
          onClick();
        })
      }>
      <Box
        alignX="center"
        alignY="center"
        padding={16}
        borderRadius={6}
        minHeight={74}
        backgroundColor={
          isPressing
            ? style.get('background-color-gray-550').backgroundColor
            : style.get('background-color-gray-600').backgroundColor
        }>
        <Columns sum={1} alignY="center">
          <Column weight={1}>
            <Stack gutter={6}>
              <Columns sum={1} gutter={6} alignY="center">
                {titleIcon ? <Box>{titleIcon}</Box> : null}
                <Text style={style.flatten(['color-text-high', 'subtitle2'])}>
                  {title}
                </Text>
              </Columns>
              {paragraph ? (
                <Text style={style.flatten(['color-text-low', 'width-268'])}>
                  {paragraph}
                </Text>
              ) : null}
            </Stack>
          </Column>
          {endIcon ? <Box>{endIcon}</Box> : null}
        </Columns>
      </Box>
    </Pressable>
  );
};
