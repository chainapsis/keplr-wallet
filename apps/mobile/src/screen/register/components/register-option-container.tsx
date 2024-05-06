import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {Text} from 'react-native';
import {Gutter} from '../../../components/gutter';

export const OptionContainer: FunctionComponent<
  {title: string; paragraph: string} & PropsWithChildren
> = ({title, paragraph, children}) => {
  const style = useStyle();
  return (
    <Box
      width="100%"
      borderRadius={25}
      padding={30}
      backgroundColor={style.get('color-gray-600').color}>
      <Text style={style.flatten(['h4', 'color-text-high'])}>{title}</Text>

      <Gutter size={8} />

      <Text style={style.flatten(['subtitle3', 'color-text-middle'])}>
        {paragraph}
      </Text>

      {children}
    </Box>
  );
};
