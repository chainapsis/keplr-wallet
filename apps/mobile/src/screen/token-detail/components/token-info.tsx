import React, {FunctionComponent} from 'react';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {Text} from 'react-native';
import {Stack} from '../../../components/stack';
import {XAxis} from '../../../components/axis';
import {Gutter} from '../../../components/gutter';

export const TokenInfos: FunctionComponent<{
  title: string;
  infos: {
    title: string;
    text: string;
    textDeco?: 'green';
  }[];
}> = ({title, infos}) => {
  const style = useStyle();

  return (
    <React.Fragment>
      <Text
        style={style.flatten([
          'subtitle4',
          'color-gray-200',
          'padding-left-6',
        ])}>
        {title}
      </Text>

      <Gutter size={8} />

      <Stack gutter={8}>
        {infos.map((info, i) => {
          return (
            <Box
              key={i.toString()}
              backgroundColor={style.get('color-card-default').color}
              borderRadius={6}
              padding={16}>
              <XAxis alignY="center">
                <Text style={style.flatten(['subtitle3', 'color-gray-200'])}>
                  {info.title}
                </Text>
                <Box style={{flex: 1}} />

                <Text
                  style={style.flatten([
                    'subtitle3',
                    info.textDeco === 'green'
                      ? 'color-green-400'
                      : 'color-white',
                  ])}>
                  {info.text}
                </Text>
              </XAxis>
            </Box>
          );
        })}
      </Stack>
    </React.Fragment>
  );
};
