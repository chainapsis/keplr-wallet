import React, {FunctionComponent} from 'react';
import {Stack} from '../../../../components/stack';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {Gutter} from '../../../../components/gutter';
import {Text} from 'react-native';

interface MainEmptyViewProps {
  image: React.ReactNode;
  title: string;
  paragraph: string;
  button: React.ReactNode;
}

export const MainEmptyView: FunctionComponent<MainEmptyViewProps> = ({
  image,
  title,
  paragraph,
  button,
}) => {
  const style = useStyle();
  return (
    <Box marginTop={20} marginBottom={32}>
      <Stack alignX="center" gutter={12}>
        <Box color="red">{image}</Box>
        <Text style={style.flatten(['subtitle1', 'color-white'])}>{title}</Text>
        <Text
          style={style.flatten([
            'body3',
            'padding-y-0',
            'padding-x-30',
            'color-gray-300',
            'text-center',
          ])}>
          {paragraph}
        </Text>

        <Gutter size={12} />
        {button}
      </Stack>
    </Box>
  );
};
